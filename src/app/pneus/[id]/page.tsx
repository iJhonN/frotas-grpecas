"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Trash2, Disc3 } from "lucide-react"

export default function DetalhesPneuPage({
                                             params,
                                         }: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [vehicles, setVehicles] = useState<any[]>([])

    const [formData, setFormData] = useState({
        id_pneu_legado: "",
        vehicle_id: "estoque",
        posicao: "dianteiro_esquerdo",
        marca_modelo: "",
        medida: "",
        vida: "novo",
        status: "em_uso",
        data_instalacao: "",
        km_instalacao: "0",
        km_rodado: "0",
        vida_util_estimada_km: "50000",
        sulco_mm: "8.00",
        custo: "0.00",
        observacoes: "",
    })

    useEffect(() => {
        async function loadPneuAndVehicles() {
            setLoading(true)
            try {
                const [pneuRes, vehRes] = await Promise.all([
                    supabase.from("tires").select("*").eq("id", id).single(),
                    supabase.from("vehicles").select("id, placa, marca, modelo, km_atual").order("placa", { ascending: true }),
                ])

                if (pneuRes.error) throw pneuRes.error
                setVehicles(vehRes.data || [])

                if (pneuRes.data) {
                    const p = pneuRes.data as any
                    setFormData({
                        id_pneu_legado: p.id_pneu_legado || "",
                        vehicle_id: p.vehicle_id || "estoque",
                        posicao: p.posicao || "dianteiro_esquerdo",
                        marca_modelo: p.marca_modelo || "",
                        medida: p.medida || "",
                        vida: p.vida || "novo",
                        status: p.status || "em_uso",
                        data_instalacao: p.data_instalacao ? new Date(p.data_instalacao).toISOString().split("T")[0] : "",
                        km_instalacao: String(p.km_instalacao ?? 0),
                        km_rodado: String(p.km_rodado ?? 0),
                        vida_util_estimada_km: String(p.vida_util_estimada_km ?? 50000),
                        sulco_mm: String(p.sulco_mm ?? 8.00),
                        custo: String(p.custo ?? 0),
                        observacoes: p.observacoes || "",
                    })
                }
            } catch (err) {
                console.error("Erro ao carregar pneu:", err)
                alert("Pneu não encontrado.")
                router.push("/pneus")
            } finally {
                setLoading(false)
            }
        }

        if (id) loadPneuAndVehicles()
    }, [id])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const isEstoque = formData.vehicle_id === "estoque"

            const payload = {
                id_pneu_legado: formData.id_pneu_legado.trim() || null,
                vehicle_id: isEstoque ? null : formData.vehicle_id,
                posicao: isEstoque ? null : formData.posicao,
                marca_modelo: formData.marca_modelo.trim(),
                medida: formData.medida.trim(),
                vida: formData.vida,
                status: isEstoque ? "estoque" : formData.status,
                data_instalacao: isEstoque ? null : formData.data_instalacao || null,
                km_instalacao: isEstoque ? 0 : Number(formData.km_instalacao) || 0,
                km_rodado: Number(formData.km_rodado) || 0,
                vida_util_estimada_km: Number(formData.vida_util_estimada_km) || 50000,
                sulco_mm: Number(String(formData.sulco_mm).replace(",", ".")) || 8.0,
                data_medicao: new Date().toISOString().split("T")[0],
                custo: Number(String(formData.custo).replace(",", ".")) || 0,
                observacoes: formData.observacoes.trim() || null,
            }

            const { error } = await supabase
                .from("tires")
                .update(payload as any)
                .eq("id", id)

            if (error) throw error

            alert("Pneu atualizado com sucesso!")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao atualizar pneu:", err)
            alert(`Erro ao atualizar: ${err.message || "Erro desconhecido"}`)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este pneu?")) return

        setDeleting(true)
        try {
            const { error } = await supabase.from("tires").delete().eq("id", id)
            if (error) throw error

            alert("Pneu excluído com sucesso!")
            router.push("/pneus")
        } catch (err: any) {
            console.error("Erro ao excluir pneu:", err)
            alert("Erro ao excluir registro.")
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Carregando dados do pneu...</span>
            </div>
        )
    }

    const currentVehicleObj = vehicles.find((v) => v.id === formData.vehicle_id)

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/pneus"
                        className={buttonVariants({
                            variant: "outline",
                            size: "icon",
                            className: "h-9 w-9 rounded-xl border-slate-200",
                        })}
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Pneu {formData.id_pneu_legado || "Sem Código"}
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {formData.marca_modelo} ({formData.medida})
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-9 rounded-xl gap-2 text-xs font-medium self-start sm:self-auto"
                >
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Excluir Pneu
                </Button>
            </div>

            <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <Disc3 className="h-4 w-4 text-blue-600" />
                        Informações do Registro
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Código / N° Fogo</Label>
                            <Input
                                value={formData.id_pneu_legado}
                                onChange={(e) => setFormData({ ...formData, id_pneu_legado: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Marca / Modelo *</Label>
                            <Input
                                value={formData.marca_modelo}
                                onChange={(e) => setFormData({ ...formData, marca_modelo: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Medida *</Label>
                            <Input
                                value={formData.medida}
                                onChange={(e) => setFormData({ ...formData, medida: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Vida / Recape *</Label>
                            <Select
                                value={formData.vida}
                                onValueChange={(val) => setFormData({ ...formData, vida: val || "novo" })}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="novo">Pneu Novo</SelectItem>
                                    <SelectItem value="recape_1">1ª Recapagem</SelectItem>
                                    <SelectItem value="recape_2">2ª Recapagem</SelectItem>
                                    <SelectItem value="recape_3">3ª Recapagem</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Sulco Atual (mm) *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.sulco_mm}
                                onChange={(e) => setFormData({ ...formData, sulco_mm: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 font-bold"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Custo (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.custo}
                                onChange={(e) => setFormData({ ...formData, custo: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Instalação & Status</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Veículo Atribuído</Label>
                            <Select
                                value={formData.vehicle_id}
                                onValueChange={(val) =>
                                    setFormData({
                                        ...formData,
                                        vehicle_id: val || "estoque",
                                        status: val === "estoque" ? "estoque" : "em_uso",
                                    })
                                }
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                    <SelectValue placeholder="Selecione o veículo">
                                        {formData.vehicle_id === "estoque"
                                            ? "📦 Em Estoque / Pneu Reserva"
                                            : currentVehicleObj
                                                ? `${currentVehicleObj.placa} - ${currentVehicleObj.marca} ${currentVehicleObj.modelo}`
                                                : undefined}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="estoque">📦 Em Estoque / Pneu Reserva</SelectItem>
                                    {vehicles.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            🚗 {v.placa} - {v.marca} {v.modelo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Status Geral *</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData({ ...formData, status: val || "em_uso" })}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="em_uso">Em Uso</SelectItem>
                                    <SelectItem value="estoque">Em Estoque</SelectItem>
                                    <SelectItem value="em_recapagem">Em Recapagem</SelectItem>
                                    <SelectItem value="descartado">Descartado / Sucata</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {formData.vehicle_id !== "estoque" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Posição no Eixo *</Label>
                                <Select
                                    value={formData.posicao}
                                    onValueChange={(val) => setFormData({ ...formData, posicao: val || "dianteiro_esquerdo" })}
                                >
                                    <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dianteiro_esquerdo">Dianteiro Esquerdo (Motorista)</SelectItem>
                                        <SelectItem value="dianteiro_direito">Dianteiro Direito (Passageiro)</SelectItem>
                                        <SelectItem value="traseiro_externo_esquerdo">Traseiro Ext. Esquerdo</SelectItem>
                                        <SelectItem value="traseiro_interno_esquerdo">Traseiro Int. Esquerdo</SelectItem>
                                        <SelectItem value="traseiro_externo_direito">Traseiro Ext. Direito</SelectItem>
                                        <SelectItem value="traseiro_interno_direito">Traseiro Int. Direito</SelectItem>
                                        <SelectItem value="estepe">Estepe / Reserva do Veículo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Data de Instalação</Label>
                                <Input
                                    type="date"
                                    value={formData.data_instalacao}
                                    onChange={(e) => setFormData({ ...formData, data_instalacao: e.target.value })}
                                    className="h-10 rounded-xl border-slate-200 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">KM na Instalação</Label>
                                <Input
                                    type="number"
                                    value={formData.km_instalacao}
                                    onChange={(e) => setFormData({ ...formData, km_instalacao: e.target.value })}
                                    className="h-10 rounded-xl border-slate-200"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-medium text-slate-700">Observações</Label>
                    <Textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        className="rounded-xl border-slate-200 text-xs min-h-[80px]"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/pneus"
                        className={buttonVariants({ variant: "outline", className: "h-10 rounded-xl" })}
                    >
                        Voltar
                    </Link>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 px-6 rounded-xl font-medium shadow-sm"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Salvar Alterações
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
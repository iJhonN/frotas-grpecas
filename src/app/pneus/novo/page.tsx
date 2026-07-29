"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Save, Loader2, Disc3 } from "lucide-react"

export default function NovoPneuPage() {
    const router = useRouter()
    const supabase = createClient()

    const [submitting, setSubmitting] = useState(false)
    const [loadingVehicles, setLoadingVehicles] = useState(true)
    const [vehicles, setVehicles] = useState<any[]>([])

    const [formData, setFormData] = useState({
        id_pneu_legado: "",
        vehicle_id: "estoque",
        posicao: "dianteiro_esquerdo",
        marca_modelo: "",
        medida: "",
        vida: "novo",
        status: "em_uso",
        data_instalacao: new Date().toISOString().split("T")[0],
        km_instalacao: "0",
        vida_util_estimada_km: "50000",
        sulco_mm: "8.00",
        custo: "0.00",
        observacoes: "",
    })

    useEffect(() => {
        async function loadVehicles() {
            setLoadingVehicles(true)
            try {
                const { data, error } = await supabase
                    .from("vehicles")
                    .select("id, placa, marca, modelo, km_atual")
                    .order("placa", { ascending: true })

                if (error) {
                    console.error("Erro ao buscar veículos:", error)
                } else {
                    setVehicles(data || [])
                }
            } catch (err) {
                console.error("Erro inesperado ao carregar veículos:", err)
            } finally {
                setLoadingVehicles(false)
            }
        }
        loadVehicles()
    }, [])

    const handleVehicleChange = (val: string | null) => {
        const selectedId = val || "estoque"
        const v = vehicles.find((veh) => veh.id === selectedId)

        setFormData((prev) => ({
            ...prev,
            vehicle_id: selectedId,
            km_instalacao: v ? String(v.km_atual || 0) : "0",
            status: selectedId === "estoque" ? "estoque" : "em_uso",
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
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
                data_instalacao: isEstoque ? null : formData.data_instalacao,
                km_instalacao: isEstoque ? 0 : Number(formData.km_instalacao) || 0,
                vida_util_estimada_km: Number(formData.vida_util_estimada_km) || 50000,
                sulco_mm: Number(String(formData.sulco_mm).replace(",", ".")) || 8.0,
                data_medicao: new Date().toISOString().split("T")[0],
                custo: Number(String(formData.custo).replace(",", ".")) || 0,
                observacoes: formData.observacoes.trim() || null,
            }

            const { error } = await supabase.from("tires").insert([payload as any])
            if (error) throw error

            router.push("/pneus")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao cadastrar pneu:", err)
            alert(`Erro ao salvar pneu: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    const currentVehicleObj = vehicles.find((v) => v.id === formData.vehicle_id)

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
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
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Disc3 className="h-6 w-6 text-blue-600" />
                        Cadastrar Novo Pneu
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Cadastre o pneu, atribua ao veículo de destino e defina a posição de montagem
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                {/* 1. Atribuição do Veículo */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                        1. Veículo & Alocação Inicial
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Selecione o Veículo de Destino *</Label>
                            <Select value={formData.vehicle_id} onValueChange={handleVehicleChange}>
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                    <SelectValue placeholder={loadingVehicles ? "Carregando..." : "Selecione o veículo"}>
                                        {formData.vehicle_id === "estoque"
                                            ? "📦 Em Estoque / Pneu Reserva"
                                            : currentVehicleObj
                                                ? `${currentVehicleObj.placa} - ${currentVehicleObj.marca} ${currentVehicleObj.modelo}`
                                                : undefined}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="estoque">
                                        📦 Em Estoque / Pneu Reserva
                                    </SelectItem>
                                    {vehicles.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            🚗 {v.placa} - {v.marca} {v.modelo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.vehicle_id !== "estoque" && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Posição de Montagem no Eixo *</Label>
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
                        )}
                    </div>

                    {formData.vehicle_id !== "estoque" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
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
                                <Label className="text-xs font-medium text-slate-700">KM no Odômetro na Instalação</Label>
                                <Input
                                    type="number"
                                    value={formData.km_instalacao}
                                    onChange={(e) => setFormData({ ...formData, km_instalacao: e.target.value })}
                                    className="h-10 rounded-xl border-slate-200 font-semibold"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Especificações do Pneu */}
                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                        2. Ficha Técnica do Pneu
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Código / N° Fogo (Opcional)</Label>
                            <Input
                                placeholder="Ex: PN-102 ou Gravação"
                                value={formData.id_pneu_legado}
                                onChange={(e) => setFormData({ ...formData, id_pneu_legado: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Marca / Modelo *</Label>
                            <Input
                                placeholder="Ex: Michelin X Multi"
                                value={formData.marca_modelo}
                                onChange={(e) => setFormData({ ...formData, marca_modelo: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Medida / Aro *</Label>
                            <Input
                                placeholder="Ex: 295/80 R22.5"
                                value={formData.medida}
                                onChange={(e) => setFormData({ ...formData, medida: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Condição / Vida *</Label>
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
                            <Label className="text-xs font-medium text-slate-700">Profundidade do Sulco (mm) *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="8.00"
                                value={formData.sulco_mm}
                                onChange={(e) => setFormData({ ...formData, sulco_mm: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 font-bold"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Custo de Aquisição (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.custo}
                                onChange={(e) => setFormData({ ...formData, custo: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 font-semibold"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-medium text-slate-700">Observações</Label>
                    <Textarea
                        placeholder="Anotações sobre alinhamento, rodízio ou histórico do pneu..."
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        className="rounded-xl border-slate-200 text-xs min-h-[70px]"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/pneus"
                        className={buttonVariants({ variant: "outline", className: "h-10 rounded-xl" })}
                    >
                        Cancelar
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
                                Salvar Registro de Pneu
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
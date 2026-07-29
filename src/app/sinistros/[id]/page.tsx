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
import { ArrowLeft, Save, Loader2, Trash2, ShieldAlert } from "lucide-react"

export default function DetalhesSinistroPage({
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
    const [drivers, setDrivers] = useState<any[]>([])
    const [policies, setPolicies] = useState<any[]>([])

    const [formData, setFormData] = useState<{
        vehicle_id: string
        driver_id: string
        tipo: string
        gravidade: string
        culpabilidade: string
        data: string
        descricao_local: string
        numero_bo: string
        tem_seguro: boolean
        apolice_id: string
        franquia: string
        custo_total: string
        reembolso: string
        data_liberacao: string
        dias_parado: string
        status: string
        ref_financeiro: string
        observacoes: string
    }>({
        vehicle_id: "",
        driver_id: "sem_driver",
        tipo: "colisao",
        gravidade: "leve",
        culpabilidade: "motorista_proprio",
        data: "",
        descricao_local: "",
        numero_bo: "",
        tem_seguro: false,
        apolice_id: "sem_apolice",
        franquia: "0.00",
        custo_total: "0.00",
        reembolso: "0.00",
        data_liberacao: "",
        dias_parado: "0",
        status: "em_andamento",
        ref_financeiro: "",
        observacoes: "",
    })

    useEffect(() => {
        async function loadSinistroData() {
            setLoading(true)
            try {
                const [incRes, vehRes, drvRes, polRes] = await Promise.all([
                    supabase.from("incidents").select("*").eq("id", id).single(),
                    supabase.from("vehicles").select("id, placa, marca, modelo").order("placa"),
                    supabase.from("drivers").select("id, nome_completo").order("nome_completo"),
                    supabase.from("insurance_policies").select("id, seguradora, cobertura").order("seguradora"),
                ])

                if (incRes.error) throw incRes.error

                setVehicles(vehRes.data || [])
                setDrivers(drvRes.data || [])
                setPolicies(polRes.data || [])

                if (incRes.data) {
                    const i = incRes.data as any
                    setFormData({
                        vehicle_id: i.vehicle_id || "",
                        driver_id: i.driver_id || "sem_driver",
                        tipo: i.tipo || "colisao",
                        gravidade: i.gravidade || "leve",
                        culpabilidade: i.culpabilidade || "motorista_proprio",
                        data: i.data ? new Date(i.data).toISOString().split("T")[0] : "",
                        descricao_local: i.descricao_local || "",
                        numero_bo: i.numero_bo || "",
                        tem_seguro: !!i.tem_seguro,
                        apolice_id: i.apolice_id || "sem_apolice",
                        franquia: String(i.franquia ?? 0),
                        custo_total: String(i.custo_total ?? 0),
                        reembolso: String(i.reembolso ?? 0),
                        data_liberacao: i.data_liberacao ? new Date(i.data_liberacao).toISOString().split("T")[0] : "",
                        dias_parado: String(i.dias_parado ?? 0),
                        status: i.status || "em_andamento",
                        ref_financeiro: i.ref_financeiro || "",
                        observacoes: i.observacoes || "",
                    })
                }
            } catch (err) {
                console.error("Erro ao carregar sinistro:", err)
                alert("Sinistro não encontrado.")
                router.push("/sinistros")
            } finally {
                setLoading(false)
            }
        }

        if (id) loadSinistroData()
    }, [id])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const payload = {
                vehicle_id: formData.vehicle_id,
                driver_id: formData.driver_id === "sem_driver" ? null : formData.driver_id,
                tipo: formData.tipo,
                gravidade: formData.gravidade,
                culpabilidade: formData.culpabilidade,
                data: formData.data ? new Date(formData.data).toISOString() : new Date().toISOString(),
                descricao_local: formData.descricao_local.trim() || null,
                numero_bo: formData.numero_bo.trim() || null,
                tem_seguro: formData.tem_seguro,
                apolice_id: formData.apolice_id === "sem_apolice" ? null : formData.apolice_id,
                franquia: Number(String(formData.franquia).replace(",", ".")) || 0,
                custo_total: Number(String(formData.custo_total).replace(",", ".")) || 0,
                reembolso: Number(String(formData.reembolso).replace(",", ".")) || 0,
                data_liberacao: formData.data_liberacao || null,
                dias_parado: Number(formData.dias_parado) || 0,
                status: formData.status,
                ref_financeiro: formData.ref_financeiro.trim() || null,
                observacoes: formData.observacoes.trim() || null,
            }

            const { error } = await supabase
                .from("incidents")
                .update(payload as any)
                .eq("id", id)

            if (error) throw error

            alert("Sinistro atualizado com sucesso!")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao atualizar sinistro:", err)
            alert(`Erro ao atualizar: ${err.message || "Erro desconhecido"}`)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este sinistro?")) return

        setDeleting(true)
        try {
            const { error } = await supabase.from("incidents").delete().eq("id", id)
            if (error) throw error

            alert("Sinistro excluído com sucesso!")
            router.push("/sinistros")
        } catch (err: any) {
            console.error("Erro ao excluir sinistro:", err)
            alert("Erro ao excluir registro.")
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                <span className="text-xs font-medium">Carregando dados do sinistro...</span>
            </div>
        )
    }

    const currentVehicleObj = vehicles.find((v) => v.id === formData.vehicle_id)

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/sinistros"
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
                            Sinistro {formData.numero_bo ? `(B.O: ${formData.numero_bo})` : ""}
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {currentVehicleObj ? `${currentVehicleObj.placa} - ${currentVehicleObj.modelo}` : "Veículo N/A"}
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
                    Excluir Registro
                </Button>
            </div>

            <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-rose-600" />
                        1. Envolvidos & Status
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Veículo Envolvido *</Label>
                            <Select
                                value={formData.vehicle_id}
                                onValueChange={(val: string | null) => setFormData((prev) => ({ ...prev, vehicle_id: val || "" }))}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                    <SelectValue placeholder="Escolha o veículo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicles.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            🚗 {v.placa} - {v.marca} {v.modelo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Motorista do Conduto</Label>
                            <Select
                                value={formData.driver_id}
                                onValueChange={(val: string | null) => setFormData((prev) => ({ ...prev, driver_id: val || "sem_driver" }))}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                    <SelectValue placeholder="Selecione o motorista" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sem_driver">Nenhum / Terceiro</SelectItem>
                                    {drivers.map((d) => (
                                        <SelectItem key={d.id} value={d.id}>
                                            👤 {d.nome_completo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Status Geral *</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val: string | null) => setFormData((prev) => ({ ...prev, status: val || "em_andamento" }))}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                                    <SelectItem value="aguardando_oficina">Aguardando Oficina</SelectItem>
                                    <SelectItem value="concluido">Concluído / Liberado</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                        2. Ocorrência & Classificação
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Tipo de Sinistro *</Label>
                            <Select
                                value={formData.tipo}
                                onValueChange={(val: string | null) => setFormData((prev) => ({ ...prev, tipo: val || "colisao" }))}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="colisao">Colisão</SelectItem>
                                    <SelectItem value="abalroamento">Abalroamento</SelectItem>
                                    <SelectItem value="capotamento">Capotamento</SelectItem>
                                    <SelectItem value="roubo_furto">Roubo / Furto</SelectItem>
                                    <SelectItem value="incendio">Incêndio</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Gravidade *</Label>
                            <Select
                                value={formData.gravidade}
                                onValueChange={(val: string | null) => setFormData((prev) => ({ ...prev, gravidade: val || "leve" }))}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="leve">Leve</SelectItem>
                                    <SelectItem value="moderada">Moderada</SelectItem>
                                    <SelectItem value="grave">Grave</SelectItem>
                                    <SelectItem value="perda_total">Perda Total</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Culpabilidade *</Label>
                            <Select
                                value={formData.culpabilidade}
                                onValueChange={(val: string | null) => setFormData((prev) => ({ ...prev, culpabilidade: val || "motorista_proprio" }))}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="motorista_proprio">Motorista Próprio</SelectItem>
                                    <SelectItem value="terceiro">Terceiro</SelectItem>
                                    <SelectItem value="cliente">Cliente</SelectItem>
                                    <SelectItem value="caso_fortuito">Caso Fortuito / Sem Culpa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">N° do B.O.</Label>
                            <Input
                                value={formData.numero_bo}
                                onChange={(e) => setFormData({ ...formData, numero_bo: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Local da Ocorrência</Label>
                            <Input
                                value={formData.descricao_local}
                                onChange={(e) => setFormData({ ...formData, descricao_local: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                        3. Valores & Reembolso
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Custo Total (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.custo_total}
                                onChange={(e) => setFormData({ ...formData, custo_total: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 font-bold"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Franquia Paga (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.franquia}
                                onChange={(e) => setFormData({ ...formData, franquia: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Reembolso Seguro (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.reembolso}
                                onChange={(e) => setFormData({ ...formData, reembolso: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Data de Liberação do Veículo</Label>
                            <Input
                                type="date"
                                value={formData.data_liberacao}
                                onChange={(e) => setFormData({ ...formData, data_liberacao: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Dias de Veículo Parado</Label>
                            <Input
                                type="number"
                                value={formData.dias_parado}
                                onChange={(e) => setFormData({ ...formData, dias_parado: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
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
                        href="/sinistros"
                        className={buttonVariants({ variant: "outline", className: "h-10 rounded-xl" })}
                    >
                        Voltar
                    </Link>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-rose-600 hover:bg-rose-700 text-white gap-2 h-10 px-6 rounded-xl font-medium shadow-sm"
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
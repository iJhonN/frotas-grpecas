"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCompany } from "@/contexts/company-context"
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
import { ArrowLeft, Save, Loader2, ShieldAlert } from "lucide-react"

export default function NovoSinistroPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [submitting, setSubmitting] = useState(false)
    const [vehicles, setVehicles] = useState<any[]>([])
    const [drivers, setDrivers] = useState<any[]>([])
    const [policies, setPolicies] = useState<any[]>([])

    const [formData, setFormData] = useState({
        vehicle_id: "",
        driver_id: "sem_driver",
        tipo: "colisao",
        gravidade: "leve",
        culpabilidade: "motorista_proprio",
        data: new Date().toISOString().split("T")[0],
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
        async function loadOptions() {
            try {
                const [vehRes, drvRes, polRes] = await Promise.all([
                    supabase.from("vehicles").select("id, placa, marca, modelo, company_id").order("placa"),
                    supabase.from("drivers").select("id, nome_completo").order("nome_completo"),
                    supabase.from("insurance_policies").select("id, seguradora, cobertura").order("seguradora"),
                ])
                setVehicles(vehRes.data || [])
                setDrivers(drvRes.data || [])
                setPolicies(polRes.data || [])
            } catch (err) {
                console.error("Erro ao carregar opções:", err)
            }
        }
        loadOptions()
    }, [])

    const selectedVehicleObj = vehicles.find((v) => v.id === formData.vehicle_id)
    const selectedDriverObj = drivers.find((d) => d.id === formData.driver_id)
    const selectedPolicyObj = policies.find((p) => p.id === formData.apolice_id)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.vehicle_id) {
            alert("Selecione o veículo envolvido.")
            return
        }

        const compId = selectedCompany?.id || selectedVehicleObj?.company_id
        if (!compId) {
            alert("Empresa não identificada.")
            return
        }

        setSubmitting(true)
        try {
            const payload = {
                company_id: compId,
                vehicle_id: formData.vehicle_id,
                driver_id: formData.driver_id === "sem_driver" ? null : formData.driver_id,
                tipo: formData.tipo,
                gravidade: formData.gravidade,
                culpabilidade: formData.culpabilidade,
                data: new Date(formData.data).toISOString(),
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

            const { error } = await supabase.from("incidents").insert([payload as any])
            if (error) throw error

            router.push("/sinistros")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao salvar sinistro:", err)
            alert(`Erro ao cadastrar sinistro: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
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
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-rose-600" />
                        Registrar Sinistro
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Preencha os dados da ocorrência, B.O. e estimativa de custos/seguro
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                        1. Envolvidos & Data da Ocorrência
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Veículo Envolvido *</Label>
                            <Select
                                value={formData.vehicle_id}
                                onValueChange={(val: string | null) => setFormData((prev) => ({ ...prev, vehicle_id: val || "" }))}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                    <SelectValue placeholder="Escolha o veículo">
                                        {selectedVehicleObj
                                            ? `🚗 ${selectedVehicleObj.placa} - ${selectedVehicleObj.marca} ${selectedVehicleObj.modelo}`
                                            : undefined}
                                    </SelectValue>
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
                                    <SelectValue placeholder="Selecione o motorista">
                                        {formData.driver_id === "sem_driver"
                                            ? "👤 Nenhum / Terceiro"
                                            : selectedDriverObj
                                                ? `👤 ${selectedDriverObj.nome_completo}`
                                                : undefined}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sem_driver">👤 Nenhum / Terceiro</SelectItem>
                                    {drivers.map((d) => (
                                        <SelectItem key={d.id} value={d.id}>
                                            👤 {d.nome_completo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Data e Hora *</Label>
                            <Input
                                type="date"
                                value={formData.data}
                                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 text-xs"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                        2. Classificação & B.O.
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Tipo de Sinistro *</Label>
                            <Select
                                value={formData.tipo}
                                onValueChange={(val: string | null) => setFormData((prev) => ({ ...prev, tipo: val || "colisao" }))}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                    <SelectValue placeholder="Selecione" />
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
                                    <SelectValue placeholder="Selecione" />
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
                                    <SelectValue placeholder="Selecione" />
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
                                placeholder="Ex: BO-2026-9988"
                                value={formData.numero_bo}
                                onChange={(e) => setFormData({ ...formData, numero_bo: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Local da Ocorrência</Label>
                            <Input
                                placeholder="Ex: Av. Brasil, KM 45"
                                value={formData.descricao_local}
                                onChange={(e) => setFormData({ ...formData, descricao_local: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                        3. Apólice & Financeiro
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Possui Seguro?</Label>
                            <Select
                                value={formData.tem_seguro ? "sim" : "nao"}
                                onValueChange={(val: string | null) => setFormData((prev) => ({ ...prev, tem_seguro: val === "sim" }))}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nao">Não / Sem Seguro</SelectItem>
                                    <SelectItem value="sim">Sim (Acionado)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.tem_seguro && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Apólice Vinculada</Label>
                                <Select
                                    value={formData.apolice_id}
                                    onValueChange={(val: string | null) => setFormData((prev) => ({ ...prev, apolice_id: val || "sem_apolice" }))}
                                >
                                    <SelectTrigger className="h-10 w-full rounded-xl border-slate-200">
                                        <SelectValue placeholder="Selecione a apólice">
                                            {formData.apolice_id === "sem_apolice"
                                                ? "Não associada"
                                                : selectedPolicyObj
                                                    ? `🛡️ ${selectedPolicyObj.seguradora} (${selectedPolicyObj.cobertura})`
                                                    : undefined}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sem_apolice">Não associada</SelectItem>
                                        {policies.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                🛡️ {p.seguradora} ({p.cobertura})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Valor da Franquia (R$)</Label>
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
                        placeholder="Anotações de andamento na oficina ou seguradora..."
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        className="rounded-xl border-slate-200 text-xs min-h-[70px]"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/sinistros"
                        className={buttonVariants({ variant: "outline", className: "h-10 rounded-xl" })}
                    >
                        Cancelar
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
                                Salvar Sinistro
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
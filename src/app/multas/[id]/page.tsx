"use client"

import { useState, useEffect, use } from "react"
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
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react"

export default function DetalhesMultaPage({
                                              params,
                                          }: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const { selectedCompany } = useCompany()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const [vehicles, setVehicles] = useState<any[]>([])
    const [drivers, setDrivers] = useState<any[]>([])

    const [formData, setFormData] = useState({
        data_infracao: "",
        vehicle_id: "",
        driver_id_indicado: "nenhum",
        orgao: "",
        codigo_descricao: "",
        gravidade: "media",
        pontos: "4",
        local: "",
        valor: "0.00",
        vencimento_pagamento: "",
        prazo_indicacao: "",
        status: "pendente",
        ref: "",
        observacoes: "",
    })

    const fetchFine = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("fines")
                .select("*")
                .eq("id", id)
                .single()

            if (error) throw error

            if (data) {
                setFormData({
                    data_infracao: data.data_infracao ? new Date(data.data_infracao).toISOString().slice(0, 16) : "",
                    vehicle_id: data.vehicle_id || "",
                    driver_id_indicado: data.driver_id_indicado || "nenhum",
                    orgao: data.orgao || "",
                    codigo_descricao: data.codigo_descricao || "",
                    gravidade: data.gravidade || "media",
                    pontos: String(data.pontos || "0"),
                    local: data.local || "",
                    valor: String(data.valor || "0.00"),
                    vencimento_pagamento: data.vencimento_pagamento ? data.vencimento_pagamento.split("T")[0] : "",
                    prazo_indicacao: data.prazo_indicacao ? data.prazo_indicacao.split("T")[0] : "",
                    status: data.status || "pendente",
                    ref: data.ref || "",
                    observacoes: data.observacoes || "",
                })
            }

            if (selectedCompany) {
                const [vRes, dRes] = await Promise.all([
                    supabase.from("vehicles").select("id, placa, marca, modelo").eq("company_id", selectedCompany.id),
                    supabase.from("drivers").select("id, nome_completo").eq("company_id", selectedCompany.id)
                ])
                setVehicles(vRes.data || [])
                setDrivers(dRes.data || [])
            }
        } catch (err) {
            console.error("Erro ao carregar multa:", err)
            alert("Multa não encontrada.")
            router.push("/multas")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id === "novo" || id === "nova") return
        if (id) fetchFine()
    }, [id, selectedCompany])

    const handleGravidadeChange = (val: string | null) => {
        const gravidadeVal = val || "media"
        let pts = "4"
        if (gravidadeVal === "leve") pts = "3"
        if (gravidadeVal === "media") pts = "4"
        if (gravidadeVal === "grave") pts = "5"
        if (gravidadeVal === "gravissima") pts = "7"

        setFormData((prev) => ({ ...prev, gravidade: gravidadeVal, pontos: pts }))
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const payload = {
                data_infracao: formData.data_infracao,
                vehicle_id: formData.vehicle_id,
                driver_id_indicado: formData.driver_id_indicado === "nenhum" ? null : formData.driver_id_indicado,
                orgao: formData.orgao.trim(),
                codigo_descricao: formData.codigo_descricao.trim(),
                gravidade: formData.gravidade,
                pontos: Number(formData.pontos) || 0,
                local: formData.local.trim() || null,
                valor: Number(formData.valor) || 0,
                vencimento_pagamento: formData.vencimento_pagamento || null,
                prazo_indicacao: formData.prazo_indicacao || null,
                status: formData.status,
                ref: formData.ref.trim() || null,
                observacoes: formData.observacoes || null,
            }

            const { error } = await supabase.from("fines").update(payload as any).eq("id", id)
            if (error) throw error

            alert("Multa atualizada com sucesso!")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao atualizar multa:", err)
            alert(`Erro ao atualizar: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir esta multa?")) return

        setDeleting(true)
        try {
            const { error } = await supabase.from("fines").delete().eq("id", id)
            if (error) throw error

            alert("Multa excluída com sucesso!")
            router.push("/multas")
        } catch (err) {
            alert("Erro ao excluir multa.")
        } finally {
            setDeleting(false)
        }
    }

    const currentVehicleObj = vehicles.find((v) => v.id === formData.vehicle_id)
    const currentDriverObj = drivers.find((d) => d.id === formData.driver_id_indicado)

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Carregando detalhes da multa...</span>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/multas"
                        className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Editar Multa</h1>
                        <p className="text-xs text-slate-500 mt-0.5">{formData.orgao} - {formData.codigo_descricao}</p>
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
                    Excluir Multa
                </Button>
            </div>

            <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Identificação da Infração</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Veículo Infrator *</Label>
                            <Select value={formData.vehicle_id} onValueChange={(val) => setFormData({ ...formData, vehicle_id: val || "" })} required>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Selecione o veículo">
                                        {currentVehicleObj
                                            ? `${currentVehicleObj.placa} - ${currentVehicleObj.marca} ${currentVehicleObj.modelo}`
                                            : undefined}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicles.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            <span>{v.placa} - {v.marca} {v.modelo}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Motorista Indicado / Condutor</Label>
                            <Select value={formData.driver_id_indicado} onValueChange={(val) => setFormData({ ...formData, driver_id_indicado: val || "nenhum" })}>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Indique o condutor responsável">
                                        {currentDriverObj?.nome_completo}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nenhum">Nenhum condutor indicado ainda</SelectItem>
                                    {drivers.map((d) => (
                                        <SelectItem key={d.id} value={d.id}>
                                            <span>{d.nome_completo}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="data_infracao" className="text-xs font-medium text-slate-700">
                                Data e Hora da Infração *
                            </Label>
                            <Input
                                id="data_infracao"
                                type="datetime-local"
                                value={formData.data_infracao}
                                onChange={(e) => setFormData({ ...formData, data_infracao: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 text-xs"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="orgao" className="text-xs font-medium text-slate-700">
                                Órgão Autuador *
                            </Label>
                            <Input
                                id="orgao"
                                value={formData.orgao}
                                onChange={(e) => setFormData({ ...formData, orgao: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 text-xs"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="ref" className="text-xs font-medium text-slate-700">
                                Nº do Auto de Infração (AIT)
                            </Label>
                            <Input
                                id="ref"
                                value={formData.ref}
                                onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="codigo_descricao" className="text-xs font-medium text-slate-700">
                            Código / Descrição da Infração *
                        </Label>
                        <Input
                            id="codigo_descricao"
                            value={formData.codigo_descricao}
                            onChange={(e) => setFormData({ ...formData, codigo_descricao: e.target.value })}
                            className="h-10 rounded-xl border-slate-200 text-xs"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="local" className="text-xs font-medium text-slate-700">
                            Local da Infração
                        </Label>
                        <Input
                            id="local"
                            value={formData.local}
                            onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                            className="h-10 rounded-xl border-slate-200 text-xs"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Valores, Prazos e Pontuação</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Gravidade *</Label>
                            <Select value={formData.gravidade} onValueChange={handleGravidadeChange}>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="leve">Leve (3 pontos)</SelectItem>
                                    <SelectItem value="media">Média (4 pontos)</SelectItem>
                                    <SelectItem value="grave">Grave (5 pontos)</SelectItem>
                                    <SelectItem value="gravissima">Gravíssima (7 pontos)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="pontos" className="text-xs font-medium text-slate-700">
                                Pontos na CNH
                            </Label>
                            <Input
                                id="pontos"
                                type="number"
                                value={formData.pontos}
                                onChange={(e) => setFormData({ ...formData, pontos: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="valor" className="text-xs font-medium text-slate-700">
                                Valor da Multa (R$) *
                            </Label>
                            <Input
                                id="valor"
                                type="number"
                                step="0.01"
                                value={formData.valor}
                                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 font-bold"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="prazo_indicacao" className="text-xs font-medium text-slate-700">
                                Prazo Limite p/ Indicar Condutor
                            </Label>
                            <Input
                                id="prazo_indicacao"
                                type="date"
                                value={formData.prazo_indicacao}
                                onChange={(e) => setFormData({ ...formData, prazo_indicacao: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="vencimento_pagamento" className="text-xs font-medium text-slate-700">
                                Vencimento do Pagamento
                            </Label>
                            <Input
                                id="vencimento_pagamento"
                                type="date"
                                value={formData.vencimento_pagamento}
                                onChange={(e) => setFormData({ ...formData, vencimento_pagamento: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Status do Pagamento *</Label>
                            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val || "pendente" })}>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pendente">Pendente / Notificado</SelectItem>
                                    <SelectItem value="pago">Pago</SelectItem>
                                    <SelectItem value="recorrida">Em Recurso / Contestação</SelectItem>
                                    <SelectItem value="cancelada">Cancelada / Anulada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="observacoes" className="text-xs font-medium text-slate-700">
                            Observações
                        </Label>
                        <Textarea
                            id="observacoes"
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            className="rounded-xl border-slate-200 text-xs min-h-[70px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/multas"
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
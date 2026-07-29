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
import { ArrowLeft, Save, Loader2 } from "lucide-react"

export default function NovaMultaPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [submitting, setSubmitting] = useState(false)
    const [vehicles, setVehicles] = useState<any[]>([])
    const [drivers, setDrivers] = useState<any[]>([])

    const [formData, setFormData] = useState({
        data_infracao: "",
        vehicle_id: "",
        driver_id_indicado: "nenhum",
        orgao: "DETRAN",
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

    useEffect(() => {
        async function loadOptions() {
            if (!selectedCompany) return
            try {
                const [vRes, dRes] = await Promise.all([
                    supabase.from("vehicles").select("id, placa, marca, modelo").eq("company_id", selectedCompany.id),
                    supabase.from("drivers").select("id, nome_completo").eq("company_id", selectedCompany.id)
                ])

                setVehicles(vRes.data || [])
                setDrivers(dRes.data || [])
            } catch (err) {
                console.error("Erro ao carregar opções:", err)
            }
        }
        loadOptions()
    }, [selectedCompany])

    // Ajusta pontuação automática ao trocar a gravidade
    const handleGravidadeChange = (val: string | null) => {
        const gravidadeVal = val || "media"
        let pts = "4"
        if (gravidadeVal === "leve") pts = "3"
        if (gravidadeVal === "media") pts = "4"
        if (gravidadeVal === "grave") pts = "5"
        if (gravidadeVal === "gravissima") pts = "7"

        setFormData((prev) => ({ ...prev, gravidade: gravidadeVal, pontos: pts }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCompany) return

        setSubmitting(true)
        try {
            const payload = {
                company_id: selectedCompany.id,
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

            const { error } = await supabase.from("fines").insert([payload as any])
            if (error) throw error

            router.push("/multas")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao cadastrar multa:", err)
            alert(`Erro ao salvar: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    const currentVehicleObj = vehicles.find((v) => v.id === formData.vehicle_id)
    const currentDriverObj = drivers.find((d) => d.id === formData.driver_id_indicado)

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Link
                    href="/multas"
                    className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                >
                    <ArrowLeft className="h-4 w-4 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cadastrar Nova Multa</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Registre infrações, indicação do condutor e valores de notificação</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
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
                                placeholder="Ex: PRF, DETRAN, DER, SEMTRAN"
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
                                placeholder="Ex: AIT-902182"
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
                            placeholder="Ex: 745-50 - Transitar em velocidade superior à máxima permitida em até 20%"
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
                            placeholder="Ex: BR-101 KM 120 - João Pessoa/PB"
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
                            placeholder="Anotações sobre desconto em folha, protocolo de recurso..."
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
                                Salvar Multa
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
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
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

export default function NovaManutencaoPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [submitting, setSubmitting] = useState(false)
    const [vehicles, setVehicles] = useState<any[]>([])

    const [formData, setFormData] = useState({
        data: new Date().toISOString().split("T")[0],
        vehicle_id: "",
        tipo: "corretiva",
        descricao: "",
        km: "",
        fornecedor: "",
        parte_relacionada: false,
        valor_pecas: "0.00",
        valor_mao_obra: "0.00",
        nota_fiscal: false,
        numero_nf: "",
        status: "concluida",
        proxima_revisao_km: "",
        proxima_revisao_data: "",
        ref_financeiro: "",
        dias_parado: "0",
        observacoes: "",
    })

    useEffect(() => {
        async function loadVehicles() {
            if (!selectedCompany) return
            try {
                const { data } = await supabase
                    .from("vehicles")
                    .select("id, placa, marca, modelo, km_atual")
                    .eq("company_id", selectedCompany.id)
                setVehicles(data || [])
            } catch (err) {
                console.error("Erro ao carregar veículos:", err)
            }
        }
        loadVehicles()
    }, [selectedCompany])

    const handleVehicleChange = (vId: string | null) => {
        if (!vId) return
        const v = vehicles.find((veh) => veh.id === vId)
        setFormData((prev) => ({
            ...prev,
            vehicle_id: vId,
            km: v ? String(v.km_atual) : prev.km,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCompany) return

        setSubmitting(true)
        try {
            const payload = {
                company_id: selectedCompany.id,
                vehicle_id: formData.vehicle_id,
                data: formData.data,
                tipo: formData.tipo,
                descricao: formData.descricao.trim(),
                km: Number(formData.km) || 0,
                fornecedor: formData.fornecedor.trim(),
                parte_relacionada: formData.parte_relacionada,
                valor_pecas: Number(formData.valor_pecas) || 0,
                valor_mao_obra: Number(formData.valor_mao_obra) || 0,
                nota_fiscal: formData.nota_fiscal,
                numero_nf: formData.numero_nf.trim() || null,
                status: formData.status,
                proxima_revisao_km: formData.proxima_revisao_km ? Number(formData.proxima_revisao_km) : null,
                proxima_revisao_data: formData.proxima_revisao_data || null,
                ref_financeiro: formData.ref_financeiro.trim() || null,
                dias_parado: Number(formData.dias_parado) || 0,
                observacoes: formData.observacoes || null,
            }

            const { error } = await supabase.from("maintenances").insert([payload as any])
            if (error) throw error

            // Se o KM registrado for maior que o KM atual do veículo, atualiza a tabela vehicles
            const selectedVeh = vehicles.find((v) => v.id === formData.vehicle_id)
            if (selectedVeh && Number(formData.km) > Number(selectedVeh.km_atual)) {
                await supabase
                    .from("vehicles")
                    .update({ km_atual: Number(formData.km) })
                    .eq("id", formData.vehicle_id)
            }

            router.push("/manutencoes")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao registrar manutenção:", err)
            alert(`Erro ao salvar: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    const totalCalculado = (Number(formData.valor_pecas) || 0) + (Number(formData.valor_mao_obra) || 0)
    const currentVehicleObj = vehicles.find((v) => v.id === formData.vehicle_id)

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Link
                    href="/manutencoes"
                    className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                >
                    <ArrowLeft className="h-4 w-4 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registrar Manutenção</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Cadastre o serviço realizado, fornecedor, notas e custos de frota</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Identificação & Serviço</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Veículo *</Label>
                            <Select value={formData.vehicle_id} onValueChange={(val) => handleVehicleChange(val)} required>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Selecione um veículo">
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
                            <Label className="text-xs font-medium text-slate-700">Tipo de Manutenção *</Label>
                            <Select
                                value={formData.tipo}
                                onValueChange={(val) => setFormData({ ...formData, tipo: val || "corretiva" })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="preventiva">Preventiva</SelectItem>
                                    <SelectItem value="corretiva">Corretiva</SelectItem>
                                    <SelectItem value="preditiva">Preditiva</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="data" className="text-xs font-medium text-slate-700">
                                Data do Serviço *
                            </Label>
                            <Input
                                id="data"
                                type="date"
                                value={formData.data}
                                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="km" className="text-xs font-medium text-slate-700">
                                KM no Odômetro *
                            </Label>
                            <Input
                                id="km"
                                type="number"
                                value={formData.km}
                                onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="dias_parado" className="text-xs font-medium text-slate-700">
                                Dias Parado na Oficina
                            </Label>
                            <Input
                                id="dias_parado"
                                type="number"
                                value={formData.dias_parado}
                                onChange={(e) => setFormData({ ...formData, dias_parado: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="descricao" className="text-xs font-medium text-slate-700">
                            Descrição do Serviço / Peças Trocadas *
                        </Label>
                        <Textarea
                            id="descricao"
                            placeholder="Ex: Troca de óleo do motor, filtro de combustível e pastilhas de freio dianteiras"
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            className="rounded-xl border-slate-200 text-xs min-h-[70px]"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Fornecedor & Valores</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="fornecedor" className="text-xs font-medium text-slate-700">
                                Oficina / Fornecedor *
                            </Label>
                            <Input
                                id="fornecedor"
                                placeholder="Ex: Auto Mecânica Silva"
                                value={formData.fornecedor}
                                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="ref_financeiro" className="text-xs font-medium text-slate-700">
                                Ref. Financeiro / Custo
                            </Label>
                            <Input
                                id="ref_financeiro"
                                placeholder="Ex: Lançamento nº 4021"
                                value={formData.ref_financeiro}
                                onChange={(e) => setFormData({ ...formData, ref_financeiro: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="valor_pecas" className="text-xs font-medium text-slate-700">
                                Valor Peças (R$) *
                            </Label>
                            <Input
                                id="valor_pecas"
                                type="number"
                                step="0.01"
                                value={formData.valor_pecas}
                                onChange={(e) => setFormData({ ...formData, valor_pecas: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="valor_mao_obra" className="text-xs font-medium text-slate-700">
                                Valor Mão de Obra (R$) *
                            </Label>
                            <Input
                                id="valor_mao_obra"
                                type="number"
                                step="0.01"
                                value={formData.valor_mao_obra}
                                onChange={(e) => setFormData({ ...formData, valor_mao_obra: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Valor Total Estimado (R$)</Label>
                            <Input
                                disabled
                                value={totalCalculado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                className="h-10 rounded-xl border-slate-200 bg-slate-50 font-bold text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6 pt-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="nota_fiscal"
                                checked={formData.nota_fiscal}
                                onCheckedChange={(checked) => setFormData({ ...formData, nota_fiscal: !!checked })}
                            />
                            <Label htmlFor="nota_fiscal" className="text-xs text-slate-700 font-medium cursor-pointer">
                                Emitiu Nota Fiscal
                            </Label>
                        </div>

                        {formData.nota_fiscal && (
                            <div className="flex-1 max-w-xs space-y-1">
                                <Input
                                    placeholder="Número da Nota Fiscal"
                                    value={formData.numero_nf}
                                    onChange={(e) => setFormData({ ...formData, numero_nf: e.target.value })}
                                    className="h-8 text-xs rounded-lg border-slate-200"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Previsão da Próxima Revisão</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="proxima_revisao_km" className="text-xs font-medium text-slate-700">
                                Próxima Revisão em (KM)
                            </Label>
                            <Input
                                id="proxima_revisao_km"
                                type="number"
                                placeholder="Ex: 150000"
                                value={formData.proxima_revisao_km}
                                onChange={(e) => setFormData({ ...formData, proxima_revisao_km: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="proxima_revisao_data" className="text-xs font-medium text-slate-700">
                                Próxima Revisão em (Data)
                            </Label>
                            <Input
                                id="proxima_revisao_data"
                                type="date"
                                value={formData.proxima_revisao_data}
                                onChange={(e) => setFormData({ ...formData, proxima_revisao_data: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="observacoes" className="text-xs font-medium text-slate-700">
                            Observações Gerais
                        </Label>
                        <Textarea
                            id="observacoes"
                            placeholder="Garantia das peças, detalhes adicionais ou orientações para o condutor..."
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            className="rounded-xl border-slate-200 text-xs min-h-[70px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/manutencoes"
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
                                Salvar Manutenção
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
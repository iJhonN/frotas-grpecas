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
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react"

export default function DetalhesManutencaoPage({
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

    const [formData, setFormData] = useState({
        data: "",
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

    const fetchMaintenance = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("maintenances")
                .select("*")
                .eq("id", id)
                .single()

            if (error) throw error

            if (data) {
                setFormData({
                    data: data.data ? data.data.split("T")[0] : "",
                    vehicle_id: data.vehicle_id || "",
                    tipo: data.tipo || "corretiva",
                    descricao: data.descricao || "",
                    km: String(data.km || "0"),
                    fornecedor: data.fornecedor || "",
                    parte_relacionada: data.parte_relacionada || false,
                    valor_pecas: String(data.valor_pecas || "0.00"),
                    valor_mao_obra: String(data.valor_mao_obra || "0.00"),
                    nota_fiscal: data.nota_fiscal || false,
                    numero_nf: data.numero_nf || "",
                    status: data.status || "concluida",
                    proxima_revisao_km: data.proxima_revisao_km ? String(data.proxima_revisao_km) : "",
                    proxima_revisao_data: data.proxima_revisao_data ? data.proxima_revisao_data.split("T")[0] : "",
                    ref_financeiro: data.ref_financeiro || "",
                    dias_parado: String(data.dias_parado || "0"),
                    observacoes: data.observacoes || "",
                })
            }

            if (selectedCompany) {
                const { data: vehs } = await supabase
                    .from("vehicles")
                    .select("id, placa, marca, modelo, km_atual")
                    .eq("company_id", selectedCompany.id)
                setVehicles(vehs || [])
            }
        } catch (err) {
            console.error("Erro ao carregar manutenção:", err)
            alert("Manutenção não encontrada.")
            router.push("/manutencoes")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id === "novo" || id === "nova") return
        if (id) fetchMaintenance()
    }, [id, selectedCompany])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const payload = {
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

            const { error } = await supabase
                .from("maintenances")
                .update(payload as any)
                .eq("id", id)

            if (error) throw error

            alert("Manutenção atualizada com sucesso!")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao atualizar manutenção:", err)
            alert(`Erro ao atualizar: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este registro de manutenção?")) return

        setDeleting(true)
        try {
            const { error } = await supabase.from("maintenances").delete().eq("id", id)
            if (error) throw error

            alert("Manutenção excluída com sucesso!")
            router.push("/manutencoes")
        } catch (err) {
            alert("Erro ao excluir registro.")
        } finally {
            setDeleting(false)
        }
    }

    const totalCalculado = (Number(formData.valor_pecas) || 0) + (Number(formData.valor_mao_obra) || 0)
    const currentVehicleObj = vehicles.find((v) => v.id === formData.vehicle_id)

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Carregando registro de manutenção...</span>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/manutencoes"
                        className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Editar Manutenção</h1>
                        <p className="text-xs text-slate-500 mt-0.5">{formData.descricao}</p>
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
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Identificação & Serviço</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Veículo *</Label>
                            <Select value={formData.vehicle_id} onValueChange={(val) => setFormData({ ...formData, vehicle_id: val || "" })} required>
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
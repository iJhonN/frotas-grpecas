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
import { ArrowLeft, Save, Loader2, Trash2, FileText } from "lucide-react"

export default function DetalhesDocumentoPage({
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
        vehicle_id: "",
        tipo_documento: "crlv",
        ref_ano: String(new Date().getFullYear()),
        data_vencimento: "",
        valor: "",
        situacao: "em_dia",
        comprovante_ref: "",
        observacoes: "",
    })

    useEffect(() => {
        async function loadDocumentAndVehicles() {
            setLoading(true)
            try {
                const [docRes, vehRes] = await Promise.all([
                    supabase.from("vehicle_documents").select("*").eq("id", id).single(),
                    supabase.from("vehicles").select("id, placa, marca, modelo"),
                ])

                if (docRes.error) throw docRes.error
                setVehicles(vehRes.data || [])

                if (docRes.data) {
                    const doc = docRes.data as any
                    setFormData({
                        vehicle_id: doc.vehicle_id || "",
                        tipo_documento: doc.tipo_documento || "crlv",
                        ref_ano: String(doc.ref_ano || new Date().getFullYear()),
                        data_vencimento: doc.data_vencimento ? new Date(doc.data_vencimento).toISOString().split("T")[0] : "",
                        valor: doc.valor !== null && doc.valor !== undefined ? String(doc.valor) : "",
                        situacao: doc.situacao || "em_dia",
                        comprovante_ref: doc.comprovante_ref || "",
                        observacoes: doc.observacoes || "",
                    })
                }
            } catch (err) {
                console.error("Erro ao carregar documento:", err)
                alert("Documento não encontrado.")
                router.push("/documentos")
            } finally {
                setLoading(false)
            }
        }

        if (id) loadDocumentAndVehicles()
    }, [id])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const payload = {
                vehicle_id: formData.vehicle_id,
                tipo_documento: formData.tipo_documento,
                ref_ano: Number(formData.ref_ano),
                data_vencimento: new Date(formData.data_vencimento).toISOString(),
                valor: formData.valor ? Number(formData.valor) : null,
                situacao: formData.situacao,
                comprovante_ref: formData.comprovante_ref.trim() || null,
                observacoes: formData.observacoes.trim() || null,
            }

            const { error } = await supabase
                .from("vehicle_documents")
                .update(payload as any)
                .eq("id", id)

            if (error) throw error

            alert("Documento atualizado com sucesso!")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao atualizar documento:", err)
            alert(`Erro ao atualizar: ${err.message || "Erro desconhecido"}`)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este documento?")) return

        setDeleting(true)
        try {
            const { error } = await supabase.from("vehicle_documents").delete().eq("id", id)
            if (error) throw error

            alert("Documento excluído com sucesso!")
            router.push("/documentos")
        } catch (err: any) {
            console.error("Erro ao excluir documento:", err)
            alert("Erro ao excluir documento.")
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Carregando dados do documento...</span>
            </div>
        )
    }

    const currentVehicleObj = vehicles.find((v) => v.id === formData.vehicle_id)

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/documentos"
                        className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Detalhes do Documento</h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {currentVehicleObj ? `${currentVehicleObj.placa} - ${currentVehicleObj.modelo}` : "Veículo vinculado"}
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
                    Excluir Documento
                </Button>
            </div>

            <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        Identificação do Documento
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Veículo *</Label>
                            <Select
                                value={formData.vehicle_id}
                                onValueChange={(val) => setFormData({ ...formData, vehicle_id: val || "" })}
                                required
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Selecione um veículo">
                                        {currentVehicleObj ? `${currentVehicleObj.placa} - ${currentVehicleObj.modelo}` : undefined}
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
                            <Label className="text-xs font-medium text-slate-700">Tipo de Documento *</Label>
                            <Select
                                value={formData.tipo_documento}
                                onValueChange={(val) => setFormData({ ...formData, tipo_documento: val || "crlv" })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="crlv">CRLV / Licenciamento</SelectItem>
                                    <SelectItem value="ipva">IPVA</SelectItem>
                                    <SelectItem value="seguro_dpvat">DPVAT / Seguro Obrigatório</SelectItem>
                                    <SelectItem value="tacografo">Aferição de Tacógrafo</SelectItem>
                                    <SelectItem value="antt">Licença ANTT</SelectItem>
                                    <SelectItem value="outro">Outro Documento</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Ano Exercício *</Label>
                            <Input
                                type="number"
                                value={formData.ref_ano}
                                onChange={(e) => setFormData({ ...formData, ref_ano: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Data de Vencimento *</Label>
                            <Input
                                type="date"
                                value={formData.data_vencimento}
                                onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Valor Pago / Taxa (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.valor}
                                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Situação & Arquivo</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Situação do Documento *</Label>
                            <Select
                                value={formData.situacao}
                                onValueChange={(val) => setFormData({ ...formData, situacao: val || "em_dia" })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="em_dia">Em dia / Regular</SelectItem>
                                    <SelectItem value="a_vencer">A Vencer</SelectItem>
                                    <SelectItem value="vencido">Vencido / Irregular</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Link / Ref. do Comprovante</Label>
                            <Input
                                placeholder="Link do arquivo ou código do recibo"
                                value={formData.comprovante_ref}
                                onChange={(e) => setFormData({ ...formData, comprovante_ref: e.target.value })}
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
                        href="/documentos"
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
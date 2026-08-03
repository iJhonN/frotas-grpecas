"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { compressImage } from "@/lib/utils/image-compressor"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2, Trash2, AlertTriangle, ExternalLink, Camera, X } from "lucide-react"

export default function DetalhesAbastecimentoPage({
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

    // Estado do Anexo
    const [evidenciaUrl, setEvidenciaUrl] = useState<string | null>(null)
    const [newFile, setNewFile] = useState<{ file: File | null; preview: string | null }>({
        file: null,
        preview: null,
    })

    const [formData, setFormData] = useState({
        company_id: "",
        vehicle_id: "",
        driver_id: "",
        placa: "",
        data: "",
        km_odometro: "",
        litros: "",
        valor_total: "",
        valor_por_litro: "",
        combustivel: "diesel",
        posto_fornecedor: "",
        forma_pagamento: "faturado",
        nota_fiscal_ref: "",
        consumo_kml: null as number | null,
        alerta: false,
        observacoes: "",
    })

    useEffect(() => {
        async function fetchRecord() {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from("fuel_records")
                    .select("*, vehicles(placa)")
                    .eq("id", id)
                    .single()

                if (error) throw error

                if (data) {
                    setFormData({
                        company_id: data.company_id || "",
                        vehicle_id: data.vehicle_id || "",
                        driver_id: data.driver_id || "",
                        placa: data.vehicles?.placa || "VEICULO",
                        data: data.data ? new Date(data.data).toISOString().split("T")[0] : "",
                        km_odometro: String(data.km_odometro || ""),
                        litros: String(data.litros || ""),
                        valor_total: String(data.valor_total || ""),
                        valor_por_litro: String(data.valor_por_litro || ""),
                        combustivel: data.combustivel || "diesel",
                        posto_fornecedor: data.posto_fornecedor || "",
                        forma_pagamento: data.forma_pagamento || "faturado",
                        nota_fiscal_ref: data.nota_fiscal_ref || "",
                        consumo_kml: data.consumo_kml,
                        alerta: data.alerta || false,
                        observacoes: data.observacoes || "",
                    })
                    setEvidenciaUrl(data.evidencia_link || null)
                }
            } catch (err) {
                console.error("Erro ao carregar abastecimento:", err)
                alert("Abastecimento não encontrado.")
                router.push("/abastecimentos")
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchRecord()
    }, [id])

    const handleFileChange = (file: File | null) => {
        if (!file) return
        const previewUrl = URL.createObjectURL(file)
        setNewFile({ file, preview: previewUrl })
    }

    const removeNewFile = () => {
        setNewFile({ file: null, preview: null })
    }

    // Compressão e Upload para o bucket "comprovantes"
    const uploadAndCompressComprovante = async (file: File) => {
        const compressedBlob = await compressImage(file, 1024, 0.65)
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `${formData.company_id}/${formData.placa.toUpperCase()}/${Date.now()}_comprovante.${fileExt}`

        const { error } = await supabase.storage
            .from("comprovantes")
            .upload(fileName, compressedBlob, {
                contentType: file.type || "image/jpeg",
                upsert: true,
            })

        if (error) throw error

        const { data: publicUrlData } = supabase.storage
            .from("comprovantes")
            .getPublicUrl(fileName)

        return publicUrlData.publicUrl
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            let finalEvidenciaUrl = evidenciaUrl

            // Se uma nova foto foi selecionada, faz o upload comprimido
            if (newFile.file) {
                finalEvidenciaUrl = await uploadAndCompressComprovante(newFile.file)
            }

            const payload = {
                data: new Date(formData.data).toISOString(),
                km_odometro: Number(formData.km_odometro),
                litros: Number(formData.litros),
                valor_total: Number(formData.valor_total),
                valor_por_litro: Number(formData.valor_por_litro),
                combustivel: formData.combustivel,
                posto_fornecedor: formData.posto_fornecedor,
                forma_pagamento: formData.forma_pagamento,
                nota_fiscal_ref: formData.nota_fiscal_ref || null,
                evidencia_link: finalEvidenciaUrl,
                observacoes: formData.observacoes || null,
            }

            const { error } = await supabase
                .from("fuel_records")
                .update(payload as any)
                .eq("id", id)

            if (error) throw error

            setEvidenciaUrl(finalEvidenciaUrl)
            setNewFile({ file: null, preview: null })
            alert("Abastecimento atualizado com sucesso!")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao atualizar:", err)
            alert(`Erro ao atualizar: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este abastecimento?")) return

        setDeleting(true)
        try {
            const { error } = await supabase.from("fuel_records").delete().eq("id", id)
            if (error) throw error

            alert("Abastecimento excluído com sucesso!")
            router.push("/abastecimentos")
        } catch (err: any) {
            console.error("Erro ao excluir:", err)
            alert("Erro ao excluir abastecimento.")
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Carregando registro de abastecimento...</span>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/abastecimentos"
                        className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Detalhes do Abastecimento</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Posto {formData.posto_fornecedor}</p>
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

            {formData.alerta && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                    <div>
                        <h3 className="text-sm font-bold text-rose-800">Alerta de Consumo Elevado</h3>
                        <p className="text-xs text-rose-600 mt-0.5">
                            O rendimento registrado ({formData.consumo_kml} km/L) está significativamente abaixo da meta estipulada para este veículo.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Data *</Label>
                        <Input
                            type="date"
                            value={formData.data}
                            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">KM Odômetro *</Label>
                        <Input
                            type="number"
                            value={formData.km_odometro}
                            onChange={(e) => setFormData({ ...formData, km_odometro: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Consumo Calculado</Label>
                        <div className="h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center px-3">
                            <span className="text-xs font-bold text-slate-800">
                                {formData.consumo_kml ? `${formData.consumo_kml} KM/L` : "Não calculado"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Litros *</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.litros}
                            onChange={(e) => setFormData({ ...formData, litros: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Valor Total (R$) *</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.valor_total}
                            onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Valor / Litro (R$) *</Label>
                        <Input
                            type="number"
                            step="0.001"
                            value={formData.valor_por_litro}
                            onChange={(e) => setFormData({ ...formData, valor_por_litro: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Posto / Fornecedor *</Label>
                        <Input
                            value={formData.posto_fornecedor}
                            onChange={(e) => setFormData({ ...formData, posto_fornecedor: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Nota / Cupom Fiscal</Label>
                        <Input
                            value={formData.nota_fiscal_ref}
                            onChange={(e) => setFormData({ ...formData, nota_fiscal_ref: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                        />
                    </div>
                </div>

                {/* Seção de Exibição e Alteração do Comprovante */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                    <Label className="text-xs font-medium text-slate-700 block">Comprovante / Cupom Fiscal</Label>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center gap-4">
                        {/* Preview da Imagem Atual ou da Nova Selecionada */}
                        {(newFile.preview || evidenciaUrl) ? (
                            <div className="relative group shrink-0">
                                <img
                                    src={newFile.preview || evidenciaUrl!}
                                    alt="Comprovante"
                                    className="h-32 w-32 object-cover rounded-xl border border-slate-200 bg-white shadow-xs"
                                />
                                {newFile.preview ? (
                                    <button
                                        type="button"
                                        onClick={removeNewFile}
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-sm"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                ) : (
                                    <a
                                        href={evidenciaUrl!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 bg-slate-900/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-[10px] font-semibold"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>Abrir</span>
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="h-24 w-24 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0">
                                <Camera className="h-6 w-6 mb-1 text-slate-300" />
                                <span className="text-[10px]">Sem foto</span>
                            </div>
                        )}

                        {/* Botões de Ação e Alteração */}
                        <div className="flex flex-col gap-2 w-full">
                            {evidenciaUrl && !newFile.preview && (
                                <a
                                    href={evidenciaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={buttonVariants({
                                        variant: "outline",
                                        className: "h-9 w-fit rounded-xl text-xs gap-1.5 bg-white border-slate-200"
                                    })}
                                >
                                    <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                                    <span>Visualizar em tamanho real</span>
                                </a>
                            )}

                            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100/80 transition-colors text-xs font-semibold text-slate-700 w-fit">
                                <Camera className="h-4 w-4 text-slate-500" />
                                <span>{evidenciaUrl ? "Substituir foto" : "Anexar foto do comprovante"}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                />
                            </label>
                            <span className="text-[10px] text-slate-400">A imagem será comprimida automaticamente antes de salvar.</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Observações</Label>
                    <Textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        className="rounded-xl border-slate-200 text-xs min-h-[80px]"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/abastecimentos"
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
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Loader2, Trash2, FileText, ExternalLink, Upload, Check, ChevronsUpDown, AlertTriangle, CheckCircle2, FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DetalhesDocumentoPage({
                                                  params,
                                              }: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const supabase = createClient()

    const currentYear = new Date().getFullYear()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [vehicles, setVehicles] = useState<any[]>([])

    const [openVehiclePopover, setOpenVehiclePopover] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null)

    const [formData, setFormData] = useState({
        company_id: "",
        vehicle_id: "",
        tipo_documento: "crlv",
        ref_ano: String(currentYear),
        comprovante_ref: "",
        observacoes: "",
    })

    const anoExercicioNum = Number(formData.ref_ano) || currentYear
    const isVencido = anoExercicioNum < currentYear
    const situacaoCalculada = isVencido ? "vencido" : "em_dia"

    useEffect(() => {
        async function loadDocumentAndVehicles() {
            setLoading(true)
            try {
                const [docRes, vehRes] = await Promise.all([
                    supabase.from("vehicle_documents").select("*").eq("id", id).single(),
                    supabase.from("vehicles").select("id, placa, marca, modelo, company_id"),
                ])

                if (docRes.error) throw docRes.error
                setVehicles(vehRes.data || [])

                if (docRes.data) {
                    const doc = docRes.data as any
                    setFormData({
                        company_id: doc.company_id || "",
                        vehicle_id: doc.vehicle_id || "",
                        tipo_documento: doc.tipo_documento || "crlv",
                        ref_ano: String(doc.ref_ano || currentYear),
                        comprovante_ref: doc.comprovante_ref || "",
                        observacoes: doc.observacoes || "",
                    })

                    const matchedVehicle = vehRes.data?.find((v) => v.id === doc.vehicle_id)
                    setSelectedVehicle(matchedVehicle || null)
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

    const handleVehicleSelect = (vId: string) => {
        const veh = vehicles.find((v) => v.id === vId)
        setSelectedVehicle(veh || null)
        setFormData((prev) => ({ ...prev, vehicle_id: vId }))
        setOpenVehiclePopover(false)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const companyFolder = formData.company_id || selectedVehicle?.company_id || "geral"

        setUploading(true)
        try {
            const fileExt = file.name.split(".").pop()
            const fileName = `${companyFolder}/${Date.now()}_documento.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from("documents")
                .upload(fileName, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from("documents").getPublicUrl(fileName)
            setFormData((prev) => ({ ...prev, comprovante_ref: data.publicUrl }))
        } catch (err: any) {
            console.error("Erro ao fazer upload:", err)
            alert(`Erro no upload: ${err.message || "Certifique-se de que o bucket 'documents' está configurado."}`)
        } finally {
            setUploading(false)
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const dateOnlyVencimento = `${anoExercicioNum}-12-31`

            const payload = {
                company_id: formData.company_id || selectedVehicle?.company_id,
                vehicle_id: formData.vehicle_id,
                tipo_documento: formData.tipo_documento.toLowerCase(),
                ref_ano: anoExercicioNum,
                data_vencimento: dateOnlyVencimento,
                valor: null,
                situacao: situacaoCalculada,
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
    const isPdf = formData.comprovante_ref?.toLowerCase().includes(".pdf")

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
                            {currentVehicleObj ? `${currentVehicleObj.placa} - ${currentVehicleObj.marca} ${currentVehicleObj.modelo}` : "Veículo vinculado"}
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
                        {/* Busca de Veículo */}
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="text-xs font-medium text-slate-700">Veículo *</Label>
                            <Popover open={openVehiclePopover} onOpenChange={setOpenVehiclePopover}>
                                <PopoverTrigger className="h-10 w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 hover:bg-slate-50 transition-colors">
                                    {currentVehicleObj ? (
                                        <span className="truncate">
                                            {currentVehicleObj.placa} - {currentVehicleObj.marca} {currentVehicleObj.modelo}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">Buscar por placa ou modelo...</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </PopoverTrigger>
                                <PopoverContent className="w-[320px] sm:w-[380px] p-0 rounded-xl border border-slate-200 bg-white shadow-xl z-50" align="start">
                                    <Command className="bg-white rounded-xl">
                                        <CommandInput placeholder="Digite a placa, marca ou modelo..." className="h-9 text-xs" />
                                        <CommandList className="max-h-[220px] overflow-y-auto p-1">
                                            <CommandEmpty className="py-3 text-center text-xs text-slate-500">
                                                Nenhum veículo encontrado.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {vehicles.map((v) => (
                                                    <CommandItem
                                                        key={v.id}
                                                        value={`${v.placa} ${v.marca} ${v.modelo}`}
                                                        onSelect={() => handleVehicleSelect(v.id)}
                                                        className="text-xs rounded-lg cursor-pointer py-2 px-2 hover:bg-slate-100"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-3.5 w-3.5 text-blue-600",
                                                                formData.vehicle_id === v.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <span className="font-semibold text-slate-900 mr-1.5">{v.placa}</span>
                                                        <span className="text-slate-500 truncate">{v.marca} {v.modelo}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Tipo de Documento */}
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="text-xs font-medium text-slate-700">Tipo de Documento *</Label>
                            <Select
                                value={formData.tipo_documento}
                                onValueChange={(val) => setFormData({ ...formData, tipo_documento: val || "crlv" })}
                            >
                                <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white px-3 text-xs flex items-center justify-between">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 bg-white min-w-[280px]">
                                    <SelectItem value="crlv">CRLV Digital / Licenciamento</SelectItem>
                                    <SelectItem value="ipva">IPVA</SelectItem>
                                    <SelectItem value="seguro_dpvat">Seguro OBRIGATÓRIO / DPVAT</SelectItem>
                                    <SelectItem value="seguro_apolice">Apólice de Seguro Privado</SelectItem>
                                    <SelectItem value="tacografo">Laudo do Tacógrafo</SelectItem>
                                    <SelectItem value="outro">Outro / Licença Especial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Ano Exercício *</Label>
                            <Input
                                type="number"
                                value={formData.ref_ano}
                                onChange={(e) => setFormData({ ...formData, ref_ano: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 font-semibold text-xs"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Status do Documento</Label>
                            <div className="h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center px-3.5 justify-between">
                                <span className="text-xs font-medium text-slate-600">Situação Atual:</span>
                                {isVencido ? (
                                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-semibold gap-1 text-[11px]">
                                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                                        Vencido / Atrasado
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold gap-1 text-[11px]">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        Em dia / Válido
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seção Visual de Exibição e Substituição do Anexo */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                    <Label className="text-xs font-medium text-slate-700 block">Comprovante / Anexo do Documento</Label>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center gap-4">
                        {formData.comprovante_ref ? (
                            <div className="relative group shrink-0">
                                {isPdf ? (
                                    <div className="h-32 w-32 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center p-2 text-center shadow-xs">
                                        <FileCheck className="h-8 w-8 text-blue-600 mb-1" />
                                        <span className="text-[10px] font-bold text-slate-800 line-clamp-1">Documento PDF</span>
                                        <span className="text-[9px] text-slate-400 mt-0.5">Clique para abrir</span>
                                    </div>
                                ) : (
                                    <img
                                        src={formData.comprovante_ref}
                                        alt="Documento Anexado"
                                        className="h-32 w-32 object-cover rounded-xl border border-slate-200 bg-white shadow-xs"
                                    />
                                )}
                                <a
                                    href={formData.comprovante_ref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute inset-0 bg-slate-900/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-[10px] font-semibold"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>Abrir</span>
                                </a>
                            </div>
                        ) : (
                            <div className="h-28 w-28 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0">
                                <FileText className="h-6 w-6 mb-1 text-slate-300" />
                                <span className="text-[10px]">Sem anexo</span>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 w-full">
                            {formData.comprovante_ref && (
                                <a
                                    href={formData.comprovante_ref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={buttonVariants({
                                        variant: "outline",
                                        className: "h-9 w-fit rounded-xl text-xs gap-1.5 bg-white border-slate-200 font-medium"
                                    })}
                                >
                                    <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                                    <span>Visualizar Documento</span>
                                </a>
                            )}

                            <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100/80 transition-colors text-xs font-semibold text-slate-700 w-fit">
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : <Upload className="h-4 w-4 text-slate-500" />}
                                <span>{formData.comprovante_ref ? "Substituir Arquivo" : "Anexar PDF ou Imagem"}</span>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </label>
                            <span className="text-[10px] text-slate-400">Formatos aceitos: PDF, JPG, PNG</span>
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
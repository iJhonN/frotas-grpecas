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
import { ArrowLeft, Save, Loader2, Upload, CheckCircle2, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NovoDocumentoPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [submitting, setSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [vehicles, setVehicles] = useState<any[]>([])
    const [fileUrl, setFileUrl] = useState("")

    // Controle do Popover de busca de veículos
    const [openVehiclePopover, setOpenVehiclePopover] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null)

    const [formData, setFormData] = useState({
        vehicle_id: "",
        tipo_documento: "crlv",
        ref_ano: new Date().getFullYear().toString(),
        data_vencimento: "",
        valor: "",
        situacao: "em_dia",
        observacoes: "",
    })

    useEffect(() => {
        async function loadVehicles() {
            if (!selectedCompany) return
            try {
                let query = supabase
                    .from("vehicles")
                    .select("id, placa, marca, modelo, company_id")

                if (selectedCompany.id !== "all") {
                    query = query.eq("company_id", selectedCompany.id)
                }

                const { data } = await query
                setVehicles(data || [])
            } catch (err) {
                console.error("Erro ao carregar veículos:", err)
            }
        }
        loadVehicles()
    }, [selectedCompany])

    const handleVehicleSelect = (vId: string) => {
        const veh = vehicles.find((v) => v.id === vId)
        setSelectedVehicle(veh || null)
        setFormData((prev) => ({ ...prev, vehicle_id: vId }))
        setOpenVehiclePopover(false)
    }

    // Upload do PDF/Imagem no Storage
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !selectedCompany) return

        const companyFolder = selectedCompany.id === "all" ? (selectedVehicle?.company_id || "geral") : selectedCompany.id

        setUploading(true)
        try {
            const fileExt = file.name.split(".").pop()
            const fileName = `${companyFolder}/${Date.now()}_documento.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from("documents")
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from("documents").getPublicUrl(filePath)
            setFileUrl(data.publicUrl)
        } catch (err: any) {
            console.error("Erro ao fazer upload do documento:", err)
            alert(`Erro no upload: ${err.message || "Certifique-se de que o bucket 'documents' existe no Supabase."}`)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedVehicle) {
            alert("Selecione um veículo válido para o documento.")
            return
        }

        const targetCompanyId = selectedCompany?.id === "all" ? selectedVehicle.company_id : selectedCompany?.id

        setSubmitting(true)
        try {
            const isoVencimento = formData.data_vencimento
                ? `${formData.data_vencimento}T12:00:00.000Z`
                : new Date().toISOString()

            const payload = {
                company_id: targetCompanyId,
                vehicle_id: formData.vehicle_id,
                tipo_documento: formData.tipo_documento,
                ref_ano: Number(formData.ref_ano) || new Date().getFullYear(),
                data_vencimento: isoVencimento,
                valor: formData.valor ? Number(formData.valor) : null,
                situacao: formData.situacao,
                comprovante_ref: fileUrl || null,
                observacoes: formData.observacoes.trim() || null,
            }

            const { error } = await supabase.from("vehicle_documents").insert([payload as any])
            if (error) throw error

            router.push("/documentos")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao salvar documento:", err)
            alert(`Erro ao salvar: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    const currentVehicleObj = vehicles.find((v) => v.id === formData.vehicle_id)

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Link
                    href="/documentos"
                    className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                >
                    <ArrowLeft className="h-4 w-4 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cadastrar Documento / CRLV</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Anexe licenciamento, CRLV digital, IPVA e taxas do veículo</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Identificação do Veículo & Documento</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pesquisa de Veículo com Autocomplete */}
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

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Tipo de Documento *</Label>
                            <Select
                                value={formData.tipo_documento}
                                onValueChange={(val) => setFormData({ ...formData, tipo_documento: val || "crlv" })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 bg-white">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="ref_ano" className="text-xs font-medium text-slate-700">
                                Ano de Referência *
                            </Label>
                            <Input
                                id="ref_ano"
                                type="number"
                                placeholder="2026"
                                value={formData.ref_ano}
                                onChange={(e) => setFormData({ ...formData, ref_ano: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="data_vencimento" className="text-xs font-medium text-slate-700">
                                Data de Vencimento *
                            </Label>
                            <Input
                                id="data_vencimento"
                                type="date"
                                value={formData.data_vencimento}
                                onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 text-xs"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="valor" className="text-xs font-medium text-slate-700">
                                Valor da Taxa / Guia (R$)
                            </Label>
                            <Input
                                id="valor"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.valor}
                                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 font-semibold"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Situação do Pagamento / Documento *</Label>
                        <Select value={formData.situacao} onValueChange={(val) => setFormData({ ...formData, situacao: val || "em_dia" })}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 bg-white">
                                <SelectItem value="em_dia">Em dia / Válido</SelectItem>
                                <SelectItem value="a_vencer">A Vencer</SelectItem>
                                <SelectItem value="vencido">Vencido / Atrasado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Área de Anexo de Arquivos (CRLV / PDF) */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                    <Label className="text-xs font-medium text-slate-700">Anexo do Documento (PDF / Foto do CRLV)</Label>

                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center gap-2">
                        {uploading ? (
                            <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                <span>Enviando arquivo...</span>
                            </div>
                        ) : fileUrl ? (
                            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold py-1">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <span>Documento Anexado com Sucesso!</span>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-6 w-6 text-slate-400" />
                                <span className="text-xs text-slate-600 font-medium">Selecione o arquivo do CRLV ou comprovante</span>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileUpload}
                                    className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                />
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="observacoes" className="text-xs font-medium text-slate-700">
                        Observações
                    </Label>
                    <Textarea
                        id="observacoes"
                        placeholder="Anotações adicionais, código de barras da guia de pagamento ou restrições..."
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        className="rounded-xl border-slate-200 text-xs min-h-[70px]"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/documentos"
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
                                Salvar Documento
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
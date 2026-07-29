"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCompany } from "@/contexts/company-context"
import { createClient } from "@/lib/supabase/client"
import { compressImage } from "@/lib/utils/image-compressor"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    Save,
    Loader2,
    Camera,
    X,
    Trash2,
    Eye,
    AlertTriangle,
    FileText,
    Paperclip,
    ExternalLink,
    Plus,
} from "lucide-react"

export default function DetalhesVeiculoPage({
                                                params,
                                            }: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [activeImageModal, setActiveImageModal] = useState<string | null>(null)

    const [vehicleDocuments, setVehicleDocuments] = useState<any[]>([])

    const [formData, setFormData] = useState({
        placa: "",
        marca: "",
        modelo: "",
        ano_fabricacao: new Date().getFullYear(),
        ano_modelo: new Date().getFullYear(),
        categoria: "leve",
        combustivel: "diesel",
        cor: "",
        km_atual: 0,
        vinculo: "proprio",
        capacidade_tanque_l: 80,
        chassi: "",
        renavam: "",
        status: "ativo_disponivel",
        rastreador_status: "nao_possui",
        id_rastreador: "",
        tacografo_status: "nao_possui",
        tacografo_vencimento: "",
        data_aquisicao: "",
        valor_aquisicao: "",
        proprietario_titular: "",
        praca_contrato: "",
        combustivel_conta_de: "nos",
        manutencao_conta_de: "nos",
        meta_kml: "",
    })

    const [savedPhotos, setSavedPhotos] = useState<{
        frente: string | null
        lado_direito: string | null
        lado_esquerdo: string | null
        tras: string | null
        plaqueta: string | null
    }>({
        frente: null,
        lado_direito: null,
        lado_esquerdo: null,
        tras: null,
        plaqueta: null,
    })

    const [newPhotos, setNewPhotos] = useState<{
        frente: { file: File | null; preview: string | null }
        lado_direito: { file: File | null; preview: string | null }
        lado_esquerdo: { file: File | null; preview: string | null }
        tras: { file: File | null; preview: string | null }
        plaqueta: { file: File | null; preview: string | null }
    }>({
        frente: { file: null, preview: null },
        lado_direito: { file: null, preview: null },
        lado_esquerdo: { file: null, preview: null },
        tras: { file: null, preview: null },
        plaqueta: { file: null, preview: null },
    })

    useEffect(() => {
        async function fetchVehicleAndDocs() {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from("vehicles")
                    .select("*")
                    .eq("id", id)
                    .single()

                if (error) throw error

                const { data: docsData, error: docsError } = await supabase
                    .from("vehicle_documents")
                    .select("*")
                    .eq("vehicle_id", id)
                    .order("data_vencimento", { ascending: true })

                if (!docsError) {
                    setVehicleDocuments(docsData || [])
                }

                if (data) {
                    setFormData((prev) => ({
                        ...prev,
                        placa: data.placa || "",
                        marca: data.marca || "",
                        modelo: data.modelo || "",
                        ano_fabricacao: data.ano_fabricacao || new Date().getFullYear(),
                        ano_modelo: data.ano_modelo || new Date().getFullYear(),
                        categoria: data.categoria || "leve",
                        combustivel: data.combustivel || "diesel",
                        cor: data.cor || "",
                        km_atual: data.km_atual || 0,
                        vinculo: data.vinculo || "proprio",
                        capacidade_tanque_l: data.capacidade_tanque_l || 80,
                        chassi: data.chassi || "",
                        renavam: data.renavam || "",
                        status: data.status || "ativo_disponivel",
                        id_rastreador: data.id_rastreador || "",
                        data_aquisicao: data.data_aquisicao || "",
                        valor_aquisicao: data.valor_aquisicao ? String(data.valor_aquisicao) : "",
                        proprietario_titular: data.proprietario_titular || "",
                        praca_contrato: data.praca_contrato || "",
                        combustivel_conta_de: data.combustivel_conta_de || "nos",
                        manutencao_conta_de: data.manutencao_conta_de || "nos",
                        meta_kml: data.meta_kml ? String(data.meta_kml) : "",
                    }))

                    if (data.observacoes) {
                        try {
                            const obsData = JSON.parse(data.observacoes)

                            setFormData((prev) => ({
                                ...prev,
                                rastreador_status: obsData.rastreador_status || "nao_possui",
                                tacografo_status: obsData.tacografo_status || "nao_possui",
                                tacografo_vencimento: obsData.tacografo_vencimento || "",
                            }))

                            if (obsData.fotos) {
                                setSavedPhotos({
                                    frente: obsData.fotos.frente || null,
                                    lado_direito: obsData.fotos.lado_direito || null,
                                    lado_esquerdo: obsData.fotos.lado_esquerdo || null,
                                    tras: obsData.fotos.tras || null,
                                    plaqueta: obsData.fotos.plaqueta || null,
                                })
                            }
                        } catch (e) {
                            console.log("Observações não contêm JSON estruturado")
                        }
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar veículo:", err)
                alert("Veículo não encontrado ou erro ao carregar dados.")
                router.push("/veiculos")
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchVehicleAndDocs()
    }, [id])

    const handleFileChange = (key: keyof typeof newPhotos, file: File | null) => {
        if (!file) return
        const previewUrl = URL.createObjectURL(file)
        setNewPhotos((prev) => ({
            ...prev,
            [key]: { file, preview: previewUrl },
        }))
    }

    const removeNewPhoto = (key: keyof typeof newPhotos) => {
        setNewPhotos((prev) => ({
            ...prev,
            [key]: { file: null, preview: null },
        }))
    }

    const removeSavedPhoto = (key: keyof typeof savedPhotos) => {
        setSavedPhotos((prev) => ({
            ...prev,
            [key]: null,
        }))
    }

    const uploadAndCompressPhoto = async (file: File, keyName: string, plate: string) => {
        const compressedBlob = await compressImage(file, 1280, 0.75)
        const fileName = `${selectedCompany?.id || "geral"}/${plate.toUpperCase()}/${keyName}_${Date.now()}.jpg`

        const { error } = await supabase.storage
            .from("vehicle-photos")
            .upload(fileName, compressedBlob, {
                contentType: "image/jpeg",
                upsert: true,
            })

        if (error) throw error

        const { data: publicUrlData } = supabase.storage
            .from("vehicle-photos")
            .getPublicUrl(fileName)

        return publicUrlData.publicUrl
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const plate = formData.placa.toUpperCase().trim()
            const finalPhotos = { ...savedPhotos }

            for (const key of ["frente", "lado_direito", "lado_esquerdo", "tras", "plaqueta"] as const) {
                if (newPhotos[key].file) {
                    const uploadedUrl = await uploadAndCompressPhoto(newPhotos[key].file!, key, plate)
                    finalPhotos[key] = uploadedUrl
                }
            }

            const payload = {
                placa: plate,
                marca: formData.marca,
                modelo: formData.modelo,
                ano_fabricacao: Number(formData.ano_fabricacao),
                ano_modelo: Number(formData.ano_modelo),
                categoria: formData.categoria,
                combustivel: formData.combustivel,
                cor: formData.cor || null,
                km_atual: Number(formData.km_atual),
                vinculo: formData.vinculo,
                capacidade_tanque_l: Number(formData.capacidade_tanque_l),
                chassi: formData.chassi || null,
                renavam: formData.renavam || null,
                status: formData.status,

                rastreador: formData.rastreador_status !== "nao_possui",
                id_rastreador: formData.rastreador_status !== "nao_possui" ? formData.id_rastreador || null : null,
                data_aquisicao: formData.data_aquisicao || null,
                valor_aquisicao: formData.valor_aquisicao ? Number(formData.valor_aquisicao) : null,
                proprietario_titular: formData.proprietario_titular || null,
                praca_contrato: formData.praca_contrato || null,
                combustivel_conta_de: formData.combustivel_conta_de,
                manutencao_conta_de: formData.manutencao_conta_de,
                meta_kml: formData.meta_kml ? Number(formData.meta_kml.replace(',', '.')) : null,

                observacoes: JSON.stringify({
                    fotos: finalPhotos,
                    rastreador_status: formData.rastreador_status,
                    tacografo_status: formData.tacografo_status,
                    tacografo_vencimento: formData.tacografo_status !== "nao_possui" ? formData.tacografo_vencimento : null,
                }),
            }

            const { error } = await supabase
                .from("vehicles")
                .update(payload as any)
                .eq("id", id)

            if (error) throw error

            alert("Veículo atualizado com sucesso!")
            setSavedPhotos(finalPhotos)
            setNewPhotos({
                frente: { file: null, preview: null },
                lado_direito: { file: null, preview: null },
                lado_esquerdo: { file: null, preview: null },
                tras: { file: null, preview: null },
                plaqueta: { file: null, preview: null },
            })
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao atualizar veículo:", err)
            alert(`Erro ao atualizar veículo: ${err.message || "Erro desconhecido"}`)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir o veículo ${formData.placa}?`)) return

        setDeleting(true)
        try {
            const { error } = await supabase.from("vehicles").delete().eq("id", id)
            if (error) throw error

            alert("Veículo excluído com sucesso!")
            router.push("/veiculos")
        } catch (err: any) {
            console.error("Erro ao excluir veículo:", err)
            alert("Não foi possível excluir o veículo. Verifique se ele possui vínculos em rotas ou abastecimentos.")
        } finally {
            setDeleting(false)
        }
    }

    const photoSlots = [
        { key: "frente", label: "Frente do Veículo" },
        { key: "lado_direito", label: "Lado Direito (Passageiro)" },
        { key: "lado_esquerdo", label: "Lado Esquerdo (Motorista)" },
        { key: "tras", label: "Traseira do Veículo" },
        { key: "plaqueta", label: "Plaqueta de Identificação" },
    ] as const

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Carregando dados do veículo...</span>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {activeImageModal && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setActiveImageModal(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
                        <img
                            src={activeImageModal}
                            alt="Foto ampliada"
                            className="max-w-full max-h-[85vh] object-contain"
                        />
                        <button
                            type="button"
                            onClick={() => setActiveImageModal(null)}
                            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/veiculos"
                        className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {formData.marca} {formData.modelo}
                            </h1>
                            <Badge className="bg-slate-900 text-white font-mono text-xs px-2.5 py-0.5 rounded-lg">
                                {formData.placa}
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Ano {formData.ano_fabricacao}/{formData.ano_modelo} &bull; {formData.km_atual.toLocaleString("pt-BR")} KM
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
                    Excluir Veículo
                </Button>
            </div>

            {formData.tacografo_status === "atrasado" && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start sm:items-center gap-3 shadow-xs">
                    <div className="bg-white p-2 rounded-full shadow-xs">
                        <AlertTriangle className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-rose-800">Atenção: Tacógrafo Atrasado / Vencido</h3>
                        <p className="text-xs text-rose-600 mt-0.5">O tacógrafo deste veículo está irregular. Providencie a regularização ou aferição imediatamente.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
                {/* 1. Fotos do Veículo */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-800">Fotos de Inspeção do Veículo</h2>
                            <p className="text-[11px] text-slate-500">Clique na foto para ampliar, alterar ou remover os registros</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                            {Object.values(savedPhotos).filter(Boolean).length} / 5 Anexadas
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {photoSlots.map((slot) => {
                            const savedUrl = savedPhotos[slot.key]
                            const newPhoto = newPhotos[slot.key]
                            const hasPhoto = savedUrl || newPhoto.preview

                            return (
                                <div key={slot.key} className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-slate-700 block truncate" title={slot.label}>
                                        {slot.label}
                                    </Label>
                                    <div className="relative h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-400 transition-colors">
                                        {hasPhoto ? (
                                            <>
                                                <img
                                                    src={newPhoto.preview || savedUrl!}
                                                    alt={slot.label}
                                                    className="h-full w-full object-cover cursor-pointer"
                                                    onClick={() => setActiveImageModal(newPhoto.preview || savedUrl!)}
                                                />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveImageModal(newPhoto.preview || savedUrl!)}
                                                        className="h-7 w-7 rounded-lg bg-white/90 text-slate-800 flex items-center justify-center hover:bg-white"
                                                        title="Ampliar"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (newPhoto.preview) removeNewPhoto(slot.key)
                                                            else removeSavedPhoto(slot.key)
                                                        }}
                                                        className="h-7 w-7 rounded-lg bg-red-600/90 text-white flex items-center justify-center hover:bg-red-600"
                                                        title="Remover"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center justify-center h-full w-full p-2 text-center">
                                                <Camera className="h-5 w-5 text-slate-400 mb-1" />
                                                <span className="text-[10px] font-medium text-slate-600">Adicionar</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(slot.key, e.target.files?.[0] || null)}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* 2. Documentos & Licenciamentos Anexados */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                Documentos & Licenciamentos Anexados
                            </h2>
                            <p className="text-[11px] text-slate-500">CRLV Digital, IPVA, Licenciamento e Apólices de Seguro do veículo</p>
                        </div>

                        <Link
                            href="/documentos/novo"
                            className={buttonVariants({ variant: "outline", className: "h-8 rounded-lg text-xs gap-1.5 border-slate-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium" })}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Anexar Documento</span>
                        </Link>
                    </div>

                    {vehicleDocuments.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-1.5 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <FileText className="h-6 w-6 text-slate-300" />
                            <span className="text-xs font-medium text-slate-600">Nenhum documento/CRLV cadastrado para este veículo</span>
                            <span className="text-[11px] text-slate-400">Cadastre documentos para receber alertas de vencimento</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {vehicleDocuments.map((doc) => {
                                const vencimento = doc.data_vencimento ? new Date(doc.data_vencimento).toLocaleDateString("pt-BR") : "N/A"
                                return (
                                    <div
                                        key={doc.id}
                                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                                    >
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900 uppercase">
                                                    {doc.tipo_documento?.replace("_", " ")}
                                                </span>
                                                <Badge variant="outline" className="text-[10px] bg-white border-slate-200 font-mono">
                                                    Ref. {doc.ref_ano}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                <span>Vencimento: <strong className="text-slate-700">{vencimento}</strong></span>
                                                {doc.valor && (
                                                    <span>&bull; R$ {Number(doc.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {doc.comprovante_ref ? (
                                                <a
                                                    href={doc.comprovante_ref}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="h-8 px-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                                                    title="Visualizar anexo"
                                                >
                                                    <Paperclip className="h-3.5 w-3.5" />
                                                    <span>Anexo</span>
                                                    <ExternalLink className="h-3 w-3 opacity-70" />
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 italic">Sem arquivo</span>
                                            )}

                                            <Link
                                                href={`/documentos/${doc.id}`}
                                                className={buttonVariants({ variant: "outline", className: "h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900" })}
                                                title="Editar documento"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-8">
                    {/* 3. Dados Cadastrais */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Informações Gerais & Status</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Placa *</Label>
                                <Input value={formData.placa} onChange={(e) => setFormData({ ...formData, placa: e.target.value })} className="h-10 rounded-xl uppercase font-mono font-bold" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Marca *</Label>
                                <Input value={formData.marca} onChange={(e) => setFormData({ ...formData, marca: e.target.value })} className="h-10 rounded-xl" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Modelo *</Label>
                                <Input value={formData.modelo} onChange={(e) => setFormData({ ...formData, modelo: e.target.value })} className="h-10 rounded-xl" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Status Atual *</Label>
                                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val || "ativo_disponivel" })}>
                                    <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ativo_disponivel">Ativo / Disponível</SelectItem>
                                        <SelectItem value="em_uso">Em Uso / Em Rota</SelectItem>
                                        <SelectItem value="em_manutencao">Em Manutenção</SelectItem>
                                        <SelectItem value="inativo">Inativo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Ano Fabricação *</Label>
                                <Input type="number" value={formData.ano_fabricacao} onChange={(e) => setFormData({ ...formData, ano_fabricacao: Number(e.target.value) })} className="h-10 rounded-xl" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Ano Modelo *</Label>
                                <Input type="number" value={formData.ano_modelo} onChange={(e) => setFormData({ ...formData, ano_modelo: Number(e.target.value) })} className="h-10 rounded-xl" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Cor</Label>
                                <Input value={formData.cor} onChange={(e) => setFormData({ ...formData, cor: e.target.value })} className="h-10 rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">KM Atual *</Label>
                                <Input type="number" value={formData.km_atual} onChange={(e) => setFormData({ ...formData, km_atual: Number(e.target.value) })} className="h-10 rounded-xl" required />
                            </div>
                        </div>
                    </div>

                    {/* 4. Especificações Técnicas */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Especificações Técnicas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Categoria *</Label>
                                <Select value={formData.categoria} onValueChange={(val) => setFormData({ ...formData, categoria: val || "leve" })}>
                                    <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="leve">Leve</SelectItem>
                                        <SelectItem value="pesado">Pesado</SelectItem>
                                        <SelectItem value="utilitario">Utilitário</SelectItem>
                                        <SelectItem value="maquina">Máquina</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Combustível *</Label>
                                <Select value={formData.combustivel} onValueChange={(val) => setFormData({ ...formData, combustivel: val || "diesel" })}>
                                    <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="diesel">Diesel</SelectItem>
                                        <SelectItem value="gasolina">Gasolina</SelectItem>
                                        <SelectItem value="etanol">Etanol</SelectItem>
                                        <SelectItem value="flex">Flex</SelectItem>
                                        <SelectItem value="eletrico">Elétrico</SelectItem>
                                        <SelectItem value="gnv">GNV</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Tanque (Litros) *</Label>
                                <Input type="number" value={formData.capacidade_tanque_l} onChange={(e) => setFormData({ ...formData, capacidade_tanque_l: Number(e.target.value) })} className="h-10 rounded-xl" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Vínculo / Posse *</Label>
                                <Select value={formData.vinculo} onValueChange={(val) => setFormData({ ...formData, vinculo: val || "proprio" })}>
                                    <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="proprio">Próprio</SelectItem>
                                        <SelectItem value="alugado">Alugado</SelectItem>
                                        <SelectItem value="cooperado">Cooperado</SelectItem>
                                        <SelectItem value="terceiro">Terceiro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Chassi</Label>
                                <Input value={formData.chassi} onChange={(e) => setFormData({ ...formData, chassi: e.target.value })} className="h-10 rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Renavam</Label>
                                <Input value={formData.renavam} onChange={(e) => setFormData({ ...formData, renavam: e.target.value })} className="h-10 rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* 5. Dispositivos */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Dispositivos & Telemetria</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Rastreador *</Label>
                                <Select value={formData.rastreador_status} onValueChange={(val) => setFormData({ ...formData, rastreador_status: val || "nao_possui" })}>
                                    <SelectTrigger className="h-10 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="nao_possui">Não possui</SelectItem>
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="offline">Offline</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.rastreador_status !== "nao_possui" && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-700">ID / Código Rastreador</Label>
                                    <Input
                                        value={formData.id_rastreador}
                                        onChange={(e) => setFormData({ ...formData, id_rastreador: e.target.value })}
                                        className="h-10 rounded-xl border-slate-200"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Tacógrafo *</Label>
                                <Select value={formData.tacografo_status} onValueChange={(val) => setFormData({ ...formData, tacografo_status: val || "nao_possui" })}>
                                    <SelectTrigger className="h-10 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="nao_possui">Não possui</SelectItem>
                                        <SelectItem value="em_dias">Em dias</SelectItem>
                                        <SelectItem value="defeito">Com Defeito</SelectItem>
                                        <SelectItem value="atrasado">Atrasado / Vencido</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.tacografo_status !== "nao_possui" && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-700">Vencimento Tacógrafo *</Label>
                                    <Input
                                        type="date"
                                        value={formData.tacografo_vencimento}
                                        onChange={(e) => setFormData({ ...formData, tacografo_vencimento: e.target.value })}
                                        className="h-10 rounded-xl border-slate-200"
                                        required={formData.tacografo_status !== "nao_possui"}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 6. Custos e Desempenho */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Custos & Desempenho (Opcional)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Combustível por conta de</Label>
                                <Select value={formData.combustivel_conta_de} onValueChange={(val) => setFormData({ ...formData, combustivel_conta_de: val || "nos" })}>
                                    <SelectTrigger className="h-10 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="nos">Nós (Empresa)</SelectItem>
                                        <SelectItem value="terceiro">Terceiro / Motorista</SelectItem>
                                        <SelectItem value="cliente">Cliente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Manutenção por conta de</Label>
                                <Select value={formData.manutencao_conta_de} onValueChange={(val) => setFormData({ ...formData, manutencao_conta_de: val || "nos" })}>
                                    <SelectTrigger className="h-10 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="nos">Nós (Empresa)</SelectItem>
                                        <SelectItem value="terceiro">Terceiro / Motorista</SelectItem>
                                        <SelectItem value="cliente">Cliente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Meta KM/L (Desempenho)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.meta_kml}
                                    onChange={(e) => setFormData({ ...formData, meta_kml: e.target.value })}
                                    className="h-10 rounded-xl border-slate-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 7. Financeiro e Contrato */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Financeiro e Contrato (Opcional)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Data de Aquisição</Label>
                                <Input
                                    type="date"
                                    value={formData.data_aquisicao}
                                    onChange={(e) => setFormData({ ...formData, data_aquisicao: e.target.value })}
                                    className="h-10 rounded-xl border-slate-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Valor de Aquisição (R$)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.valor_aquisicao}
                                    onChange={(e) => setFormData({ ...formData, valor_aquisicao: e.target.value })}
                                    className="h-10 rounded-xl border-slate-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Proprietário Titular</Label>
                                <Input
                                    value={formData.proprietario_titular}
                                    onChange={(e) => setFormData({ ...formData, proprietario_titular: e.target.value })}
                                    className="h-10 rounded-xl border-slate-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Praça / Contrato Atual</Label>
                                <Input
                                    value={formData.praca_contrato}
                                    onChange={(e) => setFormData({ ...formData, praca_contrato: e.target.value })}
                                    className="h-10 rounded-xl border-slate-200"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Link href="/veiculos" className={buttonVariants({ variant: "outline", className: "h-10 rounded-xl" })}>
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
                                    Salvando Alterações...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
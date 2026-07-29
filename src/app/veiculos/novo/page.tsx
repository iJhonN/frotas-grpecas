"use client"

import { useState } from "react"
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
import { ArrowLeft, Save, Loader2, Camera, X } from "lucide-react"

export default function NovoVeiculoPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        // Básicos
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
        // Dispositivos
        rastreador_status: "nao_possui",
        id_rastreador: "",
        tacografo_status: "nao_possui",
        tacografo_vencimento: "",
        // Financeiro & Custos (Opcionais)
        data_aquisicao: "",
        valor_aquisicao: "",
        proprietario_titular: "",
        praca_contrato: "",
        combustivel_conta_de: "nos",
        manutencao_conta_de: "nos",
        meta_kml: "",
    })

    const [photos, setPhotos] = useState<{
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

    const handleFileChange = (key: keyof typeof photos, file: File | null) => {
        if (!file) return
        const previewUrl = URL.createObjectURL(file)
        setPhotos((prev) => ({
            ...prev,
            [key]: { file, preview: previewUrl },
        }))
    }

    const removePhoto = (key: keyof typeof photos) => {
        setPhotos((prev) => ({
            ...prev,
            [key]: { file: null, preview: null },
        }))
    }

    const uploadAndCompressPhoto = async (file: File, keyName: string, plate: string) => {
        const compressedBlob = await compressImage(file, 1280, 0.75)
        const fileName = `${selectedCompany?.id}/${plate.toUpperCase()}/${keyName}_${Date.now()}.jpg`

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCompany) {
            alert("Selecione uma empresa no topo antes de continuar.")
            return
        }

        setSubmitting(true)
        try {
            const plate = formData.placa.toUpperCase().trim()

            const uploadedUrls: Record<string, string | null> = {}
            for (const key of ["frente", "lado_direito", "lado_esquerdo", "tras", "plaqueta"] as const) {
                if (photos[key].file) {
                    uploadedUrls[key] = await uploadAndCompressPhoto(photos[key].file!, key, plate)
                } else {
                    uploadedUrls[key] = null
                }
            }

            const payload = {
                company_id: selectedCompany.id,
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
                status: "ativo_disponivel",

                // Dispositivos Nativos
                rastreador: formData.rastreador_status !== "nao_possui",
                id_rastreador: formData.rastreador_status !== "nao_possui" ? formData.id_rastreador || null : null,

                // Financeiro e Custos Nativos
                data_aquisicao: formData.data_aquisicao || null,
                valor_aquisicao: formData.valor_aquisicao ? Number(formData.valor_aquisicao) : null,
                proprietario_titular: formData.proprietario_titular || null,
                praca_contrato: formData.praca_contrato || null,
                combustivel_conta_de: formData.combustivel_conta_de,
                manutencao_conta_de: formData.manutencao_conta_de,
                meta_kml: formData.meta_kml ? Number(formData.meta_kml.replace(',', '.')) : null,

                observacoes: JSON.stringify({
                    fotos: uploadedUrls,
                    rastreador_status: formData.rastreador_status,
                    tacografo_status: formData.tacografo_status,
                    tacografo_vencimento: formData.tacografo_status !== "nao_possui" ? formData.tacografo_vencimento : null,
                }),
            }

            const { error } = await supabase.from("vehicles").insert([payload as any])

            if (error) {
                console.error("Erro Supabase:", error)
                alert(`Erro ao cadastrar veículo: ${error.message}`)
                return
            }

            router.push("/veiculos")
            router.refresh()
        } catch (err: any) {
            console.error("Erro no cadastro:", err)
            alert("Erro ao salvar o veículo.")
        } finally {
            setSubmitting(false)
        }
    }

    const photoSlots = [
        { key: "frente", label: "Frente (Opcional)" },
        { key: "lado_direito", label: "Lado Direito (Opcional)" },
        { key: "lado_esquerdo", label: "Lado Esquerdo (Opcional)" },
        { key: "tras", label: "Traseira (Opcional)" },
        { key: "plaqueta", label: "Plaqueta (Opcional)" },
    ] as const

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/veiculos"
                    className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                >
                    <ArrowLeft className="h-4 w-4 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cadastrar Novo Veículo</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Preencha os dados do veículo. As fotos podem ser anexadas agora ou posteriormente.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-8">

                {/* 1. Identificação Principal */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Identificação do Veículo</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="placa" className="text-xs font-medium text-slate-700">Placa *</Label>
                            <Input
                                id="placa"
                                placeholder="ABC1D23"
                                value={formData.placa}
                                onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 uppercase"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="marca" className="text-xs font-medium text-slate-700">Marca *</Label>
                            <Input
                                id="marca"
                                placeholder="Ex: Volvo, Scania, FIAT"
                                value={formData.marca}
                                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="modelo" className="text-xs font-medium text-slate-700">Modelo *</Label>
                            <Input
                                id="modelo"
                                placeholder="Ex: FH 540, Strada"
                                value={formData.modelo}
                                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="ano_fabricacao" className="text-xs font-medium text-slate-700">Ano Fabricação *</Label>
                            <Input
                                id="ano_fabricacao"
                                type="number"
                                value={formData.ano_fabricacao}
                                onChange={(e) => setFormData({ ...formData, ano_fabricacao: Number(e.target.value) })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="ano_modelo" className="text-xs font-medium text-slate-700">Ano Modelo *</Label>
                            <Input
                                id="ano_modelo"
                                type="number"
                                value={formData.ano_modelo}
                                onChange={(e) => setFormData({ ...formData, ano_modelo: Number(e.target.value) })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="cor" className="text-xs font-medium text-slate-700">Cor</Label>
                            <Input
                                id="cor"
                                placeholder="Ex: Branco"
                                value={formData.cor}
                                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="km_atual" className="text-xs font-medium text-slate-700">KM Atual *</Label>
                            <Input
                                id="km_atual"
                                type="number"
                                value={formData.km_atual}
                                onChange={(e) => setFormData({ ...formData, km_atual: Number(e.target.value) })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Especificações Técnicas */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Especificações Técnicas</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="categoria" className="text-xs font-medium text-slate-700">Categoria *</Label>
                            <Select value={formData.categoria} onValueChange={(val) => setFormData({ ...formData, categoria: val || "leve" })}>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="leve">Leve</SelectItem>
                                    <SelectItem value="pesado">Pesado</SelectItem>
                                    <SelectItem value="utilitario">Utilitário</SelectItem>
                                    <SelectItem value="maquina">Máquina</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="combustivel" className="text-xs font-medium text-slate-700">Combustível *</Label>
                            <Select value={formData.combustivel} onValueChange={(val) => setFormData({ ...formData, combustivel: val || "diesel" })}>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
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
                            <Label htmlFor="capacidade_tanque_l" className="text-xs font-medium text-slate-700">Tanque (Litros) *</Label>
                            <Input
                                id="capacidade_tanque_l"
                                type="number"
                                value={formData.capacidade_tanque_l}
                                onChange={(e) => setFormData({ ...formData, capacidade_tanque_l: Number(e.target.value) })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="vinculo" className="text-xs font-medium text-slate-700">Vínculo / Posse *</Label>
                            <Select value={formData.vinculo} onValueChange={(val) => setFormData({ ...formData, vinculo: val || "proprio" })}>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
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
                            <Label htmlFor="chassi" className="text-xs font-medium text-slate-700">Chassi (Opcional)</Label>
                            <Input
                                id="chassi"
                                value={formData.chassi}
                                onChange={(e) => setFormData({ ...formData, chassi: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="renavam" className="text-xs font-medium text-slate-700">Renavam (Opcional)</Label>
                            <Input
                                id="renavam"
                                value={formData.renavam}
                                onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Dispositivos (Rastreador e Tacógrafo) */}
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
                                    placeholder="Ex: IMEI ou Placa"
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
                                    required
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Custos e Desempenho (Opcional) */}
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
                                placeholder="Ex: 2.5"
                                value={formData.meta_kml}
                                onChange={(e) => setFormData({ ...formData, meta_kml: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                {/* 5. Financeiro e Propriedade (Opcional) */}
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
                                placeholder="0,00"
                                value={formData.valor_aquisicao}
                                onChange={(e) => setFormData({ ...formData, valor_aquisicao: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Proprietário Titular (CRLV)</Label>
                            <Input
                                placeholder="Nome no documento"
                                value={formData.proprietario_titular}
                                onChange={(e) => setFormData({ ...formData, proprietario_titular: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Praça / Contrato Atual</Label>
                            <Input
                                placeholder="Ex: Rota SP x RJ / Contrato XPTO"
                                value={formData.praca_contrato}
                                onChange={(e) => setFormData({ ...formData, praca_contrato: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                {/* 6. Fotos do Veículo (Opcionais) */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-1">Fotos do Veículo (Opcional)</h2>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Você pode adicionar ou alterar as fotos em qualquer momento acessando os detalhes do veículo.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {photoSlots.map((slot) => {
                            const currentPhoto = photos[slot.key]
                            return (
                                <div key={slot.key} className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-slate-700 block truncate" title={slot.label}>
                                        {slot.label}
                                    </Label>
                                    <div className="relative h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex flex-col items-center justify-center hover:bg-slate-100/80 transition-colors">
                                        {currentPhoto.preview ? (
                                            <>
                                                <img
                                                    src={currentPhoto.preview}
                                                    alt={slot.label}
                                                    className="h-full w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(slot.key)}
                                                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center justify-center h-full w-full p-2 text-center">
                                                <Camera className="h-5 w-5 text-slate-400 mb-1" />
                                                <span className="text-[10px] font-medium text-slate-600">Anexar foto</span>
                                                <span className="text-[8px] text-slate-400 mt-0.5">JPG / PNG</span>
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

                {/* Botões de Ação */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/veiculos"
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
                                Salvar Veículo
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
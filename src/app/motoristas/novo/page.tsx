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
import { ArrowLeft, Save, Loader2, Check, ChevronsUpDown, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NovoMotoristaPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [submitting, setSubmitting] = useState(false)
    const [companies, setCompanies] = useState<any[]>([])
    const [vehicles, setVehicles] = useState<any[]>([])
    const [openVehiclePopover, setOpenVehiclePopover] = useState(false)

    const [formData, setFormData] = useState({
        company_id: "",
        nome_completo: "",
        telefone: "",
        cidade: "",
        cnh_numero: "",
        cnh_categoria: "AD",
        cnh_validade: "",
        toxicologico_validade: "",
        curso_transporte_passageiros_validade: "",
        ear: false,
        veiculo_atual_id: "",
        observacoes: "",
    })

    // Carrega a lista de empresas
    useEffect(() => {
        async function loadCompanies() {
            try {
                const { data } = await supabase
                    .from("companies")
                    .select("id, nome_fantasia, razao_social")
                    .order("nome_fantasia")

                setCompanies(data || [])

                // Define a empresa pré-selecionada com base no contexto global
                if (selectedCompany && selectedCompany.id !== "all") {
                    setFormData((prev) => ({ ...prev, company_id: selectedCompany.id }))
                } else if (data && data.length > 0) {
                    setFormData((prev) => ({ ...prev, company_id: data[0].id }))
                }
            } catch (err) {
                console.error("Erro ao carregar empresas:", err)
            }
        }
        loadCompanies()
    }, [selectedCompany])

    // Carrega veículos conforme a empresa selecionada no formulário
    useEffect(() => {
        async function loadVehicles() {
            if (!formData.company_id) {
                setVehicles([])
                return
            }
            try {
                let query = supabase
                    .from("vehicles")
                    .select("id, placa, marca, modelo")

                if (formData.company_id !== "all") {
                    query = query.eq("company_id", formData.company_id)
                }

                const { data } = await query
                setVehicles(data || [])
            } catch (err) {
                console.error("Erro ao carregar veículos:", err)
            }
        }
        loadVehicles()
    }, [formData.company_id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.company_id) {
            alert("Selecione a empresa à qual este motorista pertencerá.")
            return
        }

        setSubmitting(true)
        try {
            const categoriasArray = formData.cnh_categoria.split("")

            const payload = {
                company_id: formData.company_id,
                nome_completo: formData.nome_completo.trim(),
                telefone: formData.telefone.trim() || null,
                cidade: formData.cidade.trim() || null,
                cnh_numero: formData.cnh_numero.replace(/\D/g, ""),
                categorias_cnh: categoriasArray,
                cnh_validade: formData.cnh_validade,
                toxicologico_validade: formData.toxicologico_validade || null,
                curso_transporte_passageiros_validade: formData.curso_transporte_passageiros_validade || null,
                ear: formData.ear,
                veiculo_atual_id: formData.veiculo_atual_id || null,
                observacoes: formData.observacoes.trim() || null,
                status: "ativo",
            }

            const { error } = await supabase.from("drivers").insert([payload as any])

            if (error) {
                console.error("Erro do Supabase:", error)
                alert(`Erro ao cadastrar: ${error.message}`)
                return
            }

            router.push("/motoristas")
            router.refresh()
        } catch (err: any) {
            console.error("Erro inesperado:", err)
            alert("Erro inesperado ao salvar motorista.")
        } finally {
            setSubmitting(false)
        }
    }

    const currentVehicleObj = vehicles.find((v) => v.id === formData.veiculo_atual_id)

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Link
                    href="/motoristas"
                    className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                >
                    <ArrowLeft className="h-4 w-4 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cadastrar Novo Motorista</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Preencha as informações do condutor para liberação de rotas</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                {/* Seleção de Empresa no Formulário */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        Vínculo de Empresa
                    </h2>

                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-medium text-slate-700">Empresas Cadastradas *</Label>
                        <Select
                            value={formData.company_id}
                            onValueChange={(val) => setFormData((prev) => ({ ...prev, company_id: val, veiculo_atual_id: "" }))}
                        >
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white">
                                <SelectValue placeholder="Selecione a empresa do motorista" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 bg-white">
                                {companies.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.nome_fantasia || c.razao_social}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 1. Dados Pessoais */}
                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Dados Pessoais</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3 space-y-1.5">
                            <Label htmlFor="nome_completo" className="text-xs font-medium text-slate-700">
                                Nome Completo *
                            </Label>
                            <Input
                                id="nome_completo"
                                placeholder="Ex: João da Silva"
                                value={formData.nome_completo}
                                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="telefone" className="text-xs font-medium text-slate-700">
                                Telefone / Celular
                            </Label>
                            <Input
                                id="telefone"
                                placeholder="(83) 90000-0000"
                                value={formData.telefone}
                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="cidade" className="text-xs font-medium text-slate-700">
                                Cidade
                            </Label>
                            <Input
                                id="cidade"
                                placeholder="Ex: João Pessoa - PB"
                                value={formData.cidade}
                                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. CNH e Habilitação */}
                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Habilitação & CNH</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="cnh_numero" className="text-xs font-medium text-slate-700">
                                Nº Registro CNH *
                            </Label>
                            <Input
                                id="cnh_numero"
                                placeholder="12345678900"
                                value={formData.cnh_numero}
                                onChange={(e) => setFormData({ ...formData, cnh_numero: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Categoria CNH *</Label>
                            <Select
                                value={formData.cnh_categoria}
                                onValueChange={(val) => setFormData({ ...formData, cnh_categoria: val || "AD" })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 bg-white">
                                    <SelectItem value="A">A</SelectItem>
                                    <SelectItem value="B">B</SelectItem>
                                    <SelectItem value="C">C</SelectItem>
                                    <SelectItem value="D">D</SelectItem>
                                    <SelectItem value="E">E</SelectItem>
                                    <SelectItem value="AB">AB</SelectItem>
                                    <SelectItem value="AC">AC</SelectItem>
                                    <SelectItem value="AD">AD</SelectItem>
                                    <SelectItem value="AE">AE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="cnh_validade" className="text-xs font-medium text-slate-700">
                                Validade CNH *
                            </Label>
                            <Input
                                id="cnh_validade"
                                type="date"
                                value={formData.cnh_validade}
                                onChange={(e) => setFormData({ ...formData, cnh_validade: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 text-xs"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="toxicologico_validade" className="text-xs font-medium text-slate-700">
                                Validade Exame Toxicológico
                            </Label>
                            <Input
                                id="toxicologico_validade"
                                type="date"
                                value={formData.toxicologico_validade}
                                onChange={(e) => setFormData({ ...formData, toxicologico_validade: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="curso_transporte_passageiros_validade" className="text-xs font-medium text-slate-700">
                                Validade Curso Transp. Passageiros
                            </Label>
                            <Input
                                id="curso_transporte_passageiros_validade"
                                type="date"
                                value={formData.curso_transporte_passageiros_validade}
                                onChange={(e) => setFormData({ ...formData, curso_transporte_passageiros_validade: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 text-xs"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                            id="ear"
                            checked={formData.ear}
                            onCheckedChange={(checked) => setFormData({ ...formData, ear: !!checked })}
                        />
                        <Label htmlFor="ear" className="text-xs text-slate-700 font-medium cursor-pointer">
                            Exerce Atividade Remunerada (EAR) na CNH
                        </Label>
                    </div>
                </div>

                {/* 3. Vínculo e Observações */}
                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Vínculo de Veículo & Observações</h2>

                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-medium text-slate-700">Veículo Atual Atribuído (Opcional)</Label>
                        <Popover open={openVehiclePopover} onOpenChange={setOpenVehiclePopover}>
                            <PopoverTrigger className="h-10 w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 hover:bg-slate-50 transition-colors">
                                {currentVehicleObj ? (
                                    <span className="truncate">
                                        {currentVehicleObj.placa} - {currentVehicleObj.marca} {currentVehicleObj.modelo}
                                    </span>
                                ) : (
                                    <span className="text-slate-400">Buscar por placa ou modelo de veículo...</span>
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </PopoverTrigger>
                            <PopoverContent className="w-[320px] sm:w-[450px] p-0 rounded-xl border border-slate-200 bg-white shadow-xl z-50" align="start">
                                <Command className="bg-white rounded-xl">
                                    <CommandInput placeholder="Digite a placa, marca ou modelo..." className="h-9 text-xs" />
                                    <CommandList className="max-h-[220px] overflow-y-auto p-1">
                                        <CommandEmpty className="py-3 text-center text-xs text-slate-500">
                                            Nenhum veículo encontrado.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                value="nenhum_veiculo"
                                                onSelect={() => {
                                                    setFormData((prev) => ({ ...prev, veiculo_atual_id: "" }))
                                                    setOpenVehiclePopover(false)
                                                }}
                                                className="text-xs rounded-lg cursor-pointer py-2 px-2 text-slate-400 italic hover:bg-slate-100"
                                            >
                                                Nenhum veículo vinculado
                                            </CommandItem>
                                            {vehicles.map((v) => (
                                                <CommandItem
                                                    key={v.id}
                                                    value={`${v.placa} ${v.marca} ${v.modelo}`}
                                                    onSelect={() => {
                                                        setFormData((prev) => ({ ...prev, veiculo_atual_id: v.id }))
                                                        setOpenVehiclePopover(false)
                                                    }}
                                                    className="text-xs rounded-lg cursor-pointer py-2 px-2 hover:bg-slate-100"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-3.5 w-3.5 text-blue-600",
                                                            formData.veiculo_atual_id === v.id ? "opacity-100" : "opacity-0"
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
                        <Label htmlFor="observacoes" className="text-xs font-medium text-slate-700">
                            Observações
                        </Label>
                        <Textarea
                            id="observacoes"
                            placeholder="Anotações adicionais sobre o motorista..."
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            className="rounded-xl border-slate-200 text-xs min-h-[70px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/motoristas"
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
                                Salvar Motorista
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
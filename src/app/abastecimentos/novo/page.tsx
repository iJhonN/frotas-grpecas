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
import { ArrowLeft, Save, Loader2, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NovoAbastecimentoPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [submitting, setSubmitting] = useState(false)
    const [vehicles, setVehicles] = useState<any[]>([])
    const [drivers, setDrivers] = useState<any[]>([])

    // Estados para controle de abertura dos Popovers com busca
    const [openVehiclePopover, setOpenVehiclePopover] = useState(false)
    const [openDriverPopover, setOpenDriverPopover] = useState(false)

    const [formData, setFormData] = useState({
        vehicle_id: "",
        driver_id: "",
        data: new Date().toISOString().split("T")[0],
        km_odometro: "",
        litros: "",
        valor_total: "",
        valor_por_litro: "",
        combustivel: "diesel",
        posto_fornecedor: "",
        forma_pagamento: "faturado",
        nota_fiscal_ref: "",
        observacoes: "",
    })

    const [selectedVehicle, setSelectedVehicle] = useState<any>(null)

    useEffect(() => {
        async function loadOptions() {
            if (!selectedCompany) return
            try {
                // 1. Veículos (Busca todos se for "all", ou filtra por empresa)
                let vehQuery = supabase
                    .from("vehicles")
                    .select("id, placa, marca, modelo, km_atual, combustivel, meta_kml, company_id")

                if (selectedCompany.id !== "all") {
                    vehQuery = vehQuery.eq("company_id", selectedCompany.id)
                }

                const vehRes = await vehQuery

                // 2. Motoristas
                let drvQuery = supabase
                    .from("drivers")
                    .select("id, nome_completo, company_id")

                if (selectedCompany.id !== "all") {
                    drvQuery = drvQuery.eq("company_id", selectedCompany.id)
                }

                const drvRes = await drvQuery

                setVehicles(vehRes.data || [])
                setDrivers(drvRes.data || [])
            } catch (err) {
                console.error("Erro ao carregar opções:", err)
            }
        }
        loadOptions()
    }, [selectedCompany])

    const handleLitrosTotalChange = (litrosVal: string, totalVal: string) => {
        const l = parseFloat(litrosVal)
        const t = parseFloat(totalVal)

        let pricePerLiter = formData.valor_por_litro
        if (!isNaN(l) && !isNaN(t) && l > 0) {
            pricePerLiter = (t / l).toFixed(2)
        }

        setFormData((prev) => ({
            ...prev,
            litros: litrosVal,
            valor_total: totalVal,
            valor_por_litro: pricePerLiter,
        }))
    }

    const handleVehicleSelect = (vId: string) => {
        const veh = vehicles.find((v) => v.id === vId)
        setSelectedVehicle(veh || null)
        setFormData((prev) => ({
            ...prev,
            vehicle_id: vId,
            km_odometro: veh ? String(veh.km_atual) : "",
            combustivel: veh?.combustivel ? String(veh.combustivel).toLowerCase() : "diesel",
        }))
        setOpenVehiclePopover(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedVehicle) {
            alert("Selecione um veículo válido antes de prosseguir.")
            return
        }

        const targetCompanyId = selectedCompany?.id === "all" ? selectedVehicle.company_id : selectedCompany?.id

        if (!targetCompanyId) {
            alert("Não foi possível identificar a empresa do veículo.")
            return
        }

        setSubmitting(true)
        try {
            const kmAtual = Number(formData.km_odometro)
            const kmAnterior = Number(selectedVehicle.km_atual || 0)
            const litros = Number(formData.litros)
            const valorTotal = Number(formData.valor_total)
            const valorPorLitro = Number(Number(formData.valor_por_litro).toFixed(2))

            let kmDesdeUltimo: number | null = null
            let consumoKml: number | null = null
            let alerta = false

            if (kmAtual > kmAnterior && litros > 0) {
                kmDesdeUltimo = kmAtual - kmAnterior
                consumoKml = Number((kmDesdeUltimo / litros).toFixed(2))

                if (selectedVehicle?.meta_kml && consumoKml < Number(selectedVehicle.meta_kml) * 0.75) {
                    alerta = true
                }
            }

            const payload = {
                company_id: targetCompanyId,
                vehicle_id: formData.vehicle_id,
                driver_id: formData.driver_id || null,
                data: new Date(formData.data).toISOString(),
                km_odometro: kmAtual,
                litros: Number(litros.toFixed(2)),
                valor_total: Number(valorTotal.toFixed(2)),
                valor_por_litro: valorPorLitro,
                combustivel: formData.combustivel.toLowerCase(), // Garante minúsculo para a tabela fuel_records
                posto_fornecedor: formData.posto_fornecedor,
                forma_pagamento: formData.forma_pagamento,
                nota_fiscal_ref: formData.nota_fiscal_ref || null,
                km_desde_ultimo: kmDesdeUltimo,
                consumo_kml: consumoKml,
                alerta,
                observacoes: formData.observacoes || null,
            }

            const { error } = await supabase.from("fuel_records").insert([payload as any])
            if (error) throw error

            if (kmAtual > kmAnterior) {
                await supabase
                    .from("vehicles")
                    .update({ km_atual: kmAtual })
                    .eq("id", formData.vehicle_id)
            }

            router.push("/abastecimentos")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao salvar abastecimento:", err)
            alert(`Erro ao salvar: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    const currentVehicleObj = vehicles.find((v) => v.id === formData.vehicle_id)
    const currentDriverObj = drivers.find((d) => d.id === formData.driver_id)

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/abastecimentos"
                    className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                >
                    <ArrowLeft className="h-4 w-4 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Novo Abastecimento</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Registre as informações da nota ou cupom de combustível</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Veículo e Motorista</h2>

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

                        {/* Pesquisa de Motorista com Autocomplete */}
                        <div className="space-y-1.5 flex flex-col">
                            <Label className="text-xs font-medium text-slate-700">Motorista (Opcional)</Label>
                            <Popover open={openDriverPopover} onOpenChange={setOpenDriverPopover}>
                                <PopoverTrigger className="h-10 w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 hover:bg-slate-50 transition-colors">
                                    {currentDriverObj ? (
                                        <span className="truncate">{currentDriverObj.nome_completo}</span>
                                    ) : (
                                        <span className="text-slate-400">Buscar motorista por nome...</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] sm:w-[350px] p-0 rounded-xl border border-slate-200 bg-white shadow-xl z-50" align="start">
                                    <Command className="bg-white rounded-xl">
                                        <CommandInput placeholder="Digite o nome do motorista..." className="h-9 text-xs" />
                                        <CommandList className="max-h-[220px] overflow-y-auto p-1">
                                            <CommandEmpty className="py-3 text-center text-xs text-slate-500">
                                                Nenhum motorista encontrado.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="nenhum_motorista"
                                                    onSelect={() => {
                                                        setFormData((prev) => ({ ...prev, driver_id: "" }))
                                                        setOpenDriverPopover(false)
                                                    }}
                                                    className="text-xs rounded-lg cursor-pointer py-2 px-2 text-slate-400 italic hover:bg-slate-100"
                                                >
                                                    Nenhum / Não informado
                                                </CommandItem>
                                                {drivers.map((d) => (
                                                    <CommandItem
                                                        key={d.id}
                                                        value={d.nome_completo}
                                                        onSelect={() => {
                                                            setFormData((prev) => ({ ...prev, driver_id: d.id }))
                                                            setOpenDriverPopover(false)
                                                        }}
                                                        className="text-xs rounded-lg cursor-pointer py-2 px-2 hover:bg-slate-100"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-3.5 w-3.5 text-blue-600",
                                                                formData.driver_id === d.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <span className="text-slate-800 font-medium">{d.nome_completo}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Data do Abastecimento *</Label>
                            <Input
                                type="date"
                                value={formData.data}
                                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">KM no Odômetro *</Label>
                            <Input
                                type="number"
                                placeholder={selectedVehicle ? `KM anterior: ${selectedVehicle.km_atual}` : "Ex: 125000"}
                                value={formData.km_odometro}
                                onChange={(e) => setFormData({ ...formData, km_odometro: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Litros, Valores & Combustível</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Quantidade (Litros) *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.litros}
                                onChange={(e) => handleLitrosTotalChange(e.target.value, formData.valor_total)}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Valor Total (R$) *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.valor_total}
                                onChange={(e) => handleLitrosTotalChange(formData.litros, e.target.value)}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Preço por Litro (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.valor_por_litro}
                                onChange={(e) => setFormData({ ...formData, valor_por_litro: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 bg-slate-50"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Combustível *</Label>
                            <Select value={formData.combustivel} onValueChange={(val) => setFormData({ ...formData, combustivel: val || "diesel" })}>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 bg-white">
                                    <SelectItem value="diesel">Diesel</SelectItem>
                                    <SelectItem value="gasolina">Gasolina</SelectItem>
                                    <SelectItem value="etanol">Etanol</SelectItem>
                                    <SelectItem value="flex">Flex</SelectItem>
                                    <SelectItem value="gnv">GNV</SelectItem>
                                    <SelectItem value="eletrico">Elétrico</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Forma de Pagamento *</Label>
                            <Select value={formData.forma_pagamento} onValueChange={(val) => setFormData({ ...formData, forma_pagamento: val || "faturado" })}>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 bg-white">
                                    <SelectItem value="faturado">Faturado / Cartão Frota</SelectItem>
                                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                                    <SelectItem value="pix">PIX</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Fornecedor & Documentação</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Posto / Fornecedor *</Label>
                            <Input
                                placeholder="Ex: Posto Shell BR-101"
                                value={formData.posto_fornecedor}
                                onChange={(e) => setFormData({ ...formData, posto_fornecedor: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Nº Nota / Cupom Fiscal</Label>
                            <Input
                                placeholder="Ex: NF-e 12345"
                                value={formData.nota_fiscal_ref}
                                onChange={(e) => setFormData({ ...formData, nota_fiscal_ref: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Observações</Label>
                        <Textarea
                            placeholder="Anotações sobre a bomba, motorista ou viagem..."
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            className="rounded-xl border-slate-200 text-xs min-h-[70px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/abastecimentos"
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
                                Salvar Abastecimento
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
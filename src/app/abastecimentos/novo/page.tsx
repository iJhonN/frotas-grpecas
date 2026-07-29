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
import { ArrowLeft, Save, Loader2 } from "lucide-react"

export default function NovoAbastecimentoPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [submitting, setSubmitting] = useState(false)
    const [vehicles, setVehicles] = useState<any[]>([])
    const [drivers, setDrivers] = useState<any[]>([])

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
                // 1. Veículos
                const vehRes = await supabase
                    .from("vehicles")
                    .select("id, placa, marca, modelo, km_atual, combustivel, meta_kml")
                    .eq("company_id", selectedCompany.id)

                // 2. Motoristas (ajustado para nome_completo)
                let drvRes = await supabase
                    .from("drivers")
                    .select("id, nome_completo")
                    .eq("company_id", selectedCompany.id)

                if (!drvRes.data || drvRes.data.length === 0) {
                    const fallbackDrv = await supabase
                        .from("drivers")
                        .select("id, nome_completo")
                    drvRes = fallbackDrv
                }

                setVehicles(vehRes.data || [])
                setDrivers(drvRes.data || [])
            } catch (err) {
                console.error("Erro ao carregar opções:", err)
            }
        }
        loadOptions()
    }, [selectedCompany])

    // Auto-calcula Valor por Litro se Litros e Valor Total forem preenchidos
    const handleLitrosTotalChange = (litrosVal: string, totalVal: string) => {
        const l = parseFloat(litrosVal)
        const t = parseFloat(totalVal)

        let pricePerLiter = formData.valor_por_litro
        if (!isNaN(l) && !isNaN(t) && l > 0) {
            pricePerLiter = (t / l).toFixed(3)
        }

        setFormData((prev) => ({
            ...prev,
            litros: litrosVal,
            valor_total: totalVal,
            valor_por_litro: pricePerLiter,
        }))
    }

    const handleVehicleSelect = (vId: string | null) => {
        if (!vId) return
        const veh = vehicles.find((v) => v.id === vId)
        setSelectedVehicle(veh || null)
        setFormData((prev) => ({
            ...prev,
            vehicle_id: vId,
            km_odometro: veh ? String(veh.km_atual) : "",
            combustivel: veh?.combustivel || "diesel",
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCompany) return

        setSubmitting(true)
        try {
            const kmAtual = Number(formData.km_odometro)
            const kmAnterior = selectedVehicle ? Number(selectedVehicle.km_atual) : 0
            const litros = Number(formData.litros)
            const valorTotal = Number(formData.valor_total)
            const valorPorLitro = Number(formData.valor_por_litro)

            let kmDesdeUltimo: number | null = null
            let consumoKml: number | null = null
            let alerta = false

            if (kmAtual > kmAnterior && litros > 0) {
                kmDesdeUltimo = kmAtual - kmAnterior
                consumoKml = Number((kmDesdeUltimo / litros).toFixed(2))

                // Dispara alerta se o consumo for 25% abaixo da meta
                if (selectedVehicle?.meta_kml && consumoKml < Number(selectedVehicle.meta_kml) * 0.75) {
                    alerta = true
                }
            }

            const payload = {
                company_id: selectedCompany.id,
                vehicle_id: formData.vehicle_id,
                driver_id: formData.driver_id || null,
                data: new Date(formData.data).toISOString(),
                km_odometro: kmAtual,
                litros,
                valor_total: valorTotal,
                valor_por_litro: valorPorLitro,
                combustivel: formData.combustivel,
                posto_fornecedor: formData.posto_fornecedor,
                forma_pagamento: formData.forma_pagamento,
                nota_fiscal_ref: formData.nota_fiscal_ref || null,
                km_desde_ultimo: kmDesdeUltimo,
                consumo_kml: consumoKml,
                alerta,
                observacoes: formData.observacoes || null,
            }

            // 1. Salva o registro de abastecimento
            const { error } = await supabase.from("fuel_records").insert([payload as any])
            if (error) throw error

            // 2. Atualiza o KM atual do veículo
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
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Veículo *</Label>
                            <Select
                                value={formData.vehicle_id}
                                onValueChange={(val) => handleVehicleSelect(val)}
                                required
                            >
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
                            <Label className="text-xs font-medium text-slate-700">Motorista (Opcional)</Label>
                            <Select value={formData.driver_id} onValueChange={(val) => setFormData({ ...formData, driver_id: val || "" })}>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Selecione o motorista">
                                        {currentDriverObj?.nome_completo}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {drivers.map((d) => (
                                        <SelectItem key={d.id} value={d.id}>
                                            <span>{d.nome_completo}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                step="0.001"
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
                                <SelectContent>
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
                                <SelectContent>
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
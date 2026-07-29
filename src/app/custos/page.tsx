"use client"

import { useState, useEffect } from "react"
import { useCompany } from "@/contexts/company-context"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    DollarSign,
    Fuel,
    Wrench,
    AlertOctagon,
    FileText,
    TrendingUp,
    TrendingDown,
    Loader2,
    PieChart,
    Car,
} from "lucide-react"

export default function CustosPage() {
    const { selectedCompany } = useCompany()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [totals, setTotals] = useState({
        combustivel: 0,
        manutencao: 0,
        multas: 0,
        documentos: 0,
        geral: 0,
    })

    const [vehicleCosts, setVehicleCosts] = useState<any[]>([])

    const fetchFinancialData = async () => {
        if (!selectedCompany) return
        setLoading(true)

        try {
            // Busca dados em paralelo das 4 fontes de custo + veículos
            const [
                vehRes,
                fuelRes,
                mainRes,
                finesRes,
                docsRes,
            ] = await Promise.all([
                supabase.from("vehicles").select("id, placa, marca, modelo, km_atual").eq("company_id", selectedCompany.id),
                supabase.from("fuel_records").select("vehicle_id, valor_total, km_odometro").eq("company_id", selectedCompany.id),
                supabase.from("maintenances").select("vehicle_id, valor_pecas, valor_mao_obra").eq("company_id", selectedCompany.id),
                supabase.from("fines").select("vehicle_id, valor").eq("company_id", selectedCompany.id),
                supabase.from("vehicle_documents").select("vehicle_id, valor").eq("company_id", selectedCompany.id),
            ])

            const vehicles = vehRes.data || []
            const fuels = fuelRes.data || []
            const mains = mainRes.data || []
            const fines = finesRes.data || []
            const docs = docsRes.data || []

            // Totais consolidados
            const totalFuel = fuels.reduce((acc, curr) => acc + Number(curr.valor_total || 0), 0)
            const totalMain = mains.reduce((acc, curr) => acc + (Number(curr.valor_pecas || 0) + Number(curr.valor_mao_obra || 0)), 0)
            const totalFines = fines.reduce((acc, curr) => acc + Number(curr.valor || 0), 0)
            const totalDocs = docs.reduce((acc, curr) => acc + Number(curr.valor || 0), 0)
            const totalGeral = totalFuel + totalMain + totalFines + totalDocs

            setTotals({
                combustivel: totalFuel,
                manutencao: totalMain,
                multas: totalFines,
                documentos: totalDocs,
                geral: totalGeral,
            })

            // Mapeia custos individuais por veículo e calcula CPK
            const vehicleCostMap = vehicles.map((v) => {
                const vFuels = fuels.filter((f) => f.vehicle_id === v.id)
                const vMains = mains.filter((m) => m.vehicle_id === v.id)
                const vFines = fines.filter((fn) => fn.vehicle_id === v.id)
                const vDocs = docs.filter((d) => d.vehicle_id === v.id)

                const cFuel = vFuels.reduce((acc, curr) => acc + Number(curr.valor_total || 0), 0)
                const cMain = vMains.reduce((acc, curr) => acc + (Number(curr.valor_pecas || 0) + Number(curr.valor_mao_obra || 0)), 0)
                const cFines = vFines.reduce((acc, curr) => acc + Number(curr.valor || 0), 0)
                const cDocs = vDocs.reduce((acc, curr) => acc + Number(curr.valor || 0), 0)
                const cTotal = cFuel + cMain + cFines + cDocs

                // Odômetro máximo registrado
                const kmRodado = Number(v.km_atual || 0)
                const cpk = kmRodado > 0 ? cTotal / kmRodado : 0

                return {
                    id: v.id,
                    placa: v.placa,
                    modelo: `${v.marca} ${v.modelo}`,
                    km_atual: kmRodado,
                    custo_combustivel: cFuel,
                    custo_manutencao: cMain,
                    custo_multas: cFines,
                    custo_documentos: cDocs,
                    custo_total: cTotal,
                    cpk: cpk,
                }
            })

            // Ordena os veículos que mais geraram custo no topo
            vehicleCostMap.sort((a, b) => b.custo_total - a.custo_total)

            setVehicleCosts(vehicleCostMap)
        } catch (err) {
            console.error("Erro ao consolidar custos:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFinancialData()
    }, [selectedCompany])

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Consolidando DRE e custos da frota...</span>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Custos & DRE Operacional
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Análise financeira integrada de combustíveis, manutenções, impostos e Custo por KM (CPK)
                </p>
            </div>

            {/* Totalizador Geral */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Custo Total Acumulado da Frota
                    </span>
                    <div className="text-3xl font-extrabold mt-1 tracking-tight">
                        R$ {totals.geral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                        <span className="text-slate-400 block text-[10px]">Combustível</span>
                        <span className="font-bold text-amber-400">R$ {totals.combustivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                        <span className="text-slate-400 block text-[10px]">Manutenções</span>
                        <span className="font-bold text-purple-400">R$ {totals.manutencao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                        <span className="text-slate-400 block text-[10px]">Multas & Licenças</span>
                        <span className="font-bold text-rose-400">R$ {(totals.multas + totals.documentos).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Cards de Distribuição por Categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Combustível
                        </CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Fuel className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            R$ {totals.combustivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            {totals.geral > 0 ? `${((totals.combustivel / totals.geral) * 100).toFixed(1)}% do gasto total` : "0% do gasto"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Manutenção
                        </CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Wrench className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            R$ {totals.manutencao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            {totals.geral > 0 ? `${((totals.manutencao / totals.geral) * 100).toFixed(1)}% do gasto total` : "0% do gasto"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Multas de Trânsito
                        </CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                            <AlertOctagon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            R$ {totals.multas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            {totals.geral > 0 ? `${((totals.multas / totals.geral) * 100).toFixed(1)}% do gasto total` : "0% do gasto"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Documentos & IPVA
                        </CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <FileText className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            R$ {totals.documentos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            {totals.geral > 0 ? `${((totals.documentos / totals.geral) * 100).toFixed(1)}% do gasto total` : "0% do gasto"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela de CPK e Custos por Veículo */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Car className="h-4 w-4 text-blue-600" />
                            Detalhamento de Custos por Veículo & CPK
                        </h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Ranking de custo total e eficiência por quilômetro rodado</p>
                    </div>
                </div>

                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="text-xs font-semibold text-slate-600">Veículo</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-600">Odômetro (KM)</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-600">Combustível</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-600">Manutenção</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-600">Multas/Docs</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-600">Custo Total</TableHead>
                            <TableHead className="text-xs font-semibold text-slate-600">CPK (R$/KM)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vehicleCosts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-400">
                                    Nenhum custo registrado para os veículos desta empresa.
                                </TableCell>
                            </TableRow>
                        ) : (
                            vehicleCosts.map((v) => (
                                <TableRow key={v.id} className="hover:bg-slate-50/80 transition-colors">
                                    <TableCell className="text-xs">
                                        <span className="font-bold text-slate-900 block">{v.placa}</span>
                                        <span className="text-[10px] text-slate-500">{v.modelo}</span>
                                    </TableCell>
                                    <TableCell className="text-xs font-semibold text-slate-700">
                                        {v.km_atual.toLocaleString("pt-BR")} km
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-700">
                                        R$ {v.custo_combustivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-700">
                                        R$ {v.custo_manutencao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-700">
                                        R$ {(v.custo_multas + v.custo_documentos).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-xs font-bold text-slate-900">
                                        R$ {v.custo_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        <Badge
                                            variant="outline"
                                            className={
                                                v.cpk > 2.5
                                                    ? "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                                                    : v.cpk > 1.2
                                                        ? "bg-amber-50 text-amber-700 border-amber-200 font-semibold"
                                                        : "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                                            }
                                        >
                                            R$ {v.cpk.toFixed(2)} / km
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useCompany } from "@/contexts/company-context"
import { createClient } from "@/lib/supabase/client"
import { LgpdModal } from "@/components/lgpd-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Car,
    Fuel,
    Wrench,
    AlertOctagon,
    AlertTriangle,
    Loader2,
    ArrowUpRight,
    FileText,
    TrendingUp,
    Users,
} from "lucide-react"

export default function DashboardPage() {
    const { selectedCompany } = useCompany()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalVehicles: 0,
        activeVehicles: 0,
        maintenanceVehicles: 0,
        totalDrivers: 0,
        cnhExpiringCount: 0,
        fuelCostMonth: 0,
        avgFuelPriceMonth: 0,
        maintenanceCostMonth: 0,
        pendingFinesCount: 0,
        pendingFinesValue: 0,
        documentsExpiredCount: 0,
    })

    const [recentFuel, setRecentFuel] = useState<any[]>([])
    const [recentMaintenances, setRecentMaintenances] = useState<any[]>([])

    const fetchDashboardData = async () => {
        if (!selectedCompany) return
        setLoading(true)

        try {
            const today = new Date()
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
            const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
            const currentYear = today.getFullYear()

            // Queries Dinâmicas com base na seleção de empresa
            let vehQuery = supabase.from("vehicles").select("id, status, company_id")
            let drvQuery = supabase.from("drivers").select("id, company_id")
            let cnhQuery = supabase.from("drivers").select("id, company_id").lte("cnh_validade", in30Days)
            let fuelQuery = supabase.from("fuel_records").select("valor_total, litros, valor_por_litro, company_id").gte("data", startOfMonth)
            let mainQuery = supabase.from("maintenances").select("valor_pecas, valor_mao_obra, company_id").gte("data", startOfMonth)
            let finesQuery = supabase.from("fines").select("valor, company_id").eq("status", "pendente")
            let docQuery = supabase.from("vehicle_documents").select("id, ref_ano, situacao, company_id")

            let recentFuelQuery = supabase
                .from("fuel_records")
                .select("id, data, valor_total, consumo_kml, vehicles(placa)")
                .order("data", { ascending: false })
                .limit(5)

            let recentMainQuery = supabase
                .from("maintenances")
                .select("id, data, descricao, valor_pecas, valor_mao_obra, vehicles(placa)")
                .order("data", { ascending: false })
                .limit(5)

            // Se uma empresa específica estiver selecionada
            if (selectedCompany.id !== "all") {
                vehQuery = vehQuery.eq("company_id", selectedCompany.id)
                drvQuery = drvQuery.eq("company_id", selectedCompany.id)
                cnhQuery = cnhQuery.eq("company_id", selectedCompany.id)
                fuelQuery = fuelQuery.eq("company_id", selectedCompany.id)
                mainQuery = mainQuery.eq("company_id", selectedCompany.id)
                finesQuery = finesQuery.eq("company_id", selectedCompany.id)
                docQuery = docQuery.eq("company_id", selectedCompany.id)
                recentFuelQuery = recentFuelQuery.eq("company_id", selectedCompany.id)
                recentMainQuery = recentMainQuery.eq("company_id", selectedCompany.id)
            }

            // Consulta paralela para alta performance
            const [
                vehRes,
                drvRes,
                cnhRes,
                fuelRes,
                mainRes,
                finesRes,
                docRes,
                recentFuelRes,
                recentMainRes,
            ] = await Promise.all([
                vehQuery,
                drvQuery,
                cnhQuery,
                fuelQuery,
                mainQuery,
                finesQuery,
                docQuery,
                recentFuelQuery,
                recentMainQuery,
            ])

            const vehicles = vehRes.data || []
            const fuelMonth = fuelRes.data || []
            const mainMonth = mainRes.data || []
            const fines = finesRes.data || []
            const docs = docRes.data || []

            const fuelTotalMonth = fuelMonth.reduce((acc, curr) => acc + Number(curr.valor_total || 0), 0)
            const fuelTotalLitros = fuelMonth.reduce((acc, curr) => acc + Number(curr.litros || 0), 0)
            const avgFuelPrice = fuelTotalLitros > 0 ? fuelTotalMonth / fuelTotalLitros : 0

            const mainTotalMonth = mainMonth.reduce((acc, curr) => acc + (Number(curr.valor_pecas || 0) + Number(curr.valor_mao_obra || 0)), 0)
            const finesTotalValue = fines.reduce((acc, curr) => acc + Number(curr.valor || 0), 0)

            // Contagem de veículos ativos e em manutenção
            const activeVehiclesCount = vehicles.filter((v: any) =>
                v.status === "ativo_disponivel" || v.status === "locado" || v.status === "ativo"
            ).length

            const maintenanceVehiclesCount = vehicles.filter((v: any) =>
                v.status === "em_manutencao" || v.status === "manutencao"
            ).length

            // Documentos com ano_exercicio inferior ao ano atual ou vencidos
            const expiredDocsCount = docs.filter((d: any) =>
                Number(d.ref_ano) < currentYear || d.situacao === "vencido"
            ).length

            setStats({
                totalVehicles: vehicles.length,
                activeVehicles: activeVehiclesCount,
                maintenanceVehicles: maintenanceVehiclesCount,
                totalDrivers: drvRes.data?.length || 0,
                cnhExpiringCount: cnhRes.data?.length || 0,
                fuelCostMonth: fuelTotalMonth,
                avgFuelPriceMonth: avgFuelPrice,
                maintenanceCostMonth: mainTotalMonth,
                pendingFinesCount: fines.length,
                pendingFinesValue: finesTotalValue,
                documentsExpiredCount: expiredDocsCount,
            })

            setRecentFuel(recentFuelRes.data || [])
            setRecentMaintenances(recentMainRes.data || [])
        } catch (err) {
            console.error("Erro ao carregar dados do Dashboard:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [selectedCompany])

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Consolidando indicadores operacionais...</span>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Modal de consentimento LGPD */}
            <LgpdModal />

            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Visão Geral & Indicadores
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Panorama consolidado da frota, custos operacionais e alertas da {(selectedCompany as any)?.razao_social || (selectedCompany as any)?.nome_fantasia || "empresa"}
                </p>
            </div>

            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Veículos */}
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Veículos
                        </CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Car className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.totalVehicles}</div>
                        <div className="flex items-center gap-1 mt-1 text-[11px] truncate">
                            <span className="text-emerald-600 font-semibold">{stats.activeVehicles} em op.</span>
                            {stats.maintenanceVehicles > 0 && (
                                <span className="text-rose-600 font-medium">&bull; {stats.maintenanceVehicles} em manut.</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Motoristas */}
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Motoristas
                        </CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.totalDrivers}</div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            {stats.cnhExpiringCount > 0 ? `${stats.cnhExpiringCount} CNH(s) a vencer` : "Cadastro regular"}
                        </p>
                    </CardContent>
                </Card>

                {/* Combustível */}
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Combustível (Mês)
                        </CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Fuel className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-slate-900 truncate">
                            R$ {stats.fuelCostMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Média R$ {stats.avgFuelPriceMonth.toFixed(2)} / L
                        </p>
                    </CardContent>
                </Card>

                {/* Manutenção */}
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Manutenção (Mês)
                        </CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Wrench className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-slate-900 truncate">
                            R$ {stats.maintenanceCostMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Peças e mão de obra</p>
                    </CardContent>
                </Card>

                {/* CRLV / Documentos */}
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            CRLV Atrasado
                        </CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <FileText className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.documentsExpiredCount}</div>
                        <p className="text-[11px] text-slate-500 mt-1">Documentos pendentes</p>
                    </CardContent>
                </Card>

                {/* Multas Pendentes */}
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Multas Pendentes
                        </CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                            <AlertOctagon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.pendingFinesCount}</div>
                        <p className="text-[11px] text-rose-600 font-semibold mt-1 truncate">
                            Total: R$ {stats.pendingFinesValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Alertas e Notificações Rápidas */}
            {(stats.cnhExpiringCount > 0 || stats.maintenanceVehicles > 0 || stats.documentsExpiredCount > 0) && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-amber-900">Atenção Requerida na Frota</h3>
                            <p className="text-[11px] text-amber-800 mt-0.5">
                                {stats.cnhExpiringCount > 0 && `${stats.cnhExpiringCount} CNH(s) a vencer. `}
                                {stats.documentsExpiredCount > 0 && `${stats.documentsExpiredCount} documento(s) atrasado(s). `}
                                {stats.maintenanceVehicles > 0 && `${stats.maintenanceVehicles} veículo(s) em manutenção.`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <Link
                            href="/documentos"
                            className="text-xs font-semibold text-amber-900 underline hover:text-amber-950 whitespace-nowrap"
                        >
                            Ver Documentos &rarr;
                        </Link>
                    </div>
                </div>
            )}

            {/* Listas Recentes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Abastecimentos Recentes */}
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                        <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Fuel className="h-4 w-4 text-amber-600" />
                            Últimos Abastecimentos
                        </CardTitle>
                        <Link href="/abastecimentos" className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1">
                            <span>Ver todos</span>
                            <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        {recentFuel.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 text-center">Nenhum abastecimento recente.</p>
                        ) : (
                            recentFuel.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                    <div>
                                        <span className="font-bold text-slate-900">{item.vehicles?.placa || "N/I"}</span>
                                        <span className="text-[10px] text-slate-500 block">
                                            {new Date(item.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-slate-900 block">
                                            R$ {Number(item.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        {item.consumo_kml && (
                                            <span className="text-[10px] text-emerald-600 font-semibold">
                                                {Number(item.consumo_kml).toFixed(2)} km/L
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Manutenções Recentes */}
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                        <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-purple-600" />
                            Últimas Manutenções
                        </CardTitle>
                        <Link href="/manutencoes" className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1">
                            <span>Ver todas</span>
                            <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        {recentMaintenances.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 text-center">Nenhuma manutenção recente.</p>
                        ) : (
                            recentMaintenances.map((item) => {
                                const total = Number(item.valor_pecas || 0) + Number(item.valor_mao_obra || 0)
                                return (
                                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                        <div>
                                            <span className="font-bold text-slate-900">{item.vehicles?.placa || "N/I"}</span>
                                            <span className="text-[10px] text-slate-500 block max-w-[180px] truncate">{item.descricao}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-slate-900 block">
                                                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(item.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
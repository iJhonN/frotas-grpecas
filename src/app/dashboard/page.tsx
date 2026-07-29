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
        maintenanceCostMonth: 0,
        pendingFinesCount: 0,
        pendingFinesValue: 0,
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

            // Consulta paralela para alta performance
            const [
                vehRes,
                drvRes,
                cnhRes,
                fuelRes,
                mainRes,
                finesRes,
                recentFuelRes,
                recentMainRes,
            ] = await Promise.all([
                // 1. Total e status de veículos
                supabase.from("vehicles").select("id, status").eq("company_id", selectedCompany.id),

                // 2. Total de motoristas
                supabase.from("drivers").select("id").eq("company_id", selectedCompany.id),

                // 3. CNHs a vencer nos próximos 30 dias
                supabase.from("drivers").select("id").eq("company_id", selectedCompany.id).lte("cnh_validade", in30Days),

                // 4. Abastecimentos no mês atual
                supabase.from("fuel_records").select("valor_total").eq("company_id", selectedCompany.id).gte("data", startOfMonth),

                // 5. Manutenções no mês atual
                supabase.from("maintenances").select("valor_pecas, valor_mao_obra").eq("company_id", selectedCompany.id).gte("data", startOfMonth),

                // 6. Multas pendentes
                supabase.from("fines").select("valor").eq("company_id", selectedCompany.id).eq("status", "pendente"),

                // 7. Últimos 5 abastecimentos
                supabase.from("fuel_records").select("id, data, valor_total, consumo_kml, vehicles(placa)").eq("company_id", selectedCompany.id).order("data", { ascending: false }).limit(5),

                // 8. Últimas 5 manutenções
                supabase.from("maintenances").select("id, data, descricao, valor_pecas, valor_mao_obra, vehicles(placa)").eq("company_id", selectedCompany.id).order("data", { ascending: false }).limit(5),
            ])

            const vehicles = vehRes.data || []
            const fuelMonth = fuelRes.data || []
            const mainMonth = mainRes.data || []
            const fines = finesRes.data || []

            const fuelTotalMonth = fuelMonth.reduce((acc, curr) => acc + Number(curr.valor_total || 0), 0)
            const mainTotalMonth = mainMonth.reduce((acc, curr) => acc + (Number(curr.valor_pecas || 0) + Number(curr.valor_mao_obra || 0)), 0)
            const finesTotalValue = fines.reduce((acc, curr) => acc + Number(curr.valor || 0), 0)

            // Contagem com tratamento seguro dos enums de status do veículo
            const activeVehiclesCount = vehicles.filter((v: any) =>
                v.status === "ativo_disponivel" || v.status === "locado" || v.status === "ativo"
            ).length

            const maintenanceVehiclesCount = vehicles.filter((v: any) =>
                v.status === "em_manutencao" || v.status === "manutencao"
            ).length

            setStats({
                totalVehicles: vehicles.length,
                activeVehicles: activeVehiclesCount,
                maintenanceVehicles: maintenanceVehiclesCount,
                totalDrivers: drvRes.data?.length || 0,
                cnhExpiringCount: cnhRes.data?.length || 0,
                fuelCostMonth: fuelTotalMonth,
                maintenanceCostMonth: mainTotalMonth,
                pendingFinesCount: fines.length,
                pendingFinesValue: finesTotalValue,
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
                <span className="text-xs font-medium">Consolidando dados operacionais...</span>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Modal de consentimento LGPD exibido no primeiro acesso */}
            <LgpdModal />

            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Visão Geral & Indicadores
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Panorama consolidado da frota, custos operacionais e alertas da {(selectedCompany as any)?.razao_social || (selectedCompany as any)?.nome || "empresa"}
                </p>
            </div>

            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Veículos da Frota
                        </CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Car className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.totalVehicles}</div>
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                            <span className="text-emerald-600 font-semibold">{stats.activeVehicles} em operação</span>
                            {stats.maintenanceVehicles > 0 && (
                                <span className="text-rose-600 font-medium">&bull; {stats.maintenanceVehicles} em manutenção</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

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
                        <div className="text-2xl font-bold text-slate-900">
                            R$ {stats.fuelCostMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Gasto total acumulado no mês atual</p>
                    </CardContent>
                </Card>

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
                        <div className="text-2xl font-bold text-slate-900">
                            R$ {stats.maintenanceCostMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Peças e mão de obra no mês atual</p>
                    </CardContent>
                </Card>

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
                        <p className="text-[11px] text-rose-600 font-medium mt-1">
                            Total: R$ {stats.pendingFinesValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Alertas e Notificações Rápidas */}
            {(stats.cnhExpiringCount > 0 || stats.maintenanceVehicles > 0) && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-amber-900">Atenção Requerida na Frota</h3>
                            <p className="text-[11px] text-amber-800 mt-0.5">
                                {stats.cnhExpiringCount > 0 && `${stats.cnhExpiringCount} CNH(s) de motoristas com vencimento próximo. `}
                                {stats.maintenanceVehicles > 0 && `${stats.maintenanceVehicles} veículo(s) indisponível(is) em oficina.`}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/motoristas"
                        className="text-xs font-semibold text-amber-900 underline hover:text-amber-950 whitespace-nowrap self-start sm:self-auto"
                    >
                        Ver Motoristas &rarr;
                    </Link>
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
                                        <span className="font-bold text-slate-900">{item.vehicles?.placa}</span>
                                        <span className="text-[10px] text-slate-500 block">{new Date(item.data).toLocaleDateString("pt-BR")}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-slate-900 block">
                                            R$ {Number(item.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                                            <span className="font-bold text-slate-900">{item.vehicles?.placa}</span>
                                            <span className="text-[10px] text-slate-500 block max-w-[180px] truncate">{item.descricao}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-slate-900 block">
                                                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(item.data).toLocaleDateString("pt-BR")}
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
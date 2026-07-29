"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCompany } from "@/contexts/company-context"
import { createClient } from "@/lib/supabase/client"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Fuel, Loader2, AlertTriangle } from "lucide-react"

export default function AbastecimentosPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const [records, setRecords] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const supabase = createClient()

    const fetchRecords = async () => {
        if (!selectedCompany) return
        setLoading(true)
        try {
            let query = supabase
                .from("fuel_records")
                .select(`
                    *,
                    vehicles (placa, marca, modelo),
                    drivers (nome_completo)
                `)

            // Aplica o filtro de empresa apenas se NÃO for "Todas as Empresas"
            if (selectedCompany.id !== "all") {
                query = query.eq("company_id", selectedCompany.id)
            }

            const { data, error } = await query.order("data", { ascending: false })

            if (error) {
                console.error("Detalhes do erro Supabase:", error)
                throw error
            }

            setRecords(data || [])
        } catch (err) {
            console.error("Erro ao carregar abastecimentos:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRecords()
    }, [selectedCompany])

    const filteredRecords = records.filter((r) => {
        const termo = search.toLowerCase()
        const placa = r.vehicles?.placa?.toLowerCase() || ""
        const motorista = r.drivers?.nome_completo?.toLowerCase() || ""
        const posto = r.posto_fornecedor?.toLowerCase() || ""

        return placa.includes(termo) || motorista.includes(termo) || posto.includes(termo)
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Gestão de Abastecimentos
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Acompanhe o consumo de combustível, custos e alertas da frota
                    </p>
                </div>

                <Link
                    href="/abastecimentos/novo"
                    className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-medium shadow-sm gap-2 whitespace-nowrap" })}
                >
                    <Plus className="h-4 w-4" />
                    <span>Novo Abastecimento</span>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por placa, motorista ou posto..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 border-slate-200 rounded-lg text-xs"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-xs">Carregando abastecimentos...</span>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Fuel className="h-8 w-8 text-slate-300" />
                        <span className="text-sm font-medium text-slate-600">Nenhum abastecimento encontrado</span>
                        <span className="text-xs text-slate-400">Registre os cupons de combustível para acompanhar o consumo</span>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="text-xs font-semibold text-slate-600">Data</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Veículo</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Motorista</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">KM Odômetro</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Litros / R$/L</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Valor Total</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Média KM/L</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Posto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRecords.map((r) => {
                                const dataFormatted = new Date(r.data).toLocaleDateString("pt-BR")
                                return (
                                    <TableRow
                                        key={r.id}
                                        onClick={() => router.push(`/abastecimentos/${r.id}`)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    >
                                        <TableCell className="text-xs font-medium text-slate-700">
                                            {dataFormatted}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <span className="font-bold text-slate-900 block">{r.vehicles?.placa || "N/A"}</span>
                                            <span className="text-[10px] text-slate-500">{r.vehicles?.marca} {r.vehicles?.modelo}</span>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-700 font-medium">
                                            {r.drivers?.nome_completo || "Não informado"}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-700 font-semibold">
                                            {Number(r.km_odometro).toLocaleString("pt-BR")} km
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-600">
                                            {Number(r.litros).toFixed(2)}L &bull; R$ {Number(r.valor_por_litro).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-xs font-bold text-slate-900">
                                            R$ {Number(r.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {r.consumo_kml ? (
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        r.alerta
                                                            ? "bg-rose-50 text-rose-700 border-rose-200 font-semibold gap-1"
                                                            : "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                                                    }
                                                >
                                                    {r.alerta && <AlertTriangle className="h-3 w-3 text-rose-600" />}
                                                    {Number(r.consumo_kml).toFixed(2)} km/L
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-600 max-w-[140px] truncate">
                                            {r.posto_fornecedor}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    )
}
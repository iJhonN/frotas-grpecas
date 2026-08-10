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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Fuel, Loader2, AlertTriangle, Calendar, DollarSign, Droplets, Filter, X } from "lucide-react"

export default function AbastecimentosPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [records, setRecords] = useState<any[]>([])
    const [companies, setCompanies] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filtros
    const [search, setSearch] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setStartDateEnd] = useState("")
    const [companyFilter, setCompanyFilter] = useState("all")

    // Sincroniza o filtro com o contexto global de empresas
    useEffect(() => {
        if (selectedCompany?.id) {
            setCompanyFilter(selectedCompany.id)
        }
    }, [selectedCompany])

    // Carrega a lista de empresas para o Select
    useEffect(() => {
        async function fetchCompanies() {
            try {
                const { data } = await supabase.from("companies").select("id, nome_fantasia").order("nome_fantasia")
                setCompanies(data || [])
            } catch (err) {
                console.error("Erro ao carregar empresas:", err)
            }
        }
        fetchCompanies()
    }, [])

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

            // Filtro por empresa
            if (companyFilter !== "all") {
                query = query.eq("company_id", companyFilter)
            }

            // Filtro por Data Inicial
            if (startDate) {
                query = query.gte("data", new Date(startDate).toISOString())
            }

            // Filtro por Data Final
            if (endDate) {
                const endDateTime = new Date(endDate)
                endDateTime.setHours(23, 59, 59, 999)
                query = query.lte("data", endDateTime.toISOString())
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
    }, [selectedCompany, companyFilter, startDate, endDate])

    // Filtro local de busca rápida (placa, motorista ou posto)
    const filteredRecords = records.filter((r) => {
        const termo = search.toLowerCase()
        const placa = r.vehicles?.placa?.toLowerCase() || ""
        const motorista = r.drivers?.nome_completo?.toLowerCase() || ""
        const posto = r.posto_fornecedor?.toLowerCase() || ""

        return placa.includes(termo) || motorista.includes(termo) || posto.includes(termo)
    })

    // Totais e Cálculos Consolidados
    const totalValor = filteredRecords.reduce((acc, r) => acc + Number(r.valor_total || 0), 0)
    const totalLitros = filteredRecords.reduce((acc, r) => acc + Number(r.litros || 0), 0)
    const registrosComKml = filteredRecords.filter((r) => r.consumo_kml)
    const mediaKmlGeral = registrosComKml.length > 0
        ? (registrosComKml.reduce((acc, r) => acc + Number(r.consumo_kml), 0) / registrosComKml.length).toFixed(2)
        : null

    const clearDateFilters = () => {
        setStartDate("")
        setStartDateEnd("")
    }

    return (
        <div className="space-y-6 pb-12">
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
                    className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-medium shadow-sm gap-2 whitespace-nowrap self-start sm:self-auto" })}
                >
                    <Plus className="h-4 w-4" />
                    <span>Novo Abastecimento</span>
                </Link>
            </div>

            {/* Cards de Resumo dos Totais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Total Investido</span>
                        <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                            R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <DollarSign className="h-5 w-5" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Volume de Combustível</span>
                        <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                            {totalLitros.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L
                        </span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Droplets className="h-5 w-5" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Qtd. Abastecimentos</span>
                        <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                            {filteredRecords.length}
                        </span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                        <Fuel className="h-5 w-5" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Média Geral Consumo</span>
                        <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                            {mediaKmlGeral ? `${mediaKmlGeral} km/L` : "-"}
                        </span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Filter className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Barra de Filtros Integrada */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Busca Rápida */}
                    <div className="relative lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por placa, motorista ou posto..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-10 border-slate-200 rounded-xl text-xs"
                        />
                    </div>

                    {/* Filtro por Empresa */}
                    <div>
                        <Select value={companyFilter} onValueChange={(val) => setCompanyFilter(val)}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs">
                                <SelectValue placeholder="Selecione a empresa" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 bg-white">
                                <SelectItem value="all">Todas as Empresas</SelectItem>
                                {companies.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.nome_fantasia}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Data Inicial */}
                    <div className="relative">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-10 border-slate-200 rounded-xl text-xs"
                        />
                    </div>

                    {/* Data Final */}
                    <div className="relative">
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setStartDateEnd(e.target.value)}
                            className="h-10 border-slate-200 rounded-xl text-xs"
                        />
                    </div>
                </div>

                {/* Status dos Filtros de Data Ativos */}
                {(startDate || endDate) && (
                    <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-slate-500 font-medium">Filtro de Período Ativo:</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {startDate ? new Date(startDate).toLocaleDateString("pt-BR") : "Início"} até {endDate ? new Date(endDate).toLocaleDateString("pt-BR") : "Hoje"}
                            <button onClick={clearDateFilters} className="hover:text-blue-900 ml-1">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    </div>
                )}
            </div>

            {/* Tabela de Abastecimentos */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-xs">Carregando abastecimentos...</span>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Fuel className="h-8 w-8 text-slate-300" />
                        <span className="text-sm font-medium text-slate-600">Nenhum abastecimento encontrado</span>
                        <span className="text-xs text-slate-400">Ajuste os filtros de busca ou cadastre um novo abastecimento</span>
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
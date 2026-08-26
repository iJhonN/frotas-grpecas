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
import { Plus, Search, Car, Loader2, X, FileText, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function VeiculosPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const [vehicles, setVehicles] = useState<any[]>([])
    const [documents, setDocuments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filtros e Ordenação
    const [search, setSearch] = useState("")
    const [rastreadorFilter, setRastreadorFilter] = useState("all")
    const [tacografoFilter, setTacografoFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [documentoFilter, setDocumentoFilter] = useState("all")
    const [sortBy, setSortBy] = useState("placa_asc")

    const supabase = createClient()
    const currentYear = new Date().getFullYear()

    const fetchData = async () => {
        if (!selectedCompany) return
        setLoading(true)
        try {
            let vehQuery = supabase.from("vehicles").select("*")
            let docQuery = supabase.from("vehicle_documents").select("*")

            if (selectedCompany.id !== "all") {
                vehQuery = vehQuery.eq("company_id", selectedCompany.id)
                docQuery = docQuery.eq("company_id", selectedCompany.id)
            }

            const [vehRes, docRes] = await Promise.all([
                vehQuery.order("created_at", { ascending: false }),
                docQuery.order("ref_ano", { ascending: false }),
            ])

            if (vehRes.error) throw vehRes.error

            setVehicles(vehRes.data || [])
            setDocuments(docRes.data || [])
        } catch (err) {
            console.error("Erro ao carregar veículos/documentos:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [selectedCompany])

    const getExtraInfo = (observacoes: string | null) => {
        if (!observacoes) return { rastreador: "nao_possui", tacografo: "nao_possui" }
        try {
            const parsed = JSON.parse(observacoes)
            return {
                rastreador: parsed.rastreador_status || "nao_possui",
                tacografo: parsed.tacografo_status || "nao_possui",
            }
        } catch (e) {
            return { rastreador: "nao_possui", tacografo: "nao_possui" }
        }
    }

    // Identifica o status do documento do veículo com base no ano exercício
    const getDocumentStatus = (vehicleId: string) => {
        const docList = documents.filter((d) => d.vehicle_id === vehicleId)
        if (docList.length === 0) return { status: "nao_cadastrado", label: "Não cadastrado" }

        // Pega o documento do ano exercício mais recente
        const latestDoc = docList[0]
        const isAtrasado = Number(latestDoc.ref_ano) < currentYear || latestDoc.situacao === "vencido"

        if (isAtrasado) {
            return { status: "atrasado", label: "Atrasado", ano: latestDoc.ref_ano }
        }
        return { status: "em_dia", label: "Em dia", ano: latestDoc.ref_ano }
    }

    // Filtragem dinâmica local
    const filteredVehicles = vehicles.filter((v) => {
        const termo = search.toLowerCase()
        const matchesSearch = (
            (v.placa && v.placa.toLowerCase().includes(termo)) ||
            (v.modelo && v.modelo.toLowerCase().includes(termo)) ||
            (v.marca && v.marca.toLowerCase().includes(termo))
        )

        const { rastreador, tacografo } = getExtraInfo(v.observacoes)
        const docInfo = getDocumentStatus(v.id)

        const matchesRastreador = rastreadorFilter === "all" || rastreador === rastreadorFilter
        const matchesTacografo = tacografoFilter === "all" || tacografo === tacografoFilter
        const matchesStatus = statusFilter === "all" || v.status === statusFilter
        const matchesDocumento = documentoFilter === "all" || docInfo.status === documentoFilter

        return matchesSearch && matchesRastreador && matchesTacografo && matchesStatus && matchesDocumento
    })

    // Ordenação
    const sortedVehicles = [...filteredVehicles].sort((a, b) => {
        switch (sortBy) {
            case "placa_asc":
                return (a.placa || "").localeCompare(b.placa || "")
            case "modelo_asc":
                return `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`)
            case "ano_desc":
                return Number(b.ano_fabricacao || b.ano_modelo || 0) - Number(a.ano_fabricacao || a.ano_modelo || 0)
            case "ano_asc":
                return Number(a.ano_fabricacao || a.ano_modelo || 0) - Number(b.ano_fabricacao || b.ano_modelo || 0)
            case "km_desc":
                return Number(b.km_atual || 0) - Number(a.km_atual || 0)
            default:
                return 0
        }
    })

    const clearFilters = () => {
        setSearch("")
        setRastreadorFilter("all")
        setTacografoFilter("all")
        setStatusFilter("all")
        setDocumentoFilter("all")
        setSortBy("placa_asc")
    }

    const hasActiveFilters = search !== "" || rastreadorFilter !== "all" || tacografoFilter !== "all" || statusFilter !== "all" || documentoFilter !== "all"

    const getRastreadorLabel = (val: string) => {
        switch (val) {
            case "online": return "Rastreador: Online"
            case "offline": return "Rastreador: Offline"
            case "nao_possui": return "Rastreador: Não possui"
            default: return "Rastreador: Todos"
        }
    }

    const getTacografoLabel = (val: string) => {
        switch (val) {
            case "em_dias": return "Tacógrafo: Em dia"
            case "defeito": return "Tacógrafo: Com Defeito"
            case "atrasado": return "Tacógrafo: Atrasado"
            case "nao_possui": return "Tacógrafo: Não possui"
            default: return "Tacógrafo: Todos"
        }
    }

    const getStatusLabel = (val: string) => {
        switch (val) {
            case "ativo_disponivel": return "Status: Disponível"
            case "em_manutencao": return "Status: Em Manutenção"
            case "inativo": return "Status: Inativo"
            default: return "Status: Todos"
        }
    }

    const getDocumentoLabel = (val: string) => {
        switch (val) {
            case "em_dia": return "CRLV: Em dia"
            case "atrasado": return "CRLV: Atrasado"
            case "nao_cadastrado": return "CRLV: Não cadastrado"
            default: return "CRLV: Todos"
        }
    }

    const getSortLabel = (val: string) => {
        switch (val) {
            case "placa_asc": return "Ordem: Placa (A-Z)"
            case "modelo_asc": return "Ordem: Marca/Modelo (A-Z)"
            case "ano_desc": return "Ordem: Ano (Mais Novo)"
            case "ano_asc": return "Ordem: Ano (Mais Antigo)"
            case "km_desc": return "Ordem: Maior KM"
            default: return "Ordenar por..."
        }
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Gestão de Veículos
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Cadastre e acompanhe a frota vinculada à empresa ativa
                    </p>
                </div>

                <Link
                    href="/veiculos/novo"
                    className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-medium shadow-sm gap-2 whitespace-nowrap self-start sm:self-auto" })}
                >
                    <Plus className="h-4 w-4" />
                    <span>Novo Veículo</span>
                </Link>
            </div>

            {/* Barra de Busca e Filtros Avançados */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    {/* Busca Rápida */}
                    <div className="relative xl:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por placa, modelo ou marca..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-10 border-slate-200 rounded-xl text-xs w-full"
                        />
                    </div>

                    {/* Filtro de Documento / CRLV */}
                    <div>
                        <Select value={documentoFilter} onValueChange={(val) => setDocumentoFilter(val || "all")}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs w-full bg-white">
                                <SelectValue>{getDocumentoLabel(documentoFilter)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 bg-white">
                                <SelectItem value="all">CRLV: Todos</SelectItem>
                                <SelectItem value="em_dia">Em dia</SelectItem>
                                <SelectItem value="atrasado">Atrasado</SelectItem>
                                <SelectItem value="nao_cadastrado">Não cadastrado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filtro de Rastreador */}
                    <div>
                        <Select value={rastreadorFilter} onValueChange={(val) => setRastreadorFilter(val || "all")}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs w-full bg-white">
                                <SelectValue>{getRastreadorLabel(rastreadorFilter)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 bg-white">
                                <SelectItem value="all">Rastreador: Todos</SelectItem>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="offline">Offline</SelectItem>
                                <SelectItem value="nao_possui">Não possui</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filtro de Tacógrafo */}
                    <div>
                        <Select value={tacografoFilter} onValueChange={(val) => setTacografoFilter(val || "all")}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs w-full bg-white">
                                <SelectValue>{getTacografoLabel(tacografoFilter)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 bg-white">
                                <SelectItem value="all">Tacógrafo: Todos</SelectItem>
                                <SelectItem value="em_dias">Em dia</SelectItem>
                                <SelectItem value="defeito">Com Defeito</SelectItem>
                                <SelectItem value="atrasado">Atrasado</SelectItem>
                                <SelectItem value="nao_possui">Não possui</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Ordenação */}
                    <div>
                        <Select value={sortBy} onValueChange={(val) => setSortBy(val || "placa_asc")}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs w-full bg-slate-50 font-medium">
                                <SelectValue>{getSortLabel(sortBy)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 bg-white">
                                <SelectItem value="placa_asc">Placa (A-Z)</SelectItem>
                                <SelectItem value="modelo_asc">Marca/Modelo (A-Z)</SelectItem>
                                <SelectItem value="ano_desc">Ano (Mais Novo)</SelectItem>
                                <SelectItem value="ano_asc">Ano (Mais Antigo)</SelectItem>
                                <SelectItem value="km_desc">Maior KM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Botão de Limpar Filtros */}
                {hasActiveFilters && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500 font-medium">
                            {sortedVehicles.length} veículo(s) encontrado(s)
                        </span>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-medium hover:underline cursor-pointer"
                        >
                            <X className="h-3 w-3" />
                            Limpar Filtros
                        </button>
                    </div>
                )}
            </div>

            {/* Tabela de Veículos */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-xs">Carregando veículos da frota...</span>
                    </div>
                ) : sortedVehicles.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Car className="h-8 w-8 text-slate-300" />
                        <span className="text-sm font-medium text-slate-600">Nenhum veículo encontrado</span>
                        <span className="text-xs text-slate-400">
                            {hasActiveFilters ? "Tente ajustar os filtros selecionados" : "Cadastre um novo veículo para incluir na frota"}
                        </span>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="text-xs font-semibold text-slate-600">Placa</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Veículo / Ano</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">CRLV / Doc.</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">KM Atual</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Rastreador</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Tacógrafo</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedVehicles.map((vehicle) => {
                                const { rastreador, tacografo } = getExtraInfo(vehicle.observacoes)
                                const docInfo = getDocumentStatus(vehicle.id)

                                return (
                                    <TableRow
                                        key={vehicle.id}
                                        onClick={() => router.push(`/veiculos/${vehicle.id}`)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    >
                                        <TableCell className="font-bold text-slate-900 text-sm">
                                            {vehicle.placa}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-700 font-medium">
                                            <div>{vehicle.marca} {vehicle.modelo}</div>
                                            <span className="text-[10px] text-slate-400 font-normal">
                                                Ano: {vehicle.ano_fabricacao || vehicle.ano_modelo || "N/I"} &bull; {vehicle.combustivel}
                                            </span>
                                        </TableCell>

                                        {/* Status do CRLV / Documento */}
                                        <TableCell className="text-xs">
                                            {docInfo.status === "em_dia" && (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium gap-1">
                                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                    Em dia ({docInfo.ano})
                                                </Badge>
                                            )}
                                            {docInfo.status === "atrasado" && (
                                                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-semibold gap-1">
                                                    <AlertTriangle className="h-3 w-3 text-rose-600" />
                                                    Atrasado ({docInfo.ano})
                                                </Badge>
                                            )}
                                            {docInfo.status === "nao_cadastrado" && (
                                                <span className="text-slate-400 text-xs font-normal">Sem documento</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-xs text-slate-700 font-semibold">
                                            {Number(vehicle.km_atual).toLocaleString("pt-BR")} km
                                        </TableCell>

                                        {/* Status do Rastreador */}
                                        <TableCell className="text-xs">
                                            {rastreador === "online" && (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Online
                                                </Badge>
                                            )}
                                            {rastreador === "offline" && (
                                                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-medium gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                    Offline
                                                </Badge>
                                            )}
                                            {rastreador === "nao_possui" && (
                                                <span className="text-slate-400 text-xs font-normal">Não possui</span>
                                            )}
                                        </TableCell>

                                        {/* Status do Tacógrafo */}
                                        <TableCell className="text-xs">
                                            {tacografo === "em_dias" && (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Em dia
                                                </Badge>
                                            )}
                                            {tacografo === "defeito" && (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                    Com Defeito
                                                </Badge>
                                            )}
                                            {tacografo === "atrasado" && (
                                                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-medium gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                    Atrasado
                                                </Badge>
                                            )}
                                            {tacografo === "nao_possui" && (
                                                <span className="text-slate-400 text-xs font-normal">Não possui</span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                className={
                                                    vehicle.status === "ativo_disponivel"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                                                        : "bg-slate-100 text-slate-600 border-slate-200 font-medium"
                                                }
                                                variant="outline"
                                            >
                                                {vehicle.status === "ativo_disponivel" ? "Disponível" : vehicle.status}
                                            </Badge>
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
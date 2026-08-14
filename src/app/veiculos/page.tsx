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
import { Plus, Search, Car, Loader2, X } from "lucide-react"

export default function VeiculosPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filtros
    const [search, setSearch] = useState("")
    const [rastreadorFilter, setRastreadorFilter] = useState("all")
    const [tacografoFilter, setTacografoFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    const supabase = createClient()

    const fetchVehicles = async () => {
        if (!selectedCompany) return
        setLoading(true)
        try {
            let query = supabase
                .from("vehicles")
                .select("*")

            if (selectedCompany.id !== "all") {
                query = query.eq("company_id", selectedCompany.id)
            }

            const { data, error } = await query.order("created_at", { ascending: false })

            if (error) throw error
            setVehicles(data || [])
        } catch (err) {
            console.error("Erro ao carregar veículos:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVehicles()
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

    const filteredVehicles = vehicles.filter((v) => {
        const termo = search.toLowerCase()
        const matchesSearch = (
            (v.placa && v.placa.toLowerCase().includes(termo)) ||
            (v.modelo && v.modelo.toLowerCase().includes(termo)) ||
            (v.marca && v.marca.toLowerCase().includes(termo))
        )

        const { rastreador, tacografo } = getExtraInfo(v.observacoes)

        const matchesRastreador = rastreadorFilter === "all" || rastreador === rastreadorFilter
        const matchesTacografo = tacografoFilter === "all" || tacografo === tacografoFilter
        const matchesStatus = statusFilter === "all" || v.status === statusFilter

        return matchesSearch && matchesRastreador && matchesTacografo && matchesStatus
    })

    const clearFilters = () => {
        setSearch("")
        setRastreadorFilter("all")
        setTacografoFilter("all")
        setStatusFilter("all")
    }

    const hasActiveFilters = search !== "" || rastreadorFilter !== "all" || tacografoFilter !== "all" || statusFilter !== "all"

    // Rótulos explicativos para os triggers dos selects
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Busca Rápida */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por placa, modelo ou marca..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-10 border-slate-200 rounded-xl text-xs w-full"
                        />
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

                    {/* Filtro de Status do Veículo */}
                    <div>
                        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs w-full bg-white">
                                <SelectValue>{getStatusLabel(statusFilter)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 bg-white">
                                <SelectItem value="all">Status: Todos</SelectItem>
                                <SelectItem value="ativo_disponivel">Disponível</SelectItem>
                                <SelectItem value="em_manutencao">Em Manutenção</SelectItem>
                                <SelectItem value="inativo">Inativo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Botão de Limpar Filtros */}
                {hasActiveFilters && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500 font-medium">
                            {filteredVehicles.length} veículo(s) encontrado(s)
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
                ) : filteredVehicles.length === 0 ? (
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
                                <TableHead className="text-xs font-semibold text-slate-600">Veículo</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Combustível / Tanque</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">KM Atual</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Rastreador</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Tacógrafo</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Vínculo</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredVehicles.map((vehicle) => {
                                const { rastreador, tacografo } = getExtraInfo(vehicle.observacoes)

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
                                            {vehicle.marca} {vehicle.modelo} ({vehicle.ano_modelo})
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-600 capitalize">
                                            {vehicle.combustivel} &bull; {vehicle.capacidade_tanque_l}L
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

                                        <TableCell className="text-xs text-slate-600">
                                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 capitalize">
                                                {vehicle.vinculo}
                                            </Badge>
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
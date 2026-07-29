"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Plus, Search, MapPin, Loader2, RefreshCw } from "lucide-react"

export default function RotasPage() {
    const router = useRouter()
    const supabase = createClient()

    const [routes, setRoutes] = useState<any[]>([])
    const [coverages, setCoverages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [activeTab, setActiveTab] = useState<"rotas" | "coberturas">("rotas")

    const fetchData = async () => {
        setLoading(true)
        try {
            // 1. Rotas principais
            const { data: routesData, error: routesErr } = await supabase
                .from("routes")
                .select(`
                    *,
                    vehicles:veiculo_titular_id (placa, marca, modelo),
                    drivers:motorista_id (nome_completo)
                `)
                .order("praca", { ascending: true })

            if (routesErr) throw routesErr

            // 2. Coberturas em andamento
            const { data: covData, error: covErr } = await supabase
                .from("route_coverages")
                .select(`
                    *,
                    routes (praca, itinerario_descricao),
                    veiculo_parado:veiculo_parado_id (placa, modelo),
                    veiculo_cobrindo:veiculo_cobrindo_id (placa, modelo)
                `)
                .order("created_at", { ascending: false })

            if (covErr) throw covErr

            setRoutes(routesData || [])
            setCoverages(covData || [])
        } catch (err) {
            console.error("Erro ao carregar rotas:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const filteredRoutes = routes.filter((r) => {
        const termo = search.toLowerCase()
        const praca = r.praca?.toLowerCase() || ""
        const desc = r.itinerario_descricao?.toLowerCase() || ""
        const placa = r.vehicles?.placa?.toLowerCase() || ""
        const motorista = r.drivers?.nome_completo?.toLowerCase() || ""

        return praca.includes(termo) || desc.includes(termo) || placa.includes(termo) || motorista.includes(termo)
    })

    const filteredCoverages = coverages.filter((c) => {
        const termo = search.toLowerCase()
        const praca = c.routes?.praca?.toLowerCase() || ""
        const parado = c.veiculo_parado?.placa?.toLowerCase() || ""
        const cobrindo = c.veiculo_cobrindo?.placa?.toLowerCase() || ""

        return praca.includes(termo) || parado.includes(termo) || cobrindo.includes(termo)
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Gestão de Rotas & Itinerários
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Controle linhas de transporte, horários, veículos titulares e coberturas
                    </p>
                </div>

                <Link
                    href="/rotas/novo"
                    className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-medium shadow-sm gap-2" })}
                >
                    <Plus className="h-4 w-4" />
                    <span>Nova Rota</span>
                </Link>
            </div>

            {/* Abas e Busca */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab("rotas")}
                        className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === "rotas"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        Rotas Fixas ({routes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("coberturas")}
                        className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                            activeTab === "coberturas"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <RefreshCw className="h-3 w-3 text-amber-600" />
                        <span>Substituições / Coberturas ({coverages.filter(c => c.status === "em_andamento").length})</span>
                    </button>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar rota, placa ou motorista..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 border-slate-200 rounded-lg text-xs"
                    />
                </div>
            </div>

            {/* Tabela de Rotas */}
            {activeTab === "rotas" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <span className="text-xs">Carregando rotas...</span>
                        </div>
                    ) : filteredRoutes.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <MapPin className="h-8 w-8 text-slate-300" />
                            <span className="text-sm font-medium text-slate-600">Nenhuma rota encontrada</span>
                            <span className="text-xs text-slate-400">Cadastre os itinerários fixos da sua operação</span>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="text-xs font-semibold text-slate-600">Praça / Linha</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Descrição Itinerário</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Turno & Horário</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">KM/Dia</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Veículo Titular</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Motorista</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Situação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRoutes.map((r) => (
                                    <TableRow
                                        key={r.id}
                                        onClick={() => router.push(`/rotas/${r.id}`)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    >
                                        <TableCell className="font-bold text-slate-900 text-sm">
                                            {r.praca}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-600 max-w-[200px] truncate">
                                            {r.itinerario_descricao}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <Badge variant="outline" className="capitalize bg-slate-50 font-semibold border-slate-200">
                                                {r.turno}
                                            </Badge>
                                            <span className="text-[10px] text-slate-500 block mt-0.5">{r.horarios || "Sem horário definido"}</span>
                                        </TableCell>
                                        <TableCell className="text-xs font-semibold text-slate-800">
                                            {Number(r.km_dia).toLocaleString("pt-BR")} km
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {r.vehicles ? (
                                                <div>
                                                    <span className="font-bold text-slate-900 block">{r.vehicles.placa}</span>
                                                    <span className="text-[10px] text-slate-500">{r.vehicles.modelo}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Sem titular</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-slate-700">
                                            {r.drivers?.nome_completo || "Não atribuído"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    r.situacao_rota === "ativa"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium capitalize"
                                                        : "bg-slate-100 text-slate-600 border-slate-200 font-medium capitalize"
                                                }
                                                variant="outline"
                                            >
                                                {r.situacao_rota || "ativa"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            )}

            {/* Tabela de Coberturas */}
            {activeTab === "coberturas" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    {filteredCoverages.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <RefreshCw className="h-8 w-8 text-slate-300" />
                            <span className="text-sm font-medium text-slate-600">Nenhuma cobertura registrada</span>
                            <span className="text-xs text-slate-400">Ao criar substituições de veículos quebrados, elas aparecerão aqui</span>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="text-xs font-semibold text-slate-600">Rota / Praça</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Veículo Titular (Parado)</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Veículo Cobrindo</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Período</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Motivo</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCoverages.map((c) => (
                                    <TableRow
                                        key={c.id}
                                        onClick={() => router.push(`/rotas/${c.route_id}`)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    >
                                        <TableCell className="font-bold text-slate-900 text-sm">
                                            {c.routes?.praca}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <span className="font-bold text-rose-700 block">{c.veiculo_parado?.placa}</span>
                                            <span className="text-[10px] text-slate-500">{c.veiculo_parado?.modelo}</span>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <span className="font-bold text-emerald-700 block">{c.veiculo_cobrindo?.placa}</span>
                                            <span className="text-[10px] text-slate-500">{c.veiculo_cobrindo?.modelo}</span>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-700">
                                            {new Date(c.data_inicio).toLocaleDateString("pt-BR")}
                                            {c.data_fim ? ` até ${new Date(c.data_fim).toLocaleDateString("pt-BR")}` : " (Em aberto)"}
                                        </TableCell>
                                        <TableCell className="text-xs capitalize font-medium text-slate-600">
                                            {c.motivo?.replace("_", " ")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    c.status === "em_andamento"
                                                        ? "bg-amber-50 text-amber-700 border-amber-200 font-medium"
                                                        : "bg-slate-100 text-slate-600 border-slate-200 font-medium"
                                                }
                                                variant="outline"
                                            >
                                                {c.status === "em_andamento" ? "Em Cobertura" : "Finalizado"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            )}
        </div>
    )
}
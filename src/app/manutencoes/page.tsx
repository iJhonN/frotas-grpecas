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
import { Plus, Search, Wrench, Loader2, FileText } from "lucide-react"

export default function ManutencoesPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [maintenances, setMaintenances] = useState<any[]>([])
    const [serviceOrders, setServiceOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [activeTab, setActiveTab] = useState<"registros" | "ordens">("registros")

    const fetchData = async () => {
        if (!selectedCompany) return
        setLoading(true)
        try {
            // 1. Manutenções Registradas
            const { data: mainData, error: mainErr } = await supabase
                .from("maintenances")
                .select(`
                    *,
                    vehicles (placa, marca, modelo)
                `)
                .eq("company_id", selectedCompany.id)
                .order("data", { ascending: false })

            if (mainErr) throw mainErr

            // 2. Ordens de Serviço
            const { data: osData, error: osErr } = await supabase
                .from("service_orders")
                .select(`
                    *,
                    vehicles (placa, marca, modelo)
                `)
                .eq("company_id", selectedCompany.id)
                .order("data_abertura", { ascending: false })

            if (osErr) throw osErr

            setMaintenances(mainData || [])
            setServiceOrders(osData || [])
        } catch (err) {
            console.error("Erro ao carregar manutenções:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [selectedCompany])

    const filteredMaintenances = maintenances.filter((m) => {
        const termo = search.toLowerCase()
        const placa = m.vehicles?.placa?.toLowerCase() || ""
        const desc = m.descricao?.toLowerCase() || ""
        const forn = m.fornecedor?.toLowerCase() || ""

        return placa.includes(termo) || desc.includes(termo) || forn.includes(termo)
    })

    const filteredServiceOrders = serviceOrders.filter((os) => {
        const termo = search.toLowerCase()
        const placa = os.vehicles?.placa?.toLowerCase() || ""
        const desc = os.descricao_servico?.toLowerCase() || ""
        const forn = os.fornecedor_oficina?.toLowerCase() || ""

        return placa.includes(termo) || desc.includes(termo) || forn.includes(termo)
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Gestão de Manutenção
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Controle revisões preventivas, reparações corretivas e orçamentos da frota
                    </p>
                </div>

                <Link
                    href="/manutencoes/novo"
                    className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-medium shadow-sm gap-2" })}
                >
                    <Plus className="h-4 w-4" />
                    <span>Nova Manutenção / OS</span>
                </Link>
            </div>

            {/* Abas e Busca */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab("registros")}
                        className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === "registros"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        Histórico de Manutenções ({maintenances.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("ordens")}
                        className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                            activeTab === "ordens"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <FileText className="h-3 w-3 text-blue-600" />
                        <span>Ordens de Serviço ({serviceOrders.length})</span>
                    </button>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por placa, serviço ou oficina..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 border-slate-200 rounded-lg text-xs"
                    />
                </div>
            </div>

            {/* Tabela de Histórico de Manutenções */}
            {activeTab === "registros" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <span className="text-xs">Carregando manutenções...</span>
                        </div>
                    ) : filteredMaintenances.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <Wrench className="h-8 w-8 text-slate-300" />
                            <span className="text-sm font-medium text-slate-600">Nenhuma manutenção encontrada</span>
                            <span className="text-xs text-slate-400">Registre os serviços realizados nos veículos</span>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="text-xs font-semibold text-slate-600">Data</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Veículo</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Tipo</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Serviço / Descrição</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">KM Odômetro</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Oficina / Fornecedor</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Valor Total</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMaintenances.map((m) => {
                                    const total = Number(m.valor_pecas || 0) + Number(m.valor_mao_obra || 0)
                                    return (
                                        <TableRow
                                            key={m.id}
                                            onClick={() => router.push(`/manutencoes/${m.id}`)}
                                            className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                        >
                                            <TableCell className="text-xs font-medium text-slate-700">
                                                {new Date(m.data).toLocaleDateString("pt-BR")}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <span className="font-bold text-slate-900 block">{m.vehicles?.placa}</span>
                                                <span className="text-[10px] text-slate-500">{m.vehicles?.modelo}</span>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        m.tipo === "preventiva"
                                                            ? "bg-blue-50 text-blue-700 border-blue-200 capitalize font-medium"
                                                            : "bg-amber-50 text-amber-700 border-amber-200 capitalize font-medium"
                                                    }
                                                >
                                                    {m.tipo}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-700 max-w-[200px] truncate">
                                                {m.descricao}
                                            </TableCell>
                                            <TableCell className="text-xs font-semibold text-slate-800">
                                                {Number(m.km).toLocaleString("pt-BR")} km
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-600">
                                                {m.fornecedor}
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-slate-900">
                                                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        m.status === "concluida"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium capitalize"
                                                            : "bg-slate-100 text-slate-600 border-slate-200 font-medium capitalize"
                                                    }
                                                    variant="outline"
                                                >
                                                    {m.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            )}

            {/* Tabela de Ordens de Serviço */}
            {activeTab === "ordens" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    {filteredServiceOrders.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <FileText className="h-8 w-8 text-slate-300" />
                            <span className="text-sm font-medium text-slate-600">Nenhuma ordem de serviço aberta</span>
                            <span className="text-xs text-slate-400">Solicite orçamentos para aprovação da gestão</span>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="text-xs font-semibold text-slate-600">Data Abertura</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Veículo</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Solicitante</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Oficina / Fornecedor</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Descrição do Serviço</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Orçamento Total</TableHead>
                                    <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredServiceOrders.map((os) => {
                                    const total = Number(os.orcamento_pecas || 0) + Number(os.orcamento_mao_obra || 0)
                                    return (
                                        <TableRow key={os.id} className="hover:bg-slate-50/80 transition-colors">
                                            <TableCell className="text-xs font-medium text-slate-700">
                                                {new Date(os.data_abertura).toLocaleDateString("pt-BR")}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <span className="font-bold text-slate-900 block">{os.vehicles?.placa}</span>
                                                <span className="text-[10px] text-slate-500">{os.vehicles?.modelo}</span>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium text-slate-700">
                                                {os.solicitante}
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-600">
                                                {os.fornecedor_oficina}
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-700 max-w-[200px] truncate">
                                                {os.descricao_servico}
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-slate-900">
                                                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        os.status === "aprovado"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium capitalize"
                                                            : os.status === "aguardando_aprovacao"
                                                                ? "bg-amber-50 text-amber-700 border-amber-200 font-medium capitalize"
                                                                : "bg-rose-50 text-rose-700 border-rose-200 font-medium capitalize"
                                                    }
                                                    variant="outline"
                                                >
                                                    {os.status?.replace("_", " ")}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            )}
        </div>
    )
}
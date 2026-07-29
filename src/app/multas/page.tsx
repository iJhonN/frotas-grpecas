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
import { Plus, Search, AlertOctagon, Loader2, Calendar } from "lucide-react"

export default function MultasPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [fines, setFines] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const fetchFines = async () => {
        if (!selectedCompany) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("fines")
                .select(`
                    *,
                    vehicles (placa, marca, modelo),
                    drivers:driver_id_indicado (nome_completo, cpf)
                `)
                .eq("company_id", selectedCompany.id)
                .order("data_infracao", { ascending: false })

            if (error) throw error
            setFines(data || [])
        } catch (err) {
            console.error("Erro ao carregar multas:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFines()
    }, [selectedCompany])

    const filteredFines = fines.filter((f) => {
        const termo = search.toLowerCase()
        const placa = f.vehicles?.placa?.toLowerCase() || ""
        const motorista = f.drivers?.nome_completo?.toLowerCase() || ""
        const orgao = f.orgao?.toLowerCase() || ""
        const desc = f.codigo_descricao?.toLowerCase() || ""

        return placa.includes(termo) || motorista.includes(termo) || orgao.includes(termo) || desc.includes(termo)
    })

    const getSeverityBadge = (gravidade: string) => {
        switch (gravidade?.toLowerCase()) {
            case "gravissima":
                return <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-bold">Gravíssima</Badge>
            case "grave":
                return <Badge className="bg-orange-100 text-orange-800 border-orange-300 font-semibold">Grave</Badge>
            case "media":
                return <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-medium">Média</Badge>
            default:
                return <Badge className="bg-slate-100 text-slate-700 border-slate-300 font-medium">Leve</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Gestão de Multas & Infrações
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Acompanhe infrações de trânsito, indicação de condutores e pagamentos
                    </p>
                </div>

                <Link
                    href="/multas/novo"
                    className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-medium shadow-sm gap-2" })}
                >
                    <Plus className="h-4 w-4" />
                    <span>Nova Multa</span>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por placa, motorista, órgão ou código..."
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
                        <span className="text-xs">Carregando infrações...</span>
                    </div>
                ) : filteredFines.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <AlertOctagon className="h-8 w-8 text-slate-300" />
                        <span className="text-sm font-medium text-slate-600">Nenhuma multa cadastrada</span>
                        <span className="text-xs text-slate-400">Registre as infrações para controle de pontos e desconto em folha</span>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="text-xs font-semibold text-slate-600">Data Infração</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Veículo</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Motorista Indicado</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Órgão / Infração</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Gravidade & Pontos</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Valor</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Vencimento</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredFines.map((f) => {
                                const dataInfracao = new Date(f.data_infracao).toLocaleDateString("pt-BR")
                                const vencimento = f.vencimento_pagamento ? new Date(f.vencimento_pagamento).toLocaleDateString("pt-BR") : "N/A"

                                return (
                                    <TableRow
                                        key={f.id}
                                        onClick={() => router.push(`/multas/${f.id}`)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    >
                                        <TableCell className="text-xs font-medium text-slate-700">
                                            {dataInfracao}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <span className="font-bold text-slate-900 block">{f.vehicles?.placa}</span>
                                            <span className="text-[10px] text-slate-500">{f.vehicles?.modelo}</span>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-slate-700">
                                            {f.drivers?.nome_completo ? (
                                                <span className="text-slate-900 font-bold block">{f.drivers.nome_completo}</span>
                                            ) : (
                                                <span className="text-rose-600 font-semibold italic text-[11px]">Pendente indicação</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-700">
                                            <span className="font-semibold text-slate-900 block">{f.orgao}</span>
                                            <span className="text-[10px] text-slate-500 max-w-[180px] truncate block">{f.codigo_descricao}</span>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <div className="flex items-center gap-1.5">
                                                {getSeverityBadge(f.gravidade)}
                                                <span className="text-[11px] font-bold text-slate-700">{f.pontos} pts</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs font-bold text-slate-900">
                                            R$ {Number(f.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-600">
                                            {vencimento}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    f.status === "pago"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium capitalize"
                                                        : f.status === "recorrida"
                                                            ? "bg-blue-50 text-blue-700 border-blue-200 font-medium capitalize"
                                                            : "bg-amber-50 text-amber-700 border-amber-200 font-medium capitalize"
                                                }
                                                variant="outline"
                                            >
                                                {f.status}
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
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useCompany } from "@/contexts/company-context"
import { createClient } from "@/lib/supabase/client"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AlertOctagon, Plus, Search, Loader2, ShieldAlert } from "lucide-react"

export default function SinistrosPage() {
    const { selectedCompany } = useCompany()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [incidents, setIncidents] = useState<any[]>([])
    const [search, setSearch] = useState("")

    const fetchIncidents = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from("incidents")
                .select("*, vehicles(id, placa, marca, modelo), drivers(id, nome_completo), insurance_policies(id, seguradora)")
                .order("data", { ascending: false })

            if (selectedCompany?.id) {
                query = query.eq("company_id", selectedCompany.id)
            }

            const { data, error } = await query
            if (error) throw error
            setIncidents(data || [])
        } catch (err: any) {
            console.error("Erro ao carregar sinistros:", err.message || err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIncidents()
    }, [selectedCompany])

    const filteredIncidents = incidents.filter((i) => {
        const query = search.toLowerCase()
        const placa = i.vehicles?.placa?.toLowerCase() || ""
        const motorista = i.drivers?.nome_completo?.toLowerCase() || ""
        const bo = i.numero_bo?.toLowerCase() || ""
        return placa.includes(query) || motorista.includes(query) || bo.includes(query)
    })

    const getGravidadeBadge = (gravidade: string) => {
        const map: Record<string, { label: string; class: string }> = {
            leve: { label: "Leve", class: "bg-blue-50 text-blue-700 border-blue-200" },
            moderada: { label: "Moderada", class: "bg-amber-50 text-amber-700 border-amber-200" },
            grave: { label: "Grave", class: "bg-rose-50 text-rose-700 border-rose-200" },
            perda_total: { label: "Perda Total", class: "bg-rose-600 text-white border-rose-700" },
        }
        const item = map[gravidade] || { label: gravidade, class: "bg-slate-100 text-slate-700" }
        return <Badge variant="outline" className={`text-[10px] ${item.class}`}>{item.label}</Badge>
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-rose-600" />
                        Sinistros & Ocorrências
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Registro de acidentes, B.O., acionamento de apólices e controle de custos
                    </p>
                </div>

                <Link
                    href="/sinistros/novo"
                    className={buttonVariants({
                        className: "bg-rose-600 hover:bg-rose-700 text-white gap-2 h-10 px-4 rounded-xl font-medium shadow-sm self-start sm:self-auto",
                    })}
                >
                    <Plus className="h-4 w-4" />
                    <span>Registrar Sinistro</span>
                </Link>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por placa, motorista ou N° de B.O..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 rounded-xl border-slate-200 text-xs"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                        <span className="text-xs font-medium">Carregando sinistros...</span>
                    </div>
                ) : filteredIncidents.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 space-y-2">
                        <AlertOctagon className="h-8 w-8 mx-auto text-slate-300" />
                        <p className="text-xs font-medium">Nenhum sinistro encontrado.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="text-xs font-bold text-slate-700">Data / B.O.</TableHead>
                                <TableHead className="text-xs font-bold text-slate-700">Veículo & Motorista</TableHead>
                                <TableHead className="text-xs font-bold text-slate-700">Tipo & Gravidade</TableHead>
                                <TableHead className="text-xs font-bold text-slate-700">Culpabilidade</TableHead>
                                <TableHead className="text-xs font-bold text-slate-700">Custo Líquido</TableHead>
                                <TableHead className="text-xs font-bold text-slate-700 text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredIncidents.map((i) => (
                                <TableRow key={i.id} className="hover:bg-slate-50/50">
                                    <TableCell>
                                        <div>
                                            <span className="font-bold text-slate-900 block text-xs">
                                                {i.data ? new Date(i.data).toLocaleDateString("pt-BR") : "S/D"}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                B.O: {i.numero_bo || "Não informado"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <span className="font-semibold text-slate-800 text-xs block">
                                                🚗 {i.vehicles?.placa || "Sem Veículo"}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                                {i.drivers?.nome_completo || "Sem motorista"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <span className="text-xs font-medium text-slate-800 block capitalize">
                                                {i.tipo?.replace(/_/g, " ")}
                                            </span>
                                            {getGravidadeBadge(i.gravidade)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700">
                                            {i.culpabilidade?.replace(/_/g, " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs font-bold text-slate-900">
                                        R$ {Number(i.custo_liquido ?? (i.custo_total - (i.reembolso || 0))).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            href={`/sinistros/${i.id}`}
                                            className={buttonVariants({
                                                variant: "outline",
                                                className: "h-8 px-3 rounded-lg text-xs border-slate-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50",
                                            })}
                                        >
                                            Detalhes
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    )
}
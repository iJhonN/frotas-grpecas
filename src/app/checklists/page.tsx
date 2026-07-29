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
import { Plus, Search, ClipboardCheck, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function ChecklistsPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [inspections, setInspections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const fetchInspections = async () => {
        if (!selectedCompany) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("inspections")
                .select(`
                    *,
                    vehicles (placa, marca, modelo),
                    drivers (nome_completo)
                `)
                .eq("company_id", selectedCompany.id)
                .order("data", { ascending: false })

            if (error) throw error
            setInspections(data || [])
        } catch (err) {
            console.error("Erro ao carregar checklists:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInspections()
    }, [selectedCompany])

    const filteredInspections = inspections.filter((i) => {
        const termo = search.toLowerCase()
        const placa = i.vehicles?.placa?.toLowerCase() || ""
        const motorista = i.drivers?.nome_completo?.toLowerCase() || ""
        const tipo = i.tipo?.toLowerCase() || ""

        return placa.includes(termo) || motorista.includes(termo) || tipo.includes(termo)
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Checklists & Vistorias
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Controle as inspeções diárias, itens de segurança e conservação da frota
                    </p>
                </div>

                <Link
                    href="/checklists/novo"
                    className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-medium shadow-sm gap-2 whitespace-nowrap" })}
                >
                    <Plus className="h-4 w-4" />
                    <span>Novo Checklist</span>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por placa, motorista ou tipo de inspeção..."
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
                        <span className="text-xs">Carregando checklists...</span>
                    </div>
                ) : filteredInspections.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <ClipboardCheck className="h-8 w-8 text-slate-300" />
                        <span className="text-sm font-medium text-slate-600">Nenhum checklist registrado</span>
                        <span className="text-xs text-slate-400">Faça vistorias antes e depois do uso dos veículos</span>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="text-xs font-semibold text-slate-600">Data e Hora</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Veículo</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Condutor</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Tipo</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">KM Odômetro</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Combustível</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Reprovações</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Resultado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInspections.map((item) => {
                                const dataFormatted = new Date(item.data).toLocaleString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })

                                return (
                                    <TableRow
                                        key={item.id}
                                        onClick={() => router.push(`/checklists/${item.id}`)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    >
                                        <TableCell className="text-xs font-medium text-slate-700">
                                            {dataFormatted}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <span className="font-bold text-slate-900 block">{item.vehicles?.placa}</span>
                                            <span className="text-[10px] text-slate-500">{item.vehicles?.modelo}</span>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-700 font-medium">
                                            {item.drivers?.nome_completo || "Não informado"}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <Badge variant="outline" className="capitalize bg-slate-50 border-slate-200">
                                                {item.tipo?.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-semibold text-slate-800">
                                            {Number(item.km).toLocaleString("pt-BR")} km
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-600">
                                            {item.combustivel_pct != null ? `${item.combustivel_pct}%` : "-"}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {item.reprovados_count > 0 ? (
                                                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold">
                                                    {item.reprovados_count} item(ns)
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-400 text-xs">Zero</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    item.resultado === "reprovado" || item.reprovados_count > 0
                                                        ? "bg-rose-50 text-rose-700 border-rose-200 font-semibold gap-1"
                                                        : "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold gap-1"
                                                }
                                                variant="outline"
                                            >
                                                {item.resultado === "reprovado" || item.reprovados_count > 0 ? (
                                                    <>
                                                        <AlertTriangle className="h-3 w-3 text-rose-600" />
                                                        <span>Reprovado</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                        <span>Aprovado</span>
                                                    </>
                                                )}
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
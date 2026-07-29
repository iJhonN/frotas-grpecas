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
import { Plus, Search, FileText, Loader2, Paperclip, ExternalLink, AlertTriangle } from "lucide-react"

export default function DocumentosPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [documents, setDocuments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const fetchDocuments = async () => {
        if (!selectedCompany) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("vehicle_documents")
                .select(`
                    *,
                    vehicles (placa, marca, modelo)
                `)
                .eq("company_id", selectedCompany.id)
                .order("data_vencimento", { ascending: true })

            if (error) throw error
            setDocuments(data || [])
        } catch (err) {
            console.error("Erro ao carregar documentos:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [selectedCompany])

    const filteredDocuments = documents.filter((doc) => {
        const termo = search.toLowerCase()
        const placa = doc.vehicles?.placa?.toLowerCase() || ""
        const tipo = doc.tipo_documento?.toLowerCase() || ""
        const ano = String(doc.ref_ano || "")

        return placa.includes(termo) || tipo.includes(termo) || ano.includes(termo)
    })

    const getStatusBadge = (doc: any) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const vencimento = new Date(doc.data_vencimento)

        const diffDays = Math.ceil((vencimento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (doc.situacao === "pago" || doc.situacao === "em_dia") {
            return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">Em Dia / Pago</Badge>
        }

        if (diffDays < 0 || doc.situacao === "atrasado" || doc.situacao === "vencido") {
            return (
                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold gap-1">
                    <AlertTriangle className="h-3 w-3 text-rose-600" />
                    Vencido ({Math.abs(diffDays)}d)
                </Badge>
            )
        }

        if (diffDays <= 30) {
            return (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-semibold gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                    A Vencer ({diffDays}d)
                </Badge>
            )
        }

        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 capitalize">{doc.situacao}</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Documentos & Licenciamentos
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Gerencie CRLV, IPVA, Licenciamento Anual e Apólices de Seguro dos veículos
                    </p>
                </div>

                <Link
                    href="/documentos/novo"
                    className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-medium shadow-sm gap-2 whitespace-nowrap" })}
                >
                    <Plus className="h-4 w-4" />
                    <span>Cadastrar Documento</span>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por placa, tipo de documento ou ano ref..."
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
                        <span className="text-xs">Carregando documentos da frota...</span>
                    </div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <FileText className="h-8 w-8 text-slate-300" />
                        <span className="text-sm font-medium text-slate-600">Nenhum documento cadastrado</span>
                        <span className="text-xs text-slate-400">Anexe o CRLV digital e controle os débitos e licenças da frota</span>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="text-xs font-semibold text-slate-600">Veículo</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Tipo Documento</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Ano Ref.</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Vencimento</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Valor (R$)</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Situação</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600 text-center">Anexo / CRLV</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDocuments.map((doc) => {
                                const vencimento = new Date(doc.data_vencimento).toLocaleDateString("pt-BR")

                                return (
                                    <TableRow
                                        key={doc.id}
                                        onClick={() => router.push(`/documentos/${doc.id}`)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    >
                                        <TableCell className="text-xs">
                                            <span className="font-bold text-slate-900 block">{doc.vehicles?.placa}</span>
                                            <span className="text-[10px] text-slate-500">{doc.vehicles?.modelo}</span>
                                        </TableCell>
                                        <TableCell className="text-xs font-semibold text-slate-800 uppercase">
                                            {doc.tipo_documento?.replace("_", " ")}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-700 font-mono font-medium">
                                            {doc.ref_ano}
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-slate-700">
                                            {vencimento}
                                        </TableCell>
                                        <TableCell className="text-xs font-bold text-slate-900">
                                            {doc.valor ? `R$ ${Number(doc.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(doc)}
                                        </TableCell>
                                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                            {doc.comprovante_ref ? (
                                                <a
                                                    href={doc.comprovante_ref}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-all"
                                                >
                                                    <Paperclip className="h-3.5 w-3.5" />
                                                    <span>Visualizar</span>
                                                    <ExternalLink className="h-3 w-3 opacity-60" />
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Sem anexo</span>
                                            )}
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
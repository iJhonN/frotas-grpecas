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
import { Plus, Search, Building2, Loader2 } from "lucide-react"

export default function CooperadosPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const [cooperados, setCooperados] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const supabase = createClient()

    const fetchCooperados = async () => {
        setLoading(true)
        try {
            // Traz os cooperados ordenados por nome
            const { data, error } = await supabase
                .from("cooperados")
                .select("*")
                .order("nome", { ascending: true })

            if (error) throw error
            setCooperados(data || [])
        } catch (err) {
            console.error("Erro ao carregar cooperados:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCooperados()
    }, [selectedCompany]) // Recarrega se mudar a empresa ativa no topo

    const filteredCooperados = cooperados.filter((c) => {
        const termo = search.toLowerCase().trim()
        if (!termo) return true

        const nome = c.nome ? c.nome.toLowerCase() : ""
        const cpfCnpj = c.cpf_cnpj ? c.cpf_cnpj.toLowerCase() : ""
        const telefone = c.telefone ? c.telefone.toLowerCase() : ""

        return nome.includes(termo) || cpfCnpj.includes(termo) || telefone.includes(termo)
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Gestão de Cooperados
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Cadastre e gerencie os parceiros proprietários de veículos
                    </p>
                </div>

                <Link
                    href="/cooperados/novo"
                    className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-medium shadow-sm gap-2 whitespace-nowrap" })}
                >
                    <Plus className="h-4 w-4" />
                    <span>Novo Cooperado</span>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nome, CPF/CNPJ ou telefone..."
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
                        <span className="text-xs">Carregando cooperados...</span>
                    </div>
                ) : filteredCooperados.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Building2 className="h-8 w-8 text-slate-300" />
                        <span className="text-sm font-medium text-slate-600">Nenhum cooperado encontrado</span>
                        <span className="text-xs text-slate-400">Cadastre cooperados para vinculá-los aos veículos</span>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="text-xs font-semibold text-slate-600">Nome / Razão Social</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">CPF / CNPJ</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Telefone</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Taxa Admin</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">PIX / Dados</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCooperados.map((cooperado) => (
                                <TableRow
                                    key={cooperado.id}
                                    onClick={() => router.push(`/cooperados/${cooperado.id}`)}
                                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                >
                                    <TableCell className="font-bold text-slate-900 text-sm">
                                        {cooperado.nome}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-600 font-mono">
                                        {cooperado.cpf_cnpj || "-"}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-600">
                                        {cooperado.telefone || "-"}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-700 font-semibold">
                                        {cooperado.taxa_administracao_pct}%
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-600 max-w-[150px] truncate">
                                        {cooperado.pix_conta || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                cooperado.status
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                                                    : "bg-slate-100 text-slate-600 border-slate-200 font-medium"
                                            }
                                            variant="outline"
                                        >
                                            {cooperado.status ? "Ativo" : "Inativo"}
                                        </Badge>
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
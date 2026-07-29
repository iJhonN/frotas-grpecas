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
import { Plus, Search, Users, Loader2, AlertTriangle } from "lucide-react"

export default function MotoristasPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const [drivers, setDrivers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const supabase = createClient()

    const fetchDrivers = async () => {
        if (!selectedCompany) return
        setLoading(true)
        try {
            let query = supabase
                .from("drivers")
                .select(`
                    *,
                    vehicles:veiculo_atual_id (placa, marca, modelo)
                `)

            // Aplica filtro de empresa apenas se NÃO for "Todas as Empresas"
            if (selectedCompany.id !== "all") {
                query = query.eq("company_id", selectedCompany.id)
            }

            const { data, error } = await query.order("nome_completo", { ascending: true })

            if (error) throw error
            setDrivers(data || [])
        } catch (err) {
            console.error("Erro ao carregar motoristas:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDrivers()
    }, [selectedCompany])

    const filteredDrivers = drivers.filter((d) => {
        const termo = search.toLowerCase().trim()
        if (!termo) return true

        const nome = d.nome_completo ? d.nome_completo.toLowerCase() : ""
        const cpf = d.cpf ? d.cpf.toLowerCase() : ""
        const cnh = d.cnh_numero ? d.cnh_numero.toLowerCase() : ""
        const cidade = d.cidade ? d.cidade.toLowerCase() : ""

        return nome.includes(termo) || cpf.includes(termo) || cnh.includes(termo) || cidade.includes(termo)
    })

    // Função auxiliar para status de datas (CNH / Toxicológico)
    const getDateStatus = (dateStr: string | null) => {
        if (!dateStr) return { label: "N/A", color: "text-slate-400 bg-slate-50 border-slate-200" }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const targetDate = new Date(dateStr)
        const diffTime = targetDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        const formattedDate = targetDate.toLocaleDateString("pt-BR")

        if (diffDays < 0) {
            return {
                label: `${formattedDate} (Vencido)`,
                color: "text-rose-700 bg-rose-50 border-rose-200 font-bold",
                alert: true
            }
        } else if (diffDays <= 30) {
            return {
                label: `${formattedDate} (${diffDays}d)`,
                color: "text-amber-700 bg-amber-50 border-amber-200 font-semibold",
                warning: true
            }
        }

        return {
            label: formattedDate,
            color: "text-slate-700 bg-slate-50 border-slate-200"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Gestão de Motoristas
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Acompanhe condutores, validades da CNH, exames e veículos atribuídos
                    </p>
                </div>

                <Link
                    href="/motoristas/novo"
                    className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-medium shadow-sm gap-2 whitespace-nowrap" })}
                >
                    <Plus className="h-4 w-4" />
                    <span>Novo Motorista</span>
                </Link>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nome, CPF, CNH ou cidade..."
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
                        <span className="text-xs">Carregando condutores...</span>
                    </div>
                ) : filteredDrivers.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Users className="h-8 w-8 text-slate-300" />
                        <span className="text-sm font-medium text-slate-600">Nenhum motorista encontrado</span>
                        <span className="text-xs text-slate-400">Cadastre um novo motorista para vinculá-lo aos veículos e rotas</span>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="text-xs font-semibold text-slate-600">Motorista</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">CPF / Contato</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">CNH & Cat.</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Validade CNH</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Toxicológico</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Veículo Atribuído</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDrivers.map((driver) => {
                                const cnhStatus = getDateStatus(driver.cnh_validade)
                                const toxStatus = getDateStatus(driver.toxicologico_validade)

                                const categoriasStr = Array.isArray(driver.categorias_cnh)
                                    ? driver.categorias_cnh.join("")
                                    : driver.categorias_cnh || ""

                                const initials = driver.nome_completo
                                    ? driver.nome_completo.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
                                    : "MOT"

                                return (
                                    <TableRow
                                        key={driver.id}
                                        onClick={() => router.push(`/motoristas/${driver.id}`)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    >
                                        {/* Motorista + Cidade */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-900 text-sm block leading-snug">
                                                        {driver.nome_completo}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-medium">
                                                        {driver.cidade || "Cidade não informada"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* CPF e Telefone */}
                                        <TableCell className="text-xs">
                                            <span className="text-slate-800 font-mono font-medium block">
                                                {driver.cpf || "-"}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                                {driver.telefone || "Sem telefone"}
                                            </span>
                                        </TableCell>

                                        {/* CNH / Categoria / EAR */}
                                        <TableCell className="text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-slate-800 font-mono">{driver.cnh_numero}</span>
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-slate-100 border-slate-300 font-bold text-slate-700">
                                                    Cat. {categoriasStr}
                                                </Badge>
                                            </div>
                                            {driver.ear && (
                                                <span className="text-[10px] font-semibold text-blue-600 block mt-0.5">
                                                    EAR Ativo
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* Validade CNH com Alerta Visual */}
                                        <TableCell className="text-xs">
                                            <Badge variant="outline" className={`gap-1 font-medium text-[11px] ${cnhStatus.color}`}>
                                                {cnhStatus.alert && <AlertTriangle className="h-3 w-3 text-rose-600" />}
                                                {cnhStatus.label}
                                            </Badge>
                                        </TableCell>

                                        {/* Validade Exame Toxicológico */}
                                        <TableCell className="text-xs">
                                            <Badge variant="outline" className={`gap-1 font-medium text-[11px] ${toxStatus.color}`}>
                                                {toxStatus.alert && <AlertTriangle className="h-3 w-3 text-rose-600" />}
                                                {toxStatus.label}
                                            </Badge>
                                        </TableCell>

                                        {/* Veículo Atual Vinculado */}
                                        <TableCell className="text-xs">
                                            {driver.vehicles ? (
                                                <div>
                                                    <span className="font-bold text-slate-900 block">{driver.vehicles.placa}</span>
                                                    <span className="text-[10px] text-slate-500">{driver.vehicles.marca} {driver.vehicles.modelo}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Nenhum</span>
                                            )}
                                        </TableCell>

                                        {/* Status do Motorista */}
                                        <TableCell>
                                            <Badge
                                                className={
                                                    driver.status === "ativo"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium capitalize"
                                                        : driver.status === "ferias"
                                                            ? "bg-blue-50 text-blue-700 border-blue-200 font-medium capitalize"
                                                            : "bg-slate-100 text-slate-600 border-slate-200 font-medium capitalize"
                                                }
                                                variant="outline"
                                            >
                                                {driver.status}
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
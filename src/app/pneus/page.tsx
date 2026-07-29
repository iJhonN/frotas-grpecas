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
import { Disc, Plus, Search, Loader2, AlertTriangle, CheckCircle, Disc3 } from "lucide-react"

export default function PneusPage() {
    const { selectedCompany } = useCompany()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [tires, setTires] = useState<any[]>([])
    const [search, setSearch] = useState("")

    const fetchTires = async () => {
        setLoading(true)
        try {
            let vehicleIds: string[] = []

            // 1. Se houver empresa selecionada e NÃO for "Todas as Empresas", busca os IDs dos veículos dela
            if (selectedCompany?.id && selectedCompany.id !== "all") {
                const { data: companyVehicles } = await supabase
                    .from("vehicles")
                    .select("id")
                    .eq("company_id", selectedCompany.id)

                vehicleIds = (companyVehicles || []).map((v) => v.id)
            }

            // 2. Monta a busca principal dos pneus
            let query = supabase
                .from("tires")
                .select("*, vehicles(id, placa, marca, modelo, company_id)")
                .order("created_at", { ascending: false })

            // 3. Aplica o filtro apenas se for uma empresa específica
            if (selectedCompany?.id && selectedCompany.id !== "all") {
                if (vehicleIds.length > 0) {
                    query = query.or(`vehicle_id.in.(${vehicleIds.join(",")}),vehicle_id.is.null`)
                } else {
                    query = query.is("vehicle_id", null)
                }
            }

            const { data, error } = await query

            if (error) throw error
            setTires(data || [])
        } catch (err: any) {
            console.error("Erro ao carregar pneus:", err.message || err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTires()
    }, [selectedCompany])

    const filteredTires = tires.filter((t) => {
        const query = search.toLowerCase()
        const placa = t.vehicles?.placa?.toLowerCase() || ""
        const marcaModelo = t.marca_modelo?.toLowerCase() || ""
        const codigo = t.id_pneu_legado?.toLowerCase() || ""
        return placa.includes(query) || marcaModelo.includes(query) || codigo.includes(query)
    })

    const getSulcoBadge = (sulco: number) => {
        if (sulco <= 1.6) {
            return (
                <Badge className="bg-rose-100 text-rose-800 border-rose-200 gap-1 text-[11px]">
                    <AlertTriangle className="h-3 w-3 text-rose-600" />
                    Crítico ({sulco}mm)
                </Badge>
            )
        }
        if (sulco <= 3.5) {
            return (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 text-[11px]">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                    Atenção ({sulco}mm)
                </Badge>
            )
        }
        return (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[11px]">
                <CheckCircle className="h-3 w-3 text-emerald-600" />
                Normal ({sulco}mm)
            </Badge>
        )
    }

    const formatPosicao = (posicao: string | null) => {
        if (!posicao) return "Sem posição"
        const posMap: Record<string, string> = {
            dianteiro_esquerdo: "Dianteiro Esquerdo",
            dianteiro_direito: "Dianteiro Direito",
            traseiro_externo_esquerdo: "Traseiro Ext. Esquerdo",
            traseiro_interno_esquerdo: "Traseiro Int. Esquerdo",
            traseiro_externo_direito: "Traseiro Ext. Direito",
            traseiro_interno_direito: "Traseiro Int. Direito",
            estepe: "Estepe",
        }
        return posMap[posicao] || posicao.replace(/_/g, " ")
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Disc3 className="h-6 w-6 text-blue-600" />
                        Gestão de Pneus
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Controle de eixos, medições de sulco, recapagens e custo por quilômetro
                    </p>
                </div>

                <Link
                    href="/pneus/novo"
                    className={buttonVariants({
                        className: "bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 px-4 rounded-xl font-medium shadow-sm self-start sm:self-auto",
                    })}
                >
                    <Plus className="h-4 w-4" />
                    <span>Cadastrar Pneu</span>
                </Link>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por placa, marca/modelo do pneu ou código..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 rounded-xl border-slate-200 text-xs"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="text-xs font-medium">Carregando pneus...</span>
                    </div>
                ) : filteredTires.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 space-y-2">
                        <Disc className="h-8 w-8 mx-auto text-slate-300" />
                        <p className="text-xs font-medium">Nenhum pneu encontrado.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="text-xs font-bold text-slate-700">Código / Pneu</TableHead>
                                <TableHead className="text-xs font-bold text-slate-700">Veículo & Posição</TableHead>
                                <TableHead className="text-xs font-bold text-slate-700">Vida / Recape</TableHead>
                                <TableHead className="text-xs font-bold text-slate-700">Sulco Atual</TableHead>
                                <TableHead className="text-xs font-bold text-slate-700">KM Rodado</TableHead>
                                <TableHead className="text-xs font-bold text-slate-700 text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTires.map((t) => (
                                <TableRow key={t.id} className="hover:bg-slate-50/50">
                                    <TableCell>
                                        <div>
                                            <span className="font-bold text-slate-900 block text-xs">
                                                {t.id_pneu_legado || "S/N"}
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                {t.marca_modelo} ({t.medida})
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <span className="font-semibold text-slate-800 text-xs block">
                                                {t.vehicles?.placa ? `🚗 ${t.vehicles.placa}` : "📦 Estoque / Desmontado"}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                                {t.posicao ? `Posição: ${formatPosicao(t.posicao)}` : "Sem posição"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                                            {t.vida?.replace("_", " ") || "Novo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getSulcoBadge(Number(t.sulco_mm || 0))}
                                    </TableCell>
                                    <TableCell className="text-xs font-semibold text-slate-700">
                                        {Number(t.km_rodado || 0).toLocaleString("pt-BR")} KM
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            href={`/pneus/${t.id}`}
                                            className={buttonVariants({
                                                variant: "outline",
                                                className: "h-8 px-3 rounded-lg text-xs border-slate-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50",
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
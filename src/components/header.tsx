"use client"

import { useCompany, ALL_COMPANIES } from "@/contexts/company-context"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Building2, Loader2, Globe } from "lucide-react"

export function Header() {
    const { companies, selectedCompany, setSelectedCompany, isLoading } = useCompany()

    const handleValueChange = (val: string | null) => {
        if (!val || val === "all") {
            setSelectedCompany(ALL_COMPANIES)
            return
        }

        const found = companies.find((c) => c.id === val)
        if (found) {
            setSelectedCompany(found)
        }
    }

    // Função auxiliar para obter o nome visível da empresa
    const getCompanyName = (comp: any) => {
        if (!comp) return "Todas as Empresas"
        if (comp.id === "all") return "Todas as Empresas"
        return comp.nome || comp.razao_social || comp.nome_fantasia || "Empresa sem nome"
    }

    return (
        <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
            <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
                    Empresa Ativa:
                </span>

                {isLoading ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                        <span>Carregando empresas...</span>
                    </div>
                ) : (
                    <Select
                        value={selectedCompany?.id || "all"}
                        onValueChange={handleValueChange}
                    >
                        <SelectTrigger className="h-9 w-[260px] rounded-xl border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:ring-blue-500">
                            <SelectValue placeholder="Selecione a empresa">
                                <div className="flex items-center gap-2 truncate">
                                    {selectedCompany?.id === "all" ? (
                                        <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                    ) : (
                                        <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                    )}
                                    <span className="truncate">
                                        {getCompanyName(selectedCompany)}
                                    </span>
                                </div>
                            </SelectValue>
                        </SelectTrigger>

                        <SelectContent className="rounded-xl border-slate-200">
                            {companies.map((comp: any) => (
                                <SelectItem key={comp.id} value={comp.id} className="text-xs font-medium cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        {comp.id === "all" ? (
                                            <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                        ) : (
                                            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                        )}
                                        <span className="truncate">
                                            {getCompanyName(comp)}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
        </header>
    )
}
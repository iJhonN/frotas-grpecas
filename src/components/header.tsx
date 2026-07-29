"use client"

import { useCompany } from "@/contexts/company-context"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Building2, LogOut, User } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function Header() {
    const { selectedCompany, companies, setSelectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
            {/* Seletor de Empresa */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span>Empresa Ativa:</span>
                </div>

                {companies.length > 0 ? (
                    <Select
                        value={selectedCompany?.id}
                        onValueChange={(id) => {
                            const comp = companies.find((c) => c.id === id)
                            if (comp) setSelectedCompany(comp)
                        }}
                    >
                        <SelectTrigger className="w-[280px] h-9 border-slate-200 text-sm font-medium bg-slate-50 focus:ring-blue-600/20 rounded-lg">
                            <SelectValue>
                                {selectedCompany ? selectedCompany.nome : "Selecione uma empresa"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl z-50 min-w-[280px]">
                            {companies.map((company: any) => (
                                <SelectItem
                                    key={company.id}
                                    value={company.id}
                                    className="cursor-pointer py-2 text-xs font-medium focus:bg-slate-100"
                                >
                                    {company.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <span className="text-xs text-slate-400 font-medium">Carregando empresas...</span>
                )}
            </div>

            {/* Perfil & Logout */}
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                    <User className="h-4 w-4" />
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-600 hover:text-red-600 hover:bg-red-50 h-9 rounded-lg gap-2 text-xs font-medium"
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
        </header>
    )
}
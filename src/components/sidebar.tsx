"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    Truck,
    LayoutDashboard,
    Car,
    Users,
    Building2,
    ClipboardCheck,
    Fuel,
    Wrench,
    Disc3,
    ShieldAlert,
    Navigation,
    AlertOctagon,
    FileText,
    DollarSign,
    Settings,
    ShieldCheck,
    LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Veículos", href: "/veiculos", icon: Car },
    { name: "Motoristas", href: "/motoristas", icon: Users },
    { name: "Cooperados", href: "/cooperados", icon: Building2 },
    { name: "Rotas", href: "/rotas", icon: Navigation },
    { name: "Abastecimentos", href: "/abastecimentos", icon: Fuel },
    { name: "Manutenções", href: "/manutencoes", icon: Wrench },
    { name: "Pneus", href: "/pneus", icon: Disc3 },
    { name: "Sinistros & Seguros", href: "/sinistros", icon: ShieldAlert },
    { name: "Multas & Infrações", href: "/multas", icon: AlertOctagon },
    { name: "Checklists", href: "/checklists", icon: ClipboardCheck },
    { name: "Documentos", href: "/documentos", icon: FileText },
    { name: "Custos & Financeiro", href: "/custos", icon: DollarSign },
    { name: "Termos LGPD", href: "/termos-lgpd", icon: ShieldCheck },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            router.push("/login")
            router.refresh()
        } catch (err) {
            console.error("Erro ao fazer logout:", err)
        }
    }

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0">
            {/* Brand Header */}
            <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 shrink-0">
                <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                    <Truck className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-white tracking-tight leading-none">
                        Grupo GR
                    </h2>
                    <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mt-1">
                        Gestão de Frotas
                    </p>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
                                isActive
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                            <span>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer & Logout */}
            <div className="p-3 border-t border-slate-800 shrink-0 space-y-2">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <LogOut className="h-4 w-4 shrink-0 text-rose-400" />
                        <span>Sair do Sistema</span>
                    </div>
                </button>

                <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-800/50">
                    v1.0.0 &bull; Felinto Tech
                </div>
            </div>
        </aside>
    )
}
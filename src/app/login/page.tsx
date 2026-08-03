"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Truck, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setErrorMsg("Credenciais inválidas. Verifique seu e-mail e senha.")
            setLoading(false)
        } else {
            router.push("/dashboard")
            router.refresh()
        }
    }

    return (
        <div className="min-h-[100dvh] w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-900 font-sans selection:bg-blue-600 selection:text-white">

            {/* Lado Esquerdo - Institucional (Desktop) */}
            <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 bg-slate-900 border-r border-slate-800">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-base font-bold text-white block leading-none">
                            Grupo GR Autopeças
                        </span>
                        <span className="text-xs text-slate-400 mt-1 block">
                            Gestão de Frota
                        </span>
                    </div>
                </div>

                {/* Mensagem Principal */}
                <div className="my-auto max-w-lg space-y-4">
                    <h2 className="text-3xl font-bold text-white tracking-tight leading-snug">
                        Painel de Controle e Gestão Operacional de Veículos
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Acesse para gerenciar abastecimentos, manutenções, checklists e documentos da frota do Grupo GR.
                    </p>
                </div>

                {/* Rodapé Interno */}
                <div className="text-xs text-slate-500">
                    © {new Date().getFullYear()} Grupo GR Autopeças
                </div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="lg:col-span-5 flex flex-col justify-between min-h-[100dvh] lg:min-h-0 p-6 sm:p-12 bg-slate-900 lg:bg-white dark:lg:bg-slate-900">

                {/* Header exclusivo Mobile */}
                <div className="flex lg:hidden items-center gap-3 pt-2 pb-6">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-base font-bold text-white block leading-none">
                            Grupo GR Autopeças
                        </span>
                        <span className="text-xs text-slate-400 mt-1 block">
                            Gestão de Frota
                        </span>
                    </div>
                </div>

                {/* Formulário */}
                <div className="my-auto max-w-sm w-full mx-auto space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-white lg:text-slate-900 dark:lg:text-white tracking-tight">
                            Entrar no sistema
                        </h1>
                        <p className="text-xs text-slate-400 lg:text-slate-500 dark:lg:text-slate-400">
                            Digite suas credenciais de acesso
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {errorMsg && (
                            <div className="p-3 text-xs font-medium text-rose-500 lg:text-rose-600 bg-rose-500/10 lg:bg-rose-50 border border-rose-500/20 lg:border-rose-200 rounded-xl">
                                {errorMsg}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold text-slate-300 lg:text-slate-700 dark:lg:text-slate-300">
                                E-mail
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                inputMode="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                placeholder="seu.email@grupofelinto.com.br"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11 px-3.5 bg-slate-800 lg:bg-slate-50 dark:lg:bg-slate-800 border-slate-700 lg:border-slate-200 dark:lg:border-slate-700 text-white lg:text-slate-900 dark:lg:text-white focus:border-blue-600 rounded-xl text-xs transition-all placeholder:text-slate-500"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold text-slate-300 lg:text-slate-700 dark:lg:text-slate-300">
                                Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 pl-3.5 pr-10 bg-slate-800 lg:bg-slate-50 dark:lg:bg-slate-800 border-slate-700 lg:border-slate-200 dark:lg:border-slate-700 text-white lg:text-slate-900 dark:lg:text-white focus:border-blue-600 rounded-xl text-xs transition-all placeholder:text-slate-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 lg:hover:text-slate-600 dark:lg:hover:text-slate-200 transition-colors p-1"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Entrando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Acessar</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Rodapé do Formulário */}
                <div className="pt-6 text-center lg:text-left text-xs text-slate-500 border-t border-slate-800 lg:border-slate-100 dark:lg:border-slate-800">
                    Sua conta de acesso é gerenciada pela administração do sistema.
                </div>
            </div>
        </div>
    )
}
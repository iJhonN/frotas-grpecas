"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Truck, ShieldCheck } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
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
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 relative overflow-hidden p-4">
            {/* Elemento decorativo de fundo de malha viária */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

            <div className="w-full max-w-md z-10 space-y-6">
                {/* Cabeçalho da Marca */}
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 ring-4 ring-white">
                        <Truck className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Grupo GR Autopeças
                        </h1>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mt-0.5">
                            Gestão Integrada de Frotas
                        </p>
                    </div>
                </div>

                {/* Card Principal */}
                <Card className="border border-slate-200/80 shadow-xl shadow-slate-200/50 bg-white rounded-2xl">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-lg font-semibold text-slate-800 text-center">
                            Acesse sua conta
                        </CardTitle>
                        <CardDescription className="text-center text-slate-500 text-sm">
                            Informe suas credenciais para acessar o painel
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {errorMsg && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                                    E-mail corporativo
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu.nome@grupofelinto.com.br"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-11 border-slate-200 focus:border-blue-600 focus:ring-blue-600/20 rounded-xl"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-medium text-slate-700">
                                    Senha
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 border-slate-200 focus:border-blue-600 focus:ring-blue-600/20 rounded-xl"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-600/20 transition-all mt-2"
                            >
                                {loading ? "Autenticando..." : "Entrar no Sistema"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Rodapé de Segurança */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Ambiente operacional seguro &bull; Felinto Tech</span>
                </div>
            </div>
        </div>
    )
}
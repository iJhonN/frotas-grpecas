"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Lock, FileText, CheckCircle2, Loader2 } from "lucide-react"

export function LgpdModal() {
    const supabase = createClient()
    const [open, setOpen] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [accepting, setAccepting] = useState(false)

    useEffect(() => {
        async function checkConsent() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                setUserId(user.id)

                // Verifica na tabela profiles se o usuário já aceitou
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .maybeSingle()

                const profileData = profile as any

                // Se o perfil existir e o campo estiver nulo/vazio, abre o modal obrigatório
                if (profileData && !profileData.lgpd_accepted_at) {
                    setOpen(true)
                }
            } catch (err) {
                console.error("Erro ao verificar consentimento LGPD:", err)
            }
        }
        checkConsent()
    }, [])

    const handleAccept = async () => {
        if (!userId) return
        setAccepting(true)

        try {
            const { error } = await supabase
                .from("profiles")
                .update({ lgpd_accepted_at: new Date().toISOString() } as any)
                .eq("id", userId)

            if (error) throw error

            setOpen(false)
        } catch (err: any) {
            console.error("Erro ao salvar consentimento:", err)
            alert("Não foi possível salvar a aceitação. Tente novamente.")
        } finally {
            setAccepting(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 text-slate-200 max-w-xl w-full rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                            Termo de Consentimento & Privacidade (LGPD)
                        </h2>
                        <p className="text-xs text-slate-400">
                            Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
                        </p>
                    </div>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-slate-300 max-h-[50vh] overflow-y-auto pr-2">
                    <section className="space-y-1.5">
                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5 text-blue-400" />
                            1. Finalidade do Tratamento de Dados
                        </h3>
                        <p>
                            Para a gestão operacional de frotas, alocação de motoristas, controle de veículos, emissão de checklists e gestão de infrações, coletamos e processamos dados pessoais (como Nome, CPF, CNH e telefone).
                        </p>
                    </section>

                    <section className="space-y-1.5">
                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-blue-400" />
                            2. Sigilo e Confidencialidade
                        </h3>
                        <p>
                            Você declara ciência e compromisso de utilizar os dados de terceiros acessados nesta plataforma exclusivamente no exercício de suas funções operacionais, mantendo estrito sigilo corporativo.
                        </p>
                    </section>

                    <section className="space-y-1.5">
                        <h3 className="text-xs font-bold text-white">
                            3. Segurança
                        </h3>
                        <p>
                            As informações trafegadas nesta rede são encriptadas e sujeitas a auditorias de segurança e restrição de permissão por perfil e empresa.
                        </p>
                    </section>
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[10px] text-slate-500">
                        O aceite é obrigatório para utilizar o sistema.
                    </span>
                    <Button
                        onClick={handleAccept}
                        disabled={accepting}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 px-6 rounded-xl font-medium w-full sm:w-auto shadow-md"
                    >
                        {accepting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Registrando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Li e Concordo com os Termos
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
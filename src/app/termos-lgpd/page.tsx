import Link from "next/link"
import { ShieldCheck, Lock, FileText, ArrowLeft } from "lucide-react"

export default function TermosLgpdPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col justify-center items-center p-6">
            <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                    <ShieldCheck className="h-8 w-8 text-blue-500" />
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">
                            Política de Privacidade & LGPD
                        </h1>
                        <p className="text-xs text-slate-400">
                            Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
                        </p>
                    </div>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-slate-300 overflow-y-auto max-h-[60vh] pr-2">
                    <section className="space-y-2">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Lock className="h-4 w-4 text-blue-400" />
                            1. Coleta e Finalidade dos Dados
                        </h2>
                        <p>
                            O sistema coleta dados estritamente necessários para a gestão operacional da frota, emissão de checklists, controle de sinistros, apólices, licenças e alocação de motoristas (tais como Nome, CPF, CNH e telefone). Os dados não serão compartilhados com terceiros não autorizados.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-400" />
                            2. Segurança da Informação
                        </h2>
                        <p>
                            Todos os dados trafegados nesta plataforma são criptografados via protocolo TLS/HTTPS e submetidos a controle de acesso baseado em funções (RLS - Row-Level Security), garantindo que apenas usuários autorizados de cada empresa acessem seus respectivos dados.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-sm font-semibold text-white">
                            3. Direitos dos Titulares
                        </h2>
                        <p>
                            Nos termos do Art. 18 da LGPD, o titular dos dados ou administrador da empresa pode solicitar a consulta, retificação, eliminação ou portabilidade dos dados mantidos na base.
                        </p>
                    </section>
                </div>

                <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar ao Login
                    </Link>
                    <span className="text-[10px] font-mono text-slate-500">
                        Última atualização: Julho/2026
                    </span>
                </div>
            </div>
        </div>
    )
}
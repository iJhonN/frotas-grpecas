"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

export default function NovoCooperadoPage() {
    const router = useRouter()
    const supabase = createClient()

    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        nome: "",
        cpf_cnpj: "",
        telefone: "",
        pix_conta: "",
        taxa_administracao_pct: "0.00",
        observacoes: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const payload = {
                nome: formData.nome.trim(),
                cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ""),
                telefone: formData.telefone || null,
                pix_conta: formData.pix_conta || null,
                taxa_administracao_pct: Number(formData.taxa_administracao_pct.replace(",", ".")) || 0,
                status: true,
                observacoes: formData.observacoes || null,
            }

            const { error } = await supabase.from("cooperados").insert([payload as any])

            if (error) {
                console.error("Erro Supabase:", error)
                alert(`Erro ao cadastrar cooperado: ${error.message}`)
                return
            }

            router.push("/cooperados")
            router.refresh()
        } catch (err) {
            console.error("Erro inesperado:", err)
            alert("Erro inesperado ao salvar cooperado.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/cooperados"
                    className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                >
                    <ArrowLeft className="h-4 w-4 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cadastrar Cooperado / Proprietário</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Insira os dados do parceiro proprietário de veículos</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Identificação & Contato</h2>

                    <div className="space-y-1.5">
                        <Label htmlFor="nome" className="text-xs font-medium text-slate-700">Nome / Razão Social *</Label>
                        <Input
                            id="nome"
                            placeholder="Ex: João da Silva ou Transportes Silva LTDA"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="cpf_cnpj" className="text-xs font-medium text-slate-700">CPF / CNPJ *</Label>
                            <Input
                                id="cpf_cnpj"
                                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                                value={formData.cpf_cnpj}
                                onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="telefone" className="text-xs font-medium text-slate-700">Telefone / Celular</Label>
                            <Input
                                id="telefone"
                                placeholder="(83) 90000-0000"
                                value={formData.telefone}
                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Financeiro & Taxas</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="pix_conta" className="text-xs font-medium text-slate-700">Chave PIX ou Dados Bancários</Label>
                            <Input
                                id="pix_conta"
                                placeholder="Ex: CPF, e-mail, telefone ou Banco/Ag/Conta"
                                value={formData.pix_conta}
                                onChange={(e) => setFormData({ ...formData, pix_conta: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="taxa_administracao_pct" className="text-xs font-medium text-slate-700">Taxa de Administração (%)</Label>
                            <Input
                                id="taxa_administracao_pct"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.taxa_administracao_pct}
                                onChange={(e) => setFormData({ ...formData, taxa_administracao_pct: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <Label htmlFor="observacoes" className="text-xs font-medium text-slate-700">Observações</Label>
                        <Textarea
                            id="observacoes"
                            placeholder="Informações adicionais sobre o contrato ou repasses..."
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            className="rounded-xl border-slate-200 text-xs min-h-[80px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/cooperados"
                        className={buttonVariants({ variant: "outline", className: "h-10 rounded-xl" })}
                    >
                        Cancelar
                    </Link>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 px-6 rounded-xl font-medium shadow-sm"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Salvar Cooperado
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Loader2, Trash2, Building2 } from "lucide-react"

export default function DetalhesCooperadoPage({
                                                  params,
                                              }: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const [formData, setFormData] = useState({
        nome: "",
        cpf_cnpj: "",
        telefone: "",
        taxa_administracao_pct: "0",
        pix_conta: "",
        observacoes: "",
        status: true,
    })

    useEffect(() => {
        async function fetchCooperado() {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from("cooperados")
                    .select("*")
                    .eq("id", id)
                    .single()

                if (error) throw error

                if (data) {
                    const coop = data as any
                    setFormData({
                        nome: coop.nome || "",
                        cpf_cnpj: coop.cpf_cnpj || "",
                        telefone: coop.telefone || "",
                        taxa_administracao_pct: String(coop.taxa_administracao_pct ?? 0),
                        pix_conta: coop.pix_conta || "",
                        observacoes: coop.observacoes || "",
                        status: coop.status ?? true,
                    })
                }
            } catch (err) {
                console.error("Erro ao carregar cooperado:", err)
                alert("Cooperado não encontrado.")
                router.push("/cooperados")
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchCooperado()
    }, [id])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const payload = {
                nome: formData.nome.trim(),
                cpf_cnpj: formData.cpf_cnpj.trim() || null,
                telefone: formData.telefone.trim() || null,
                taxa_administracao_pct: Number(formData.taxa_administracao_pct),
                pix_conta: formData.pix_conta.trim() || null,
                observacoes: formData.observacoes.trim() || null,
                status: formData.status,
            }

            const { error } = await supabase
                .from("cooperados")
                .update(payload as any)
                .eq("id", id)

            if (error) throw error

            alert("Cooperado atualizado com sucesso!")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao atualizar cooperado:", err)
            alert(`Erro ao atualizar: ${err.message || "Erro desconhecido"}`)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir o cooperado ${formData.nome}?`)) return

        setDeleting(true)
        try {
            const { error } = await supabase.from("cooperados").delete().eq("id", id)
            if (error) throw error

            alert("Cooperado excluído com sucesso!")
            router.push("/cooperados")
        } catch (err: any) {
            console.error("Erro ao excluir cooperado:", err)
            alert("Não foi possível excluir o cooperado. Verifique se existem veículos vinculados a ele.")
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Carregando dados do cooperado...</span>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/cooperados"
                        className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {formData.nome}
                            </h1>
                            <Badge
                                variant="outline"
                                className={formData.status ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600"}
                            >
                                {formData.status ? "Ativo" : "Inativo"}
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {formData.cpf_cnpj || "Sem documento informado"}
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-9 rounded-xl gap-2 text-xs font-medium self-start sm:self-auto"
                >
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Excluir Cooperado
                </Button>
            </div>

            <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        Informações Cadastrais
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Nome / Razão Social *</Label>
                            <Input
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">CPF / CNPJ</Label>
                            <Input
                                value={formData.cpf_cnpj}
                                onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Telefone / WhatsApp</Label>
                            <Input
                                value={formData.telefone}
                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Repasses & Financeiro</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Taxa de Administração (%)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                value={formData.taxa_administracao_pct}
                                onChange={(e) => setFormData({ ...formData, taxa_administracao_pct: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Chave PIX / Dados Bancários</Label>
                            <Input
                                value={formData.pix_conta}
                                onChange={(e) => setFormData({ ...formData, pix_conta: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-medium text-slate-700">Observações</Label>
                    <Textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        className="rounded-xl border-slate-200 text-xs min-h-[80px]"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/cooperados"
                        className={buttonVariants({ variant: "outline", className: "h-10 rounded-xl" })}
                    >
                        Voltar
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
                                Salvar Alterações
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
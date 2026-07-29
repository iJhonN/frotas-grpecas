"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2, Trash2, AlertTriangle } from "lucide-react"

export default function DetalhesAbastecimentoPage({
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
        vehicle_id: "",
        driver_id: "",
        data: "",
        km_odometro: "",
        litros: "",
        valor_total: "",
        valor_por_litro: "",
        combustivel: "diesel",
        posto_fornecedor: "",
        forma_pagamento: "faturado",
        nota_fiscal_ref: "",
        consumo_kml: null as number | null,
        alerta: false,
        observacoes: "",
    })

    useEffect(() => {
        async function fetchRecord() {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from("fuel_records")
                    .select("*")
                    .eq("id", id)
                    .single()

                if (error) throw error

                if (data) {
                    setFormData({
                        vehicle_id: data.vehicle_id || "",
                        driver_id: data.driver_id || "",
                        data: data.data ? new Date(data.data).toISOString().split("T")[0] : "",
                        km_odometro: String(data.km_odometro || ""),
                        litros: String(data.litros || ""),
                        valor_total: String(data.valor_total || ""),
                        valor_por_litro: String(data.valor_por_litro || ""),
                        combustivel: data.combustivel || "diesel",
                        posto_fornecedor: data.posto_fornecedor || "",
                        forma_pagamento: data.forma_pagamento || "faturado",
                        nota_fiscal_ref: data.nota_fiscal_ref || "",
                        consumo_kml: data.consumo_kml,
                        alerta: data.alerta || false,
                        observacoes: data.observacoes || "",
                    })
                }
            } catch (err) {
                console.error("Erro ao carregar abastecimento:", err)
                alert("Abastecimento não encontrado.")
                router.push("/abastecimentos")
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchRecord()
    }, [id])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const payload = {
                data: new Date(formData.data).toISOString(),
                km_odometro: Number(formData.km_odometro),
                litros: Number(formData.litros),
                valor_total: Number(formData.valor_total),
                valor_por_litro: Number(formData.valor_por_litro),
                combustivel: formData.combustivel,
                posto_fornecedor: formData.posto_fornecedor,
                forma_pagamento: formData.forma_pagamento,
                nota_fiscal_ref: formData.nota_fiscal_ref || null,
                observacoes: formData.observacoes || null,
            }

            const { error } = await supabase
                .from("fuel_records")
                .update(payload as any)
                .eq("id", id)

            if (error) throw error

            alert("Abastecimento atualizado com sucesso!")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao atualizar:", err)
            alert(`Erro ao atualizar: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este abastecimento?")) return

        setDeleting(true)
        try {
            const { error } = await supabase.from("fuel_records").delete().eq("id", id)
            if (error) throw error

            alert("Abastecimento excluído com sucesso!")
            router.push("/abastecimentos")
        } catch (err: any) {
            console.error("Erro ao excluir:", err)
            alert("Erro ao excluir abastecimento.")
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Carregando registro de abastecimento...</span>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/abastecimentos"
                        className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Detalhes do Abastecimento</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Posto {formData.posto_fornecedor}</p>
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
                    Excluir Registro
                </Button>
            </div>

            {formData.alerta && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                    <div>
                        <h3 className="text-sm font-bold text-rose-800">Alerta de Consumo Elevado</h3>
                        <p className="text-xs text-rose-600 mt-0.5">
                            O rendimento registrado ({formData.consumo_kml} km/L) está significativamente abaixo da meta estipulada para este veículo.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Data *</Label>
                        <Input
                            type="date"
                            value={formData.data}
                            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">KM Odômetro *</Label>
                        <Input
                            type="number"
                            value={formData.km_odometro}
                            onChange={(e) => setFormData({ ...formData, km_odometro: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Consumo Calculado</Label>
                        <div className="h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center px-3">
                            <span className="text-xs font-bold text-slate-800">
                                {formData.consumo_kml ? `${formData.consumo_kml} KM/L` : "Não calculado"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Litros *</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.litros}
                            onChange={(e) => setFormData({ ...formData, litros: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Valor Total (R$) *</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.valor_total}
                            onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Valor / Litro (R$) *</Label>
                        <Input
                            type="number"
                            step="0.001"
                            value={formData.valor_por_litro}
                            onChange={(e) => setFormData({ ...formData, valor_por_litro: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Posto / Fornecedor *</Label>
                        <Input
                            value={formData.posto_fornecedor}
                            onChange={(e) => setFormData({ ...formData, posto_fornecedor: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Nota / Cupom Fiscal</Label>
                        <Input
                            value={formData.nota_fiscal_ref}
                            onChange={(e) => setFormData({ ...formData, nota_fiscal_ref: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Observações</Label>
                    <Textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        className="rounded-xl border-slate-200 text-xs min-h-[80px]"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/abastecimentos"
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
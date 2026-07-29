"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react"

export default function DetalhesMotoristaPage({
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
    const [vehicles, setVehicles] = useState<any[]>([])

    const [formData, setFormData] = useState({
        nome_completo: "",
        cpf: "",
        telefone: "",
        cidade: "",
        id_motorista_legado: "",
        cnh_numero: "",
        cnh_categoria: "AD",
        cnh_validade: "",
        toxicologico_validade: "",
        curso_transporte_passageiros_validade: "",
        ear: false,
        status: "ativo",
        veiculo_atual_id: "nenhum",
        observacoes: "",
    })

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // 1. Busca os dados do motorista
                const { data: driver, error } = await supabase
                    .from("drivers")
                    .select("*")
                    .eq("id", id)
                    .single()

                if (error) throw error

                // 2. Busca lista de veículos para vínculo
                if (driver) {
                    const { data: vehs } = await supabase
                        .from("vehicles")
                        .select("id, placa, marca, modelo")
                        .eq("company_id", driver.company_id)

                    setVehicles(vehs || [])

                    setFormData({
                        nome_completo: driver.nome_completo || "",
                        cpf: driver.cpf || "",
                        telefone: driver.telefone || "",
                        cidade: driver.cidade || "",
                        id_motorista_legado: driver.id_motorista_legado || "",
                        cnh_numero: driver.cnh_numero || "",
                        cnh_categoria: Array.isArray(driver.categorias_cnh) ? driver.categorias_cnh.join("") : "AD",
                        cnh_validade: driver.cnh_validade ? driver.cnh_validade.split("T")[0] : "",
                        toxicologico_validade: driver.toxicologico_validade ? driver.toxicologico_validade.split("T")[0] : "",
                        curso_transporte_passageiros_validade: driver.curso_transporte_passageiros_validade ? driver.curso_transporte_passageiros_validade.split("T")[0] : "",
                        ear: driver.ear || false,
                        status: driver.status || "ativo",
                        veiculo_atual_id: driver.veiculo_atual_id || "nenhum",
                        observacoes: driver.observacoes || "",
                    })
                }
            } catch (err) {
                console.error("Erro ao carregar motorista:", err)
                alert("Motorista não encontrado.")
                router.push("/motoristas")
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchData()
    }, [id])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const categoriasArray = formData.cnh_categoria.split("")

            const payload = {
                nome_completo: formData.nome_completo.trim(),
                cpf: formData.cpf.replace(/\D/g, ""),
                telefone: formData.telefone || null,
                cidade: formData.cidade.trim() || null,
                id_motorista_legado: formData.id_motorista_legado.trim() || null,
                cnh_numero: formData.cnh_numero.replace(/\D/g, ""),
                categorias_cnh: categoriasArray,
                cnh_validade: formData.cnh_validade,
                toxicologico_validade: formData.toxicologico_validade || null,
                curso_transporte_passageiros_validade: formData.curso_transporte_passageiros_validade || null,
                ear: formData.ear,
                status: formData.status,
                veiculo_atual_id: formData.veiculo_atual_id === "nenhum" ? null : formData.veiculo_atual_id,
                observacoes: formData.observacoes || null,
            }

            const { error } = await supabase
                .from("drivers")
                .update(payload as any)
                .eq("id", id)

            if (error) throw error

            alert("Motorista atualizado com sucesso!")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao atualizar motorista:", err)
            alert(`Erro ao atualizar: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este motorista?")) return

        setDeleting(true)
        try {
            const { error } = await supabase.from("drivers").delete().eq("id", id)
            if (error) throw error

            alert("Motorista excluído com sucesso!")
            router.push("/motoristas")
        } catch (err: any) {
            console.error("Erro ao excluir:", err)
            alert("Erro ao excluir motorista.")
        } finally {
            setDeleting(false)
        }
    }

    const currentVehicleObj = vehicles.find((v) => v.id === formData.veiculo_atual_id)

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Carregando dados do motorista...</span>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/motoristas"
                        className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Editar Motorista</h1>
                        <p className="text-xs text-slate-500 mt-0.5">{formData.nome_completo}</p>
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
                    Excluir Motorista
                </Button>
            </div>

            <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                {/* 1. Dados Pessoais & Status */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Dados Pessoais & Status</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1.5">
                            <Label htmlFor="nome_completo" className="text-xs font-medium text-slate-700">
                                Nome Completo *
                            </Label>
                            <Input
                                id="nome_completo"
                                value={formData.nome_completo}
                                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Status *</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData({ ...formData, status: val || "ativo" })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                    <SelectItem value="ferias">Em Férias</SelectItem>
                                    <SelectItem value="afastado">Afastado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="cpf" className="text-xs font-medium text-slate-700">
                                CPF *
                            </Label>
                            <Input
                                id="cpf"
                                value={formData.cpf}
                                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="telefone" className="text-xs font-medium text-slate-700">
                                Telefone / Celular
                            </Label>
                            <Input
                                id="telefone"
                                value={formData.telefone}
                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="cidade" className="text-xs font-medium text-slate-700">
                                Cidade
                            </Label>
                            <Input
                                id="cidade"
                                value={formData.cidade}
                                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. CNH e Validades */}
                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Habilitação & CNH</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="cnh_numero" className="text-xs font-medium text-slate-700">
                                Nº Registro CNH *
                            </Label>
                            <Input
                                id="cnh_numero"
                                value={formData.cnh_numero}
                                onChange={(e) => setFormData({ ...formData, cnh_numero: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Categoria CNH *</Label>
                            <Select
                                value={formData.cnh_categoria}
                                onValueChange={(val) => setFormData({ ...formData, cnh_categoria: val || "AD" })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A">A</SelectItem>
                                    <SelectItem value="B">B</SelectItem>
                                    <SelectItem value="C">C</SelectItem>
                                    <SelectItem value="D">D</SelectItem>
                                    <SelectItem value="E">E</SelectItem>
                                    <SelectItem value="AB">AB</SelectItem>
                                    <SelectItem value="AC">AC</SelectItem>
                                    <SelectItem value="AD">AD</SelectItem>
                                    <SelectItem value="AE">AE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="cnh_validade" className="text-xs font-medium text-slate-700">
                                Validade CNH *
                            </Label>
                            <Input
                                id="cnh_validade"
                                type="date"
                                value={formData.cnh_validade}
                                onChange={(e) => setFormData({ ...formData, cnh_validade: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="toxicologico_validade" className="text-xs font-medium text-slate-700">
                                Validade Exame Toxicológico
                            </Label>
                            <Input
                                id="toxicologico_validade"
                                type="date"
                                value={formData.toxicologico_validade}
                                onChange={(e) => setFormData({ ...formData, toxicologico_validade: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="curso_transporte_passageiros_validade" className="text-xs font-medium text-slate-700">
                                Validade Curso Transp. Passageiros
                            </Label>
                            <Input
                                id="curso_transporte_passageiros_validade"
                                type="date"
                                value={formData.curso_transporte_passageiros_validade}
                                onChange={(e) => setFormData({ ...formData, curso_transporte_passageiros_validade: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                            id="ear"
                            checked={formData.ear}
                            onCheckedChange={(checked) => setFormData({ ...formData, ear: !!checked })}
                        />
                        <Label htmlFor="ear" className="text-xs text-slate-700 font-medium cursor-pointer">
                            Exerce Atividade Remunerada (EAR) na CNH
                        </Label>
                    </div>
                </div>

                {/* 3. Vínculo e Observações */}
                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Vínculo de Veículo & Observações</h2>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Veículo Atual Atribuído</Label>
                        <Select
                            value={formData.veiculo_atual_id}
                            onValueChange={(val) => setFormData({ ...formData, veiculo_atual_id: val || "nenhum" })}
                        >
                            <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                <SelectValue placeholder="Selecione um veículo para vincular ao motorista">
                                    {currentVehicleObj
                                        ? `${currentVehicleObj.placa} - ${currentVehicleObj.marca} ${currentVehicleObj.modelo}`
                                        : undefined}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nenhum">Nenhum veículo vinculado</SelectItem>
                                {vehicles.map((v) => (
                                    <SelectItem key={v.id} value={v.id}>
                                        <span>{v.placa} - {v.marca} {v.modelo}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="observacoes" className="text-xs font-medium text-slate-700">
                            Observações
                        </Label>
                        <Textarea
                            id="observacoes"
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            className="rounded-xl border-slate-200 text-xs min-h-[70px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/motoristas"
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
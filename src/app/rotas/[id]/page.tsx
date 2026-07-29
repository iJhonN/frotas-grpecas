"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCompany } from "@/contexts/company-context"
import { createClient } from "@/lib/supabase/client"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Loader2, Trash2, Plus, RefreshCw } from "lucide-react"

export default function DetalhesRotaPage({
                                             params,
                                         }: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const { selectedCompany } = useCompany()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [vehicles, setVehicles] = useState<any[]>([])
    const [drivers, setDrivers] = useState<any[]>([])
    const [stops, setStops] = useState<any[]>([])
    const [coverages, setCoverages] = useState<any[]>([])

    // Estado para adicionar novo ponto
    const [newStop, setNewStop] = useState({ nome_ponto: "", endereco: "" })
    const [addingStop, setAddingStop] = useState(false)

    // Estado para abrir cobertura de substituição
    const [showCoverageForm, setShowCoverageForm] = useState(false)
    const [coverageData, setCoverageData] = useState({
        veiculo_cobrindo_id: "",
        motivo: "quebrado_manutencao",
        observacoes: "",
    })

    const [formData, setFormData] = useState({
        id_rota_legado: "",
        praca: "",
        itinerario_descricao: "",
        turno: "manha",
        horarios: "",
        km_dia: "0",
        veiculo_titular_id: "nenhum",
        motorista_id: "nenhum",
        situacao_rota: "ativa",
        observacoes: "",
    })

    const fetchAllData = async () => {
        setLoading(true)
        try {
            // 1. Rota
            const { data: route, error } = await supabase
                .from("routes")
                .select("*")
                .eq("id", id)
                .single()

            if (error) throw error

            if (route) {
                setFormData({
                    id_rota_legado: route.id_rota_legado || "",
                    praca: route.praca || "",
                    itinerario_descricao: route.itinerario_descricao || "",
                    turno: route.turno || "manha",
                    horarios: route.horarios || "",
                    km_dia: String(route.km_dia || "0"),
                    veiculo_titular_id: route.veiculo_titular_id || "nenhum",
                    motorista_id: route.motorista_id || "nenhum",
                    situacao_rota: route.situacao_rota || "ativa",
                    observacoes: route.observacoes || "",
                })
            }

            // 2. Pontos de Parada
            const { data: stopsData } = await supabase
                .from("route_stops")
                .select("*")
                .eq("route_id", id)
                .order("ordem", { ascending: true })

            setStops(stopsData || [])

            // 3. Coberturas ativas/histórico
            const { data: covData } = await supabase
                .from("route_coverages")
                .select(`
                    *,
                    veiculo_parado:veiculo_parado_id (placa, modelo),
                    veiculo_cobrindo:veiculo_cobrindo_id (placa, modelo)
                `)
                .eq("route_id", id)
                .order("created_at", { ascending: false })

            setCoverages(covData || [])

            // 4. Veículos & Motoristas para os dropdowns
            if (selectedCompany) {
                const [vRes, dRes] = await Promise.all([
                    supabase.from("vehicles").select("id, placa, marca, modelo").eq("company_id", selectedCompany.id),
                    supabase.from("drivers").select("id, nome_completo").eq("company_id", selectedCompany.id)
                ])
                setVehicles(vRes.data || [])
                setDrivers(dRes.data || [])
            }
        } catch (err) {
            console.error("Erro ao carregar rota:", err)
            alert("Rota não encontrada.")
            router.push("/rotas")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Ignora a busca no banco se for a rota de cadastro de nova/novo rota
        if (id === "novo" || id === "nova") return

        if (id) fetchAllData()
    }, [id, selectedCompany])

    // Salvar alterações da rota
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const payload = {
                praca: formData.praca.trim(),
                itinerario_descricao: formData.itinerario_descricao.trim(),
                turno: formData.turno,
                horarios: formData.horarios.trim() || null,
                km_dia: Number(formData.km_dia) || 0,
                id_rota_legado: formData.id_rota_legado.trim() || null,
                veiculo_titular_id: formData.veiculo_titular_id === "nenhum" ? null : formData.veiculo_titular_id,
                motorista_id: formData.motorista_id === "nenhum" ? null : formData.motorista_id,
                situacao_rota: formData.situacao_rota,
                observacoes: formData.observacoes || null,
            }

            const { error } = await supabase.from("routes").update(payload as any).eq("id", id)
            if (error) throw error

            alert("Rota atualizada com sucesso!")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao atualizar rota:", err)
            alert(`Erro ao atualizar: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    // Adicionar ponto de parada
    const handleAddStop = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newStop.nome_ponto) return

        setAddingStop(true)
        try {
            const proxOrdem = stops.length + 1
            const { error } = await supabase.from("route_stops").insert([{
                route_id: id,
                nome_ponto: newStop.nome_ponto,
                endereco: newStop.endereco || null,
                ordem: proxOrdem
            }])

            if (error) throw error

            setNewStop({ nome_ponto: "", endereco: "" })
            fetchAllData()
        } catch (err: any) {
            alert("Erro ao adicionar ponto de parada.")
        } finally {
            setAddingStop(false)
        }
    }

    // Deletar ponto de parada
    const handleDeleteStop = async (stopId: string) => {
        try {
            await supabase.from("route_stops").delete().eq("id", stopId)
            fetchAllData()
        } catch (err) {
            console.error(err)
        }
    }

    // Registrar nova Substituição / Cobertura
    const handleCreateCoverage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.veiculo_titular_id === "nenhum") {
            alert("A rota precisa ter um veículo titular para registrar uma substituição.")
            return
        }

        try {
            const payload = {
                route_id: id,
                data_inicio: new Date().toISOString().split("T")[0],
                veiculo_parado_id: formData.veiculo_titular_id,
                veiculo_cobrindo_id: coverageData.veiculo_cobrindo_id,
                motivo: coverageData.motivo,
                status: "em_andamento",
                observacoes: coverageData.observacoes || null
            }

            const { error } = await supabase.from("route_coverages").insert([payload as any])
            if (error) throw error

            setShowCoverageForm(false)
            setCoverageData({ veiculo_cobrindo_id: "", motivo: "quebrado_manutencao", observacoes: "" })
            fetchAllData()
        } catch (err: any) {
            alert(`Erro ao salvar cobertura: ${err.message}`)
        }
    }

    // Encerrar Substituição / Cobertura
    const handleEndCoverage = async (covId: string) => {
        try {
            const { error } = await supabase
                .from("route_coverages")
                .update({
                    status: "finalizado",
                    data_fim: new Date().toISOString().split("T")[0]
                } as any)
                .eq("id", covId)

            if (error) throw error
            fetchAllData()
        } catch (err) {
            alert("Erro ao encerrar cobertura.")
        }
    }

    const currentVehicleObj = vehicles.find((v) => v.id === formData.veiculo_titular_id)
    const currentDriverObj = drivers.find((d) => d.id === formData.motorista_id)

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-xs font-medium">Carregando informações da rota...</span>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/rotas"
                        className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Editar Rota</h1>
                        <p className="text-xs text-slate-500 mt-0.5">{formData.praca}</p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCoverageForm(!showCoverageForm)}
                    className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 h-9 rounded-xl gap-2 text-xs font-semibold self-start sm:self-auto"
                >
                    <RefreshCw className="h-3.5 w-3.5 text-amber-600" />
                    Substituir Veículo / Cobertura
                </Button>
            </div>

            {/* Modal/Formulário de Cobertura */}
            {showCoverageForm && (
                <form onSubmit={handleCreateCoverage} className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                        <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-2">
                            <RefreshCw className="h-3.5 w-3.5 text-amber-600" />
                            Registrar Cobertura (Substituição de Frota)
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Veículo que assumirá a Rota *</Label>
                            <Select
                                value={coverageData.veiculo_cobrindo_id}
                                onValueChange={(val) => setCoverageData({ ...coverageData, veiculo_cobrindo_id: val || "" })}
                                required
                            >
                                <SelectTrigger className="h-10 rounded-xl border-amber-200 bg-white">
                                    <SelectValue placeholder="Selecione o veículo reserva" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicles
                                        .filter((v) => v.id !== formData.veiculo_titular_id)
                                        .map((v) => (
                                            <SelectItem key={v.id} value={v.id}>
                                                {v.placa} - {v.marca} {v.modelo}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Motivo da Cobertura *</Label>
                            <Select
                                value={coverageData.motivo}
                                onValueChange={(val) => setCoverageData({ ...coverageData, motivo: val || "quebrado_manutencao" })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-amber-200 bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="quebrado_manutencao">Veículo Titular Quebrado / Manutenção</SelectItem>
                                    <SelectItem value="revisao_preventiva">Revisão Preventiva</SelectItem>
                                    <SelectItem value="sinistro_acidente">Sinistro / Colisão</SelectItem>
                                    <SelectItem value="documentacao">Documentação / Vistoria</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setShowCoverageForm(false)} className="h-9 text-xs">
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white h-9 px-4 rounded-xl text-xs font-semibold">
                            Confirmar Substituição
                        </Button>
                    </div>
                </form>
            )}

            {/* Histórico de Coberturas da Rota */}
            {coverages.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Substituições nesta Rota</h3>
                    <div className="space-y-2">
                        {coverages.map((c) => (
                            <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                                <div>
                                    <span className="font-bold text-slate-900">{c.veiculo_cobrindo?.placa}</span> cobrindo <span className="font-semibold text-rose-600">{c.veiculo_parado?.placa}</span>
                                    <span className="text-slate-500 block text-[10px] mt-0.5">Desde {new Date(c.data_inicio).toLocaleDateString("pt-BR")} &bull; Motivo: {c.motivo?.replace("_", " ")}</span>
                                </div>
                                {c.status === "em_andamento" ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEndCoverage(c.id)}
                                        className="h-8 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                                    >
                                        Encerrar Cobertura
                                    </Button>
                                ) : (
                                    <Badge variant="outline" className="bg-slate-100 text-slate-600">Finalizada em {new Date(c.data_fim).toLocaleDateString("pt-BR")}</Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Formulário Principal da Rota */}
            <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Informações da Rota / Linha</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1.5">
                            <Label htmlFor="praca" className="text-xs font-medium text-slate-700">
                                Praça / Nome da Linha *
                            </Label>
                            <Input
                                id="praca"
                                value={formData.praca}
                                onChange={(e) => setFormData({ ...formData, praca: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Situação *</Label>
                            <Select
                                value={formData.situacao_rota}
                                onValueChange={(val) => setFormData({ ...formData, situacao_rota: val || "ativa" })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ativa">Ativa</SelectItem>
                                    <SelectItem value="inativa">Inativa / Suspensa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="itinerario_descricao" className="text-xs font-medium text-slate-700">
                            Descrição do Itinerário *
                        </Label>
                        <Textarea
                            id="itinerario_descricao"
                            value={formData.itinerario_descricao}
                            onChange={(e) => setFormData({ ...formData, itinerario_descricao: e.target.value })}
                            className="rounded-xl border-slate-200 text-xs min-h-[70px]"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Turno *</Label>
                            <Select
                                value={formData.turno}
                                onValueChange={(val) => setFormData({ ...formData, turno: val || "manha" })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manha">Manhã</SelectItem>
                                    <SelectItem value="tarde">Tarde</SelectItem>
                                    <SelectItem value="noite">Noite</SelectItem>
                                    <SelectItem value="manha_tarde">Manhã e Tarde</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="horarios" className="text-xs font-medium text-slate-700">
                                Horários
                            </Label>
                            <Input
                                id="horarios"
                                value={formData.horarios}
                                onChange={(e) => setFormData({ ...formData, horarios: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="km_dia" className="text-xs font-medium text-slate-700">
                                Quilometragem Diária (KM) *
                            </Label>
                            <Input
                                id="km_dia"
                                type="number"
                                step="0.1"
                                value={formData.km_dia}
                                onChange={(e) => setFormData({ ...formData, km_dia: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Atribuição de Veículo e Motorista Titulares</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Veículo Titular</Label>
                            <Select
                                value={formData.veiculo_titular_id}
                                onValueChange={(val) => setFormData({ ...formData, veiculo_titular_id: val || "nenhum" })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Selecione o veículo titular">
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
                            <Label className="text-xs font-medium text-slate-700">Motorista Titular</Label>
                            <Select
                                value={formData.motorista_id}
                                onValueChange={(val) => setFormData({ ...formData, motorista_id: val || "nenhum" })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Selecione o motorista titular">
                                        {currentDriverObj?.nome_completo}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nenhum">Nenhum motorista vinculado</SelectItem>
                                    {drivers.map((d) => (
                                        <SelectItem key={d.id} value={d.id}>
                                            <span>{d.nome_completo}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Pontos de Parada */}
                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
                        <span>Pontos de Parada ({stops.length})</span>
                    </h2>

                    <div className="space-y-2">
                        {stops.map((stop) => (
                            <div key={stop.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs border border-slate-200/80">
                                <div className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                                        {stop.ordem}
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 block">{stop.nome_ponto}</span>
                                        {stop.endereco && <span className="text-slate-500 text-[10px]">{stop.endereco}</span>}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteStop(stop.id)}
                                    className="h-7 w-7 text-slate-400 hover:text-red-600"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Form simples para adicionar ponto */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                        <Input
                            placeholder="Nome do Ponto / Terminal"
                            value={newStop.nome_ponto}
                            onChange={(e) => setNewStop({ ...newStop, nome_ponto: e.target.value })}
                            className="h-9 text-xs rounded-xl border-slate-200"
                        />
                        <Input
                            placeholder="Endereço / Referência (opcional)"
                            value={newStop.endereco}
                            onChange={(e) => setNewStop({ ...newStop, endereco: e.target.value })}
                            className="h-9 text-xs rounded-xl border-slate-200"
                        />
                        <Button
                            type="button"
                            onClick={handleAddStop}
                            disabled={addingStop || !newStop.nome_ponto}
                            className="h-9 text-xs bg-slate-800 hover:bg-slate-900 text-white rounded-xl gap-1.5"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Adicionar Ponto
                        </Button>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/rotas"
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
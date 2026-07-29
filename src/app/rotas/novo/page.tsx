"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Save, Loader2 } from "lucide-react"

export default function NovoRotaPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [submitting, setSubmitting] = useState(false)
    const [vehicles, setVehicles] = useState<any[]>([])
    const [drivers, setDrivers] = useState<any[]>([])

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

    useEffect(() => {
        async function loadOptions() {
            if (!selectedCompany) return
            try {
                const [vehRes, drvRes] = await Promise.all([
                    supabase.from("vehicles").select("id, placa, marca, modelo").eq("company_id", selectedCompany.id),
                    supabase.from("drivers").select("id, nome_completo").eq("company_id", selectedCompany.id)
                ])

                setVehicles(vehRes.data || [])
                setDrivers(drvRes.data || [])
            } catch (err) {
                console.error("Erro ao carregar veículos/motoristas:", err)
            }
        }
        loadOptions()
    }, [selectedCompany])

    const handleSubmit = async (e: React.FormEvent) => {
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

            const { error } = await supabase.from("routes").insert([payload as any])
            if (error) throw error

            router.push("/rotas")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao cadastrar rota:", err)
            alert(`Erro ao salvar: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    const currentVehicleObj = vehicles.find((v) => v.id === formData.veiculo_titular_id)
    const currentDriverObj = drivers.find((d) => d.id === formData.motorista_id)

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Link
                    href="/rotas"
                    className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                >
                    <ArrowLeft className="h-4 w-4 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cadastrar Nova Rota</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Defina o trajeto, horários, veículos e motoristas responsáveis</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Informações da Rota / Linha</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1.5">
                            <Label htmlFor="praca" className="text-xs font-medium text-slate-700">
                                Praça / Nome da Linha *
                            </Label>
                            <Input
                                id="praca"
                                placeholder="Ex: Linha 101 - Centro / Distrito Industrial"
                                value={formData.praca}
                                onChange={(e) => setFormData({ ...formData, praca: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="id_rota_legado" className="text-xs font-medium text-slate-700">
                                Código Legado / ID
                            </Label>
                            <Input
                                id="id_rota_legado"
                                placeholder="Ex: ROTA-05"
                                value={formData.id_rota_legado}
                                onChange={(e) => setFormData({ ...formData, id_rota_legado: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="itinerario_descricao" className="text-xs font-medium text-slate-700">
                            Descrição do Itinerário *
                        </Label>
                        <Textarea
                            id="itinerario_descricao"
                            placeholder="Descreva os bairros, vias principais ou sequência do trajeto..."
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
                                placeholder="Ex: Saída: 06:30 | Retorno: 17:30"
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

                    <div className="space-y-1.5">
                        <Label htmlFor="observacoes" className="text-xs font-medium text-slate-700">
                            Observações Gerais
                        </Label>
                        <Textarea
                            id="observacoes"
                            placeholder="Informações sobre passe, cliente contratante ou orientações para a rota..."
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            className="rounded-xl border-slate-200 text-xs min-h-[70px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/rotas"
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
                                Salvar Rota
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
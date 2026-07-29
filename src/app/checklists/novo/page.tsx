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
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

const CHECK_ITEMS = [
    { key: "pneus", label: "Pneus & Estepes" },
    { key: "freios", label: "Sistema de Freios" },
    { key: "luzes_setas", label: "Luzes, Faróis & Setas" },
    { key: "oleo_fluidos", label: "Nível de Óleo & Fluidos" },
    { key: "arrefecimento", label: "Sistema de Arrefecimento / Água" },
    { key: "palhetas", label: "Limpadores & Palhetas" },
    { key: "docs_a_bordo", label: "Documentos a Bordo (CRLV / Licenciamento)" },
    { key: "itens_obrigatorios", label: "Itens Obrigatórios (Triângulo, Macaco, Chave de Roda)" },
    { key: "lataria_vidros", label: "Lataria, Para-choques & Vidros" },
    { key: "interior", label: "Higienização Interior & Estofamento" },
]

export default function NovoChecklistPage() {
    const { selectedCompany } = useCompany()
    const router = useRouter()
    const supabase = createClient()

    const [submitting, setSubmitting] = useState(false)
    const [vehicles, setVehicles] = useState<any[]>([])
    const [drivers, setDrivers] = useState<any[]>([])

    const [formData, setFormData] = useState<Record<string, any>>({
        data: new Date().toISOString().slice(0, 16),
        tipo: "checklist_diario",
        vehicle_id: "",
        driver_id: "nenhum",
        contrato_ref: "",
        km: "",
        combustivel_pct: "100",
        pneus: "ok",
        freios: "ok",
        luzes_setas: "ok",
        oleo_fluidos: "ok",
        arrefecimento: "ok",
        palhetas: "ok",
        docs_a_bordo: "ok",
        itens_obrigatorios: "ok",
        lataria_vidros: "ok",
        interior: "ok",
        avarias_observacoes: "",
    })

    useEffect(() => {
        async function loadOptions() {
            if (!selectedCompany) return
            try {
                const [vRes, dRes] = await Promise.all([
                    supabase.from("vehicles").select("id, placa, marca, modelo, km_atual").eq("company_id", selectedCompany.id),
                    supabase.from("drivers").select("id, nome_completo").eq("company_id", selectedCompany.id)
                ])

                setVehicles(vRes.data || [])
                setDrivers(dRes.data || [])
            } catch (err) {
                console.error("Erro ao carregar veículos/motoristas:", err)
            }
        }
        loadOptions()
    }, [selectedCompany])

    const handleVehicleChange = (vId: string) => {
        const v = vehicles.find((veh) => veh.id === vId)
        setFormData((prev) => ({
            ...prev,
            vehicle_id: vId,
            km: v ? String(v.km_atual) : prev.km,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCompany) return

        setSubmitting(true)
        try {
            // Contagem de reprovados
            let reprovados = 0
            CHECK_ITEMS.forEach((item) => {
                if (formData[item.key] === "reprovado" || formData[item.key] === "defeito") {
                    reprovados++
                }
            })

            const resultadoFinal = reprovados > 0 ? "reprovado" : "aprovado"

            const payload = {
                company_id: selectedCompany.id,
                data: formData.data,
                tipo: formData.tipo,
                vehicle_id: formData.vehicle_id,
                driver_id: formData.driver_id === "nenhum" ? null : formData.driver_id,
                contrato_ref: formData.contrato_ref.trim() || null,
                km: Number(formData.km) || 0,
                combustivel_pct: formData.combustivel_pct ? Number(formData.combustivel_pct) : null,
                pneus: formData.pneus,
                freios: formData.freios,
                luzes_setas: formData.luzes_setas,
                oleo_fluidos: formData.oleo_fluidos,
                arrefecimento: formData.arrefecimento,
                palhetas: formData.palhetas,
                docs_a_bordo: formData.docs_a_bordo,
                itens_obrigatorios: formData.itens_obrigatorios,
                lataria_vidros: formData.lataria_vidros,
                interior: formData.interior,
                reprovados_count: reprovados,
                resultado: resultadoFinal,
                avarias_observacoes: formData.avarias_observacoes.trim() || null,
            }

            const { error } = await supabase.from("inspections").insert([payload])
            if (error) throw error

            // Atualiza o KM do veículo se for superior ao atual
            const selectedVeh = vehicles.find((v) => v.id === formData.vehicle_id)
            if (selectedVeh && Number(formData.km) > Number(selectedVeh.km_atual)) {
                await supabase
                    .from("vehicles")
                    .update({ km_atual: Number(formData.km) })
                    .eq("id", formData.vehicle_id)
            }

            router.push("/checklists")
            router.refresh()
        } catch (err: any) {
            console.error("Erro ao salvar checklists:", err)
            alert(`Erro ao salvar: ${err.message}`)
        } finally {
            setSubmitting(false)
        }
    }

    const currentVehicleObj = vehicles.find((v) => v.id === formData.vehicle_id)
    const currentDriverObj = drivers.find((d) => d.id === formData.driver_id)

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Link
                    href="/checklists"
                    className={buttonVariants({ variant: "outline", size: "icon", className: "h-9 w-9 rounded-xl border-slate-200" })}
                >
                    <ArrowLeft className="h-4 w-4 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Realizar Checklist de Veículo</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Inspecione os itens de segurança, lataria, fluídos e mecânica</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Informações Iniciais</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Veículo Inspecionado *</Label>
                            <Select value={formData.vehicle_id} onValueChange={handleVehicleChange} required>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Selecione o veículo">
                                        {currentVehicleObj
                                            ? `${currentVehicleObj.placa} - ${currentVehicleObj.marca} ${currentVehicleObj.modelo}`
                                            : undefined}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicles.map((v) => (
                                        <SelectItem key={v.id} value={v.id}>
                                            <span>{v.placa} - {v.marca} {v.modelo}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Motorista / Vistoriador</Label>
                            <Select value={formData.driver_id} onValueChange={(val) => setFormData({ ...formData, driver_id: val })}>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Selecione o condutor">
                                        {currentDriverObj?.nome_completo}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nenhum">Nenhum condutor vinculado</SelectItem>
                                    {drivers.map((d) => (
                                        <SelectItem key={d.id} value={d.id}>
                                            <span>{d.nome_completo}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="data" className="text-xs font-medium text-slate-700">
                                Data e Hora *
                            </Label>
                            <Input
                                id="data"
                                type="datetime-local"
                                value={formData.data}
                                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 text-xs"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="km" className="text-xs font-medium text-slate-700">
                                KM Odômetro *
                            </Label>
                            <Input
                                id="km"
                                type="number"
                                value={formData.km}
                                onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="combustivel_pct" className="text-xs font-medium text-slate-700">
                                Tanque Combustível (%)
                            </Label>
                            <Input
                                id="combustivel_pct"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="Ex: 100"
                                value={formData.combustivel_pct}
                                onChange={(e) => setFormData({ ...formData, combustivel_pct: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Vistoria de Componentes</h2>

                    <div className="space-y-3">
                        {CHECK_ITEMS.map((item) => (
                            <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 gap-2">
                                <span className="text-xs font-semibold text-slate-800">{item.label}</span>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, [item.key]: "ok" })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                                            formData[item.key] === "ok"
                                                ? "bg-emerald-600 text-white shadow-xs"
                                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                        }`}
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>OK</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, [item.key]: "atencao" })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                                            formData[item.key] === "atencao"
                                                ? "bg-amber-500 text-white shadow-xs"
                                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                        }`}
                                    >
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        <span>Atenção</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, [item.key]: "reprovado" })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                                            formData[item.key] === "reprovado"
                                                ? "bg-rose-600 text-white shadow-xs"
                                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                        }`}
                                    >
                                        <XCircle className="h-3.5 w-3.5" />
                                        <span>Defeito</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <Label htmlFor="avarias_observacoes" className="text-xs font-medium text-slate-700">
                            Avarias / Observações da Vistoria
                        </Label>
                        <Textarea
                            id="avarias_observacoes"
                            placeholder="Detalhamento de arranhões, amassados, peças quebradas ou irregularidades encontradas..."
                            value={formData.avarias_observacoes}
                            onChange={(e) => setFormData({ ...formData, avarias_observacoes: e.target.value })}
                            className="rounded-xl border-slate-200 text-xs min-h-[80px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Link
                        href="/checklists"
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
                                Finalizar Checklist
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
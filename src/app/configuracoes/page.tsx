"use client"

import { useState, useEffect } from "react"
import { useCompany } from "@/contexts/company-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Building2,
    Building,
    Save,
    Loader2,
    Plus,
    Bell,
    CheckCircle2,
} from "lucide-react"

// Função auxiliar para formatar CNPJ visualmente caso venha sem máscara do banco
function formatCNPJ(cnpj: string | null) {
    if (!cnpj) return "-"
    const clean = cnpj.replace(/\D/g, "")
    if (clean.length === 14) {
        return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
    }
    return cnpj
}

export default function ConfiguracoesPage() {
    const { companies, selectedCompany, setSelectedCompany } = useCompany()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [savingCompany, setSavingCompany] = useState(false)
    const [savingSettings, setSavingSettings] = useState(false)

    // Formulário da Empresa Selecionada
    const [companyForm, setCompanyForm] = useState({
        nome: "",
        cnpj: "",
        tipo_empresa: "outro" as "locadora" | "oficina" | "tecnologia" | "outro",
        status: true,
    })

    // Formulário de Nova Empresa
    const [showNewCompany, setShowNewCompany] = useState(false)
    const [newCompany, setNewCompany] = useState({
        nome: "",
        cnpj: "",
        tipo_empresa: "outro" as "locadora" | "oficina" | "tecnologia" | "outro",
    })

    // Configurações Globais
    const [settingsForm, setSettingsForm] = useState({
        dias_alerta_cnh: "30",
        dias_alerta_tacografo: "15",
        dias_alerta_documentos: "30",
        meta_kml_padrao: "3.5",
    })

    useEffect(() => {
        if (selectedCompany) {
            setCompanyForm({
                nome: (selectedCompany as any).nome || "",
                cnpj: (selectedCompany as any).cnpj || "",
                tipo_empresa: (selectedCompany as any).tipo_empresa || "outro",
                status: (selectedCompany as any).status ?? true,
            })
        }
    }, [selectedCompany])

    // Salvar Dados da Empresa Ativa
    const handleSaveCompany = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCompany) return

        setSavingCompany(true)
        try {
            const payload = {
                nome: companyForm.nome,
                cnpj: companyForm.cnpj,
                tipo_empresa: companyForm.tipo_empresa,
                status: companyForm.status,
            }

            const { error } = await supabase
                .from("companies")
                .update(payload)
                .eq("id", selectedCompany.id)

            if (error) throw error

            alert("Dados da empresa atualizados com sucesso!")
            window.location.reload()
        } catch (err: any) {
            console.error("Erro ao atualizar empresa:", err)
            alert(`Erro ao salvar: ${err.message}`)
        } finally {
            setSavingCompany(false)
        }
    }

    // Criar Nova Empresa no Grupo
    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCompany.nome || !newCompany.cnpj) {
            alert("Preencha o Nome e o CNPJ da empresa.")
            return
        }

        setLoading(true)
        try {
            const payload = {
                nome: newCompany.nome.trim(),
                cnpj: newCompany.cnpj.trim(),
                tipo_empresa: newCompany.tipo_empresa,
                status: true,
            }

            const { error } = await supabase
                .from("companies")
                .insert([payload])

            if (error) throw error

            alert("Nova empresa cadastrada com sucesso!")
            setNewCompany({ nome: "", cnpj: "", tipo_empresa: "outro" })
            setShowNewCompany(false)
            window.location.reload()
        } catch (err: any) {
            console.error("Erro ao criar empresa:", err)
            alert(`Erro ao criar empresa: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault()
        setSavingSettings(true)
        setTimeout(() => {
            localStorage.setItem("fleet_settings", JSON.stringify(settingsForm))
            setSavingSettings(false)
            alert("Parâmetros salvos com sucesso!")
        }, 400)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Configurações do Sistema
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Gerencie as empresas do grupo, dados cadastrais e parâmetros globais de alertas
                </p>
            </div>

            {/* 1. SEÇÃO: Empresas do Grupo Felinto */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-600" />
                            Empresas Cadastradas no Grupo
                        </h2>
                        <p className="text-[11px] text-slate-500">Alterne ou cadastre novas filiais e CNPJs gerenciados</p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => setShowNewCompany(!showNewCompany)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-3 text-xs font-medium gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Nova Empresa</span>
                    </Button>
                </div>

                {/* Form para cadastrar nova empresa */}
                {showNewCompany && (
                    <form onSubmit={handleCreateCompany} className="p-4 bg-slate-50 rounded-xl border border-blue-100 space-y-4">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cadastrar Nova Empresa / Filial</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[11px] font-medium text-slate-700">Nome / Razão Social *</Label>
                                <Input
                                    value={newCompany.nome}
                                    onChange={(e) => setNewCompany({ ...newCompany, nome: e.target.value })}
                                    placeholder="Ex: Felinto Transportes LTDA"
                                    className="h-9 text-xs rounded-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-medium text-slate-700">CNPJ *</Label>
                                <Input
                                    value={newCompany.cnpj}
                                    onChange={(e) => setNewCompany({ ...newCompany, cnpj: e.target.value })}
                                    placeholder="00.000.000/0000-00"
                                    className="h-9 text-xs rounded-lg font-mono"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-medium text-slate-700">Tipo de Empresa</Label>
                                <Select
                                    value={newCompany.tipo_empresa}
                                    onValueChange={(val: any) => setNewCompany({ ...newCompany, tipo_empresa: val })}
                                >
                                    <SelectTrigger className="h-9 text-xs rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="locadora">Locadora</SelectItem>
                                        <SelectItem value="oficina">Oficina</SelectItem>
                                        <SelectItem value="tecnologia">Tecnologia</SelectItem>
                                        <SelectItem value="outro">Outro / Transporte</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowNewCompany(false)}
                                className="h-8 rounded-lg text-xs"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-8 rounded-lg text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Salvar Empresa"}
                            </Button>
                        </div>
                    </form>
                )}

                {/* Tabela de Empresas */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="text-xs font-semibold text-slate-600">Empresa / Razão Social</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">CNPJ</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600">Tipo</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-600 text-right">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {companies.map((comp: any) => {
                                const isSelected = selectedCompany?.id === comp.id
                                const nameDisplay = comp.nome || "Empresa sem nome"

                                return (
                                    <TableRow key={comp.id} className={isSelected ? "bg-blue-50/50" : ""}>
                                        <TableCell className="text-xs font-bold text-slate-900">
                                            {nameDisplay}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono font-medium text-slate-700">
                                            {formatCNPJ(comp.cnpj)}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-600 capitalize">
                                            {comp.tipo_empresa || "Outro"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isSelected ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold gap-1">
                                                    <CheckCircle2 className="h-3 w-3 text-blue-600" />
                                                    Ativa
                                                </Badge>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setSelectedCompany(comp)}
                                                    className="h-7 rounded-lg text-xs border-slate-200 text-slate-600 hover:text-slate-900"
                                                >
                                                    Selecionar
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* 2. SEÇÃO: Edição da Empresa Ativa */}
            {selectedCompany && (
                <form onSubmit={handleSaveCompany} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            <Building className="h-4 w-4 text-blue-600" />
                            Editar Dados da Empresa Ativa ({(selectedCompany as any).nome})
                        </h2>
                        <p className="text-[11px] text-slate-500">Atualize informações cadastrais da empresa selecionada</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Nome / Razão Social *</Label>
                            <Input
                                value={companyForm.nome}
                                onChange={(e) => setCompanyForm({ ...companyForm, nome: e.target.value })}
                                className="h-10 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">CNPJ *</Label>
                            <Input
                                value={companyForm.cnpj}
                                onChange={(e) => setCompanyForm({ ...companyForm, cnpj: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 font-mono"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">Tipo de Empresa</Label>
                            <Select
                                value={companyForm.tipo_empresa}
                                onValueChange={(val: any) => setCompanyForm({ ...companyForm, tipo_empresa: val })}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="locadora">Locadora</SelectItem>
                                    <SelectItem value="oficina">Oficina</SelectItem>
                                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                                    <SelectItem value="outro">Outro / Transporte</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            disabled={savingCompany}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 px-6 rounded-xl font-medium shadow-sm"
                        >
                            {savingCompany ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Salvar Alterações da Empresa
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            )}

            {/* 3. SEÇÃO: Alertas & Regras Globais */}
            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-amber-600" />
                        Parâmetros de Alertas & Metas Globais
                    </h2>
                    <p className="text-[11px] text-slate-500">Defina os dias de antecedência para notificações de vencimento e metas de consumo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Alerta de CNH (Dias)</Label>
                        <Input
                            type="number"
                            value={settingsForm.dias_alerta_cnh}
                            onChange={(e) => setSettingsForm({ ...settingsForm, dias_alerta_cnh: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Alerta Tacógrafo (Dias)</Label>
                        <Input
                            type="number"
                            value={settingsForm.dias_alerta_tacografo}
                            onChange={(e) => setSettingsForm({ ...settingsForm, dias_alerta_tacografo: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Alerta Documentos / CRLV (Dias)</Label>
                        <Input
                            type="number"
                            value={settingsForm.dias_alerta_documentos}
                            onChange={(e) => setSettingsForm({ ...settingsForm, dias_alerta_documentos: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">Meta Padrão de Consumo (KM/L)</Label>
                        <Input
                            type="number"
                            step="0.1"
                            value={settingsForm.meta_kml_padrao}
                            onChange={(e) => setSettingsForm({ ...settingsForm, meta_kml_padrao: e.target.value })}
                            className="h-10 rounded-xl border-slate-200"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                    <Button
                        type="submit"
                        disabled={savingSettings}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 px-6 rounded-xl font-medium shadow-sm"
                    >
                        {savingSettings ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Salvar Parâmetros
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
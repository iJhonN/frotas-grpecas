"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"

export type Company = Database["public"]["Tables"]["companies"]["Row"]

// Objeto virtual representando a opção consolidada de todas as empresas
export const ALL_COMPANIES: Company = {
    id: "all",
    razao_social: "Todas as Empresas",
    nome_fantasia: "Visão Consolidada (Grupo GR)",
    cnpj: null,
    status: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
} as any

interface CompanyContextType {
    selectedCompany: Company | null
    companies: Company[]
    setSelectedCompany: (company: Company) => void
    isLoading: boolean
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
    const [companies, setCompanies] = useState<Company[]>([])
    const [selectedCompany, setSelectedCompanyState] = useState<Company | null>(ALL_COMPANIES)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchCompanies() {
            try {
                const { data, error } = await supabase
                    .from("companies")
                    .select("*")
                    .eq("status", true)
                    .order("razao_social")

                if (error) throw error

                const list = data || []
                // Inclui a opção "Todas as Empresas" no topo da lista
                const fullList = [ALL_COMPANIES, ...list]
                setCompanies(fullList)

                // Verifica se há alguma seleção prévia salva no localStorage
                const savedCompanyId = localStorage.getItem("selectedCompanyId")
                if (savedCompanyId) {
                    if (savedCompanyId === "all") {
                        setSelectedCompanyState(ALL_COMPANIES)
                    } else {
                        const found = list.find((c) => c.id === savedCompanyId)
                        if (found) setSelectedCompanyState(found)
                    }
                } else {
                    // Padrão: inicia exibindo "Todas as Empresas"
                    setSelectedCompanyState(ALL_COMPANIES)
                }
            } catch (err) {
                console.error("Erro ao carregar empresas:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCompanies()
    }, [])

    const setSelectedCompany = (company: Company) => {
        setSelectedCompanyState(company)
        localStorage.setItem("selectedCompanyId", company.id)
    }

    return (
        <CompanyContext.Provider
            value={{
                selectedCompany,
                companies,
                setSelectedCompany,
                isLoading,
            }}
        >
            {children}
        </CompanyContext.Provider>
    )
}

export function useCompany() {
    const context = useContext(CompanyContext)
    if (!context) {
        throw new Error("useCompany deve ser usado dentro de um CompanyProvider")
    }
    return context
}
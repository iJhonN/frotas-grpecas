"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"

type Company = Database["public"]["Tables"]["companies"]["Row"]

interface CompanyContextType {
    selectedCompany: Company | null
    companies: Company[]
    setSelectedCompany: (company: Company) => void
    isLoading: boolean
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
    const [companies, setCompanies] = useState<Company[]>([])
    const [selectedCompany, setSelectedCompanyState] = useState<Company | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchCompanies() {
            try {
                const { data, error } = await supabase
                    .from("companies")
                    .select("*")
                    .eq("status", true)

                if (error) throw error

                if (data && data.length > 0) {
                    setCompanies(data)
                    const savedCompanyId = localStorage.getItem("selectedCompanyId")
                    const found = data.find((c) => c.id === savedCompanyId)
                    setSelectedCompanyState(found || data[0])
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
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      budget_contract_vehicles: {
        Row: {
          budget_contract_id: string
          vehicle_id: string
        }
        Insert: {
          budget_contract_id: string
          vehicle_id: string
        }
        Update: {
          budget_contract_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_contract_vehicles_budget_contract_id_fkey"
            columns: ["budget_contract_id"]
            isOneToOne: false
            referencedRelation: "budget_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_contract_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_contract_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      budget_contracts: {
        Row: {
          aditivos_observacoes: string | null
          cliente_orgao: string
          combustivel_por_conta_de: Database["public"]["Enums"]["cost_accountability"]
          company_id: string
          created_at: string
          faturado_acumulado: number
          fim_vigencia: string
          id: string
          inicio_vigencia: string
          manutencao_por_conta_de: Database["public"]["Enums"]["cost_accountability"]
          motorista_por_conta_de: Database["public"]["Enums"]["cost_accountability"]
          numero_empenho: string
          objeto: string
          situacao_empenho: string
          updated_at: string
          valor_empenhado: number
        }
        Insert: {
          aditivos_observacoes?: string | null
          cliente_orgao: string
          combustivel_por_conta_de?: Database["public"]["Enums"]["cost_accountability"]
          company_id: string
          created_at?: string
          faturado_acumulado?: number
          fim_vigencia: string
          id?: string
          inicio_vigencia: string
          manutencao_por_conta_de?: Database["public"]["Enums"]["cost_accountability"]
          motorista_por_conta_de?: Database["public"]["Enums"]["cost_accountability"]
          numero_empenho: string
          objeto: string
          situacao_empenho?: string
          updated_at?: string
          valor_empenhado?: number
        }
        Update: {
          aditivos_observacoes?: string | null
          cliente_orgao?: string
          combustivel_por_conta_de?: Database["public"]["Enums"]["cost_accountability"]
          company_id?: string
          created_at?: string
          faturado_acumulado?: number
          fim_vigencia?: string
          id?: string
          inicio_vigencia?: string
          manutencao_por_conta_de?: Database["public"]["Enums"]["cost_accountability"]
          motorista_por_conta_de?: Database["public"]["Enums"]["cost_accountability"]
          numero_empenho?: string
          objeto?: string
          situacao_empenho?: string
          updated_at?: string
          valor_empenhado?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cnpj: string
          created_at: string
          id: string
          nome: string
          status: boolean
          tipo_empresa: Database["public"]["Enums"]["company_type"]
          updated_at: string
        }
        Insert: {
          cnpj: string
          created_at?: string
          id?: string
          nome: string
          status?: boolean
          tipo_empresa?: Database["public"]["Enums"]["company_type"]
          updated_at?: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          id?: string
          nome?: string
          status?: boolean
          tipo_empresa?: Database["public"]["Enums"]["company_type"]
          updated_at?: string
        }
        Relationships: []
      }
      cooperados: {
        Row: {
          cpf_cnpj: string
          created_at: string
          id: string
          nome: string
          observacoes: string | null
          pix_conta: string | null
          status: boolean
          taxa_administracao_pct: number
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf_cnpj: string
          created_at?: string
          id?: string
          nome: string
          observacoes?: string | null
          pix_conta?: string | null
          status?: boolean
          taxa_administracao_pct?: number
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf_cnpj?: string
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          pix_conta?: string | null
          status?: boolean
          taxa_administracao_pct?: number
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      driver_shifts: {
        Row: {
          company_id: string
          created_at: string
          data: string
          descanso_intervalo_h: number | null
          direcao_h: number | null
          driver_id: string
          espera_h: number | null
          fim_intervalo: string | null
          fim_jornada: string | null
          horas_extras: number | null
          horas_trabalhadas: number | null
          id: string
          inicio_intervalo: string | null
          inicio_jornada: string
          observacoes: string | null
          situacao: string | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          data?: string
          descanso_intervalo_h?: number | null
          direcao_h?: number | null
          driver_id: string
          espera_h?: number | null
          fim_intervalo?: string | null
          fim_jornada?: string | null
          horas_extras?: number | null
          horas_trabalhadas?: number | null
          id?: string
          inicio_intervalo?: string | null
          inicio_jornada: string
          observacoes?: string | null
          situacao?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          data?: string
          descanso_intervalo_h?: number | null
          direcao_h?: number | null
          driver_id?: string
          espera_h?: number | null
          fim_intervalo?: string | null
          fim_jornada?: string | null
          horas_extras?: number | null
          horas_trabalhadas?: number | null
          id?: string
          inicio_intervalo?: string | null
          inicio_jornada?: string
          observacoes?: string | null
          situacao?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_shifts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_shifts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_shifts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_shifts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      drivers: {
        Row: {
          categorias_cnh: string[]
          cidade: string | null
          cnh_numero: string
          cnh_validade: string
          company_id: string
          cpf: string
          created_at: string
          curso_transporte_passageiros_validade: string | null
          ear: boolean | null
          foto_cnh: string | null
          id: string
          id_motorista_legado: string | null
          nome_completo: string
          observacoes: string | null
          status: Database["public"]["Enums"]["driver_status"]
          telefone: string | null
          toxicologico_validade: string | null
          updated_at: string
          veiculo_atual_id: string | null
        }
        Insert: {
          categorias_cnh: string[]
          cidade?: string | null
          cnh_numero: string
          cnh_validade: string
          company_id: string
          cpf: string
          created_at?: string
          curso_transporte_passageiros_validade?: string | null
          ear?: boolean | null
          foto_cnh?: string | null
          id?: string
          id_motorista_legado?: string | null
          nome_completo: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          telefone?: string | null
          toxicologico_validade?: string | null
          updated_at?: string
          veiculo_atual_id?: string | null
        }
        Update: {
          categorias_cnh?: string[]
          cidade?: string | null
          cnh_numero?: string
          cnh_validade?: string
          company_id?: string
          cpf?: string
          created_at?: string
          curso_transporte_passageiros_validade?: string | null
          ear?: boolean | null
          foto_cnh?: string | null
          id?: string
          id_motorista_legado?: string | null
          nome_completo?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          telefone?: string | null
          toxicologico_validade?: string | null
          updated_at?: string
          veiculo_atual_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_veiculo_atual_id_fkey"
            columns: ["veiculo_atual_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_veiculo_atual_id_fkey"
            columns: ["veiculo_atual_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      fines: {
        Row: {
          codigo_descricao: string
          company_id: string
          created_at: string
          data_infracao: string
          driver_id_indicado: string | null
          gravidade: Database["public"]["Enums"]["fine_severity"]
          id: string
          local: string | null
          observacoes: string | null
          orgao: string
          pontos: number
          prazo_indicacao: string | null
          ref: string | null
          status: Database["public"]["Enums"]["fine_status"]
          updated_at: string
          valor: number
          vehicle_id: string
          vencimento_pagamento: string | null
        }
        Insert: {
          codigo_descricao: string
          company_id: string
          created_at?: string
          data_infracao: string
          driver_id_indicado?: string | null
          gravidade?: Database["public"]["Enums"]["fine_severity"]
          id?: string
          local?: string | null
          observacoes?: string | null
          orgao: string
          pontos?: number
          prazo_indicacao?: string | null
          ref?: string | null
          status?: Database["public"]["Enums"]["fine_status"]
          updated_at?: string
          valor: number
          vehicle_id: string
          vencimento_pagamento?: string | null
        }
        Update: {
          codigo_descricao?: string
          company_id?: string
          created_at?: string
          data_infracao?: string
          driver_id_indicado?: string | null
          gravidade?: Database["public"]["Enums"]["fine_severity"]
          id?: string
          local?: string | null
          observacoes?: string | null
          orgao?: string
          pontos?: number
          prazo_indicacao?: string | null
          ref?: string | null
          status?: Database["public"]["Enums"]["fine_status"]
          updated_at?: string
          valor?: number
          vehicle_id?: string
          vencimento_pagamento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fines_driver_id_indicado_fkey"
            columns: ["driver_id_indicado"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fines_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fines_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      fuel_reconciliations: {
        Row: {
          ano: number
          company_id: string
          created_at: string
          diferenca_litros: number | null
          diferenca_valor: number | null
          id: string
          litros_interno: number
          litros_posto: number
          mes: number
          updated_at: string
          valor_interno: number
          valor_posto: number
        }
        Insert: {
          ano: number
          company_id: string
          created_at?: string
          diferenca_litros?: number | null
          diferenca_valor?: number | null
          id?: string
          litros_interno?: number
          litros_posto?: number
          mes: number
          updated_at?: string
          valor_interno?: number
          valor_posto?: number
        }
        Update: {
          ano?: number
          company_id?: string
          created_at?: string
          diferenca_litros?: number | null
          diferenca_valor?: number | null
          id?: string
          litros_interno?: number
          litros_posto?: number
          mes?: number
          updated_at?: string
          valor_interno?: number
          valor_posto?: number
        }
        Relationships: [
          {
            foreignKeyName: "fuel_reconciliations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_records: {
        Row: {
          alerta: boolean | null
          combustivel: Database["public"]["Enums"]["fuel_type"]
          company_id: string
          consumo_kml: number | null
          created_at: string
          data: string
          driver_id: string | null
          evidencia_link: string | null
          fonte: string | null
          forma_pagamento: Database["public"]["Enums"]["payment_method"]
          id: string
          km_desde_ultimo: number | null
          km_odometro: number
          litros: number
          nota_fiscal_ref: string | null
          observacoes: string | null
          posto_fornecedor: string
          registro_data_hora: string | null
          updated_at: string
          validacao: boolean | null
          valor_por_litro: number
          valor_total: number
          vehicle_id: string
        }
        Insert: {
          alerta?: boolean | null
          combustivel: Database["public"]["Enums"]["fuel_type"]
          company_id: string
          consumo_kml?: number | null
          created_at?: string
          data?: string
          driver_id?: string | null
          evidencia_link?: string | null
          fonte?: string | null
          forma_pagamento?: Database["public"]["Enums"]["payment_method"]
          id?: string
          km_desde_ultimo?: number | null
          km_odometro: number
          litros: number
          nota_fiscal_ref?: string | null
          observacoes?: string | null
          posto_fornecedor: string
          registro_data_hora?: string | null
          updated_at?: string
          validacao?: boolean | null
          valor_por_litro: number
          valor_total: number
          vehicle_id: string
        }
        Update: {
          alerta?: boolean | null
          combustivel?: Database["public"]["Enums"]["fuel_type"]
          company_id?: string
          consumo_kml?: number | null
          created_at?: string
          data?: string
          driver_id?: string | null
          evidencia_link?: string | null
          fonte?: string | null
          forma_pagamento?: Database["public"]["Enums"]["payment_method"]
          id?: string
          km_desde_ultimo?: number | null
          km_odometro?: number
          litros?: number
          nota_fiscal_ref?: string | null
          observacoes?: string | null
          posto_fornecedor?: string
          registro_data_hora?: string | null
          updated_at?: string
          validacao?: boolean | null
          valor_por_litro?: number
          valor_total?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_records_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      incidents: {
        Row: {
          apolice_id: string | null
          company_id: string
          created_at: string
          culpabilidade: Database["public"]["Enums"]["incident_culpability"]
          custo_liquido: number | null
          custo_total: number
          data: string
          data_liberacao: string | null
          descricao_local: string | null
          dias_parado: number | null
          driver_id: string | null
          franquia: number | null
          gravidade: Database["public"]["Enums"]["incident_severity"]
          id: string
          numero_bo: string | null
          observacoes: string | null
          reembolso: number | null
          ref_financeiro: string | null
          status: string | null
          tem_seguro: boolean | null
          tipo: Database["public"]["Enums"]["incident_type"]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          apolice_id?: string | null
          company_id: string
          created_at?: string
          culpabilidade?: Database["public"]["Enums"]["incident_culpability"]
          custo_liquido?: number | null
          custo_total?: number
          data?: string
          data_liberacao?: string | null
          descricao_local?: string | null
          dias_parado?: number | null
          driver_id?: string | null
          franquia?: number | null
          gravidade?: Database["public"]["Enums"]["incident_severity"]
          id?: string
          numero_bo?: string | null
          observacoes?: string | null
          reembolso?: number | null
          ref_financeiro?: string | null
          status?: string | null
          tem_seguro?: boolean | null
          tipo?: Database["public"]["Enums"]["incident_type"]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          apolice_id?: string | null
          company_id?: string
          created_at?: string
          culpabilidade?: Database["public"]["Enums"]["incident_culpability"]
          custo_liquido?: number | null
          custo_total?: number
          data?: string
          data_liberacao?: string | null
          descricao_local?: string | null
          dias_parado?: number | null
          driver_id?: string | null
          franquia?: number | null
          gravidade?: Database["public"]["Enums"]["incident_severity"]
          id?: string
          numero_bo?: string | null
          observacoes?: string | null
          reembolso?: number | null
          ref_financeiro?: string | null
          status?: string | null
          tem_seguro?: boolean | null
          tipo?: Database["public"]["Enums"]["incident_type"]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_apolice_id_fkey"
            columns: ["apolice_id"]
            isOneToOne: false
            referencedRelation: "insurance_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      inspections: {
        Row: {
          arrefecimento: Database["public"]["Enums"]["item_check_status"]
          avarias_observacoes: string | null
          combustivel_entrega: number | null
          combustivel_pct: number | null
          company_id: string
          contrato_ref: string | null
          created_at: string
          data: string
          docs_a_bordo: Database["public"]["Enums"]["item_check_status"]
          driver_id: string | null
          freios: Database["public"]["Enums"]["item_check_status"]
          id: string
          interior: Database["public"]["Enums"]["item_check_status"]
          itens_obrigatorios: Database["public"]["Enums"]["item_check_status"]
          km: number
          km_na_entrega: number | null
          lataria_vidros: Database["public"]["Enums"]["item_check_status"]
          luzes_setas: Database["public"]["Enums"]["item_check_status"]
          oleo_fluidos: Database["public"]["Enums"]["item_check_status"]
          palhetas: Database["public"]["Enums"]["item_check_status"]
          pneus: Database["public"]["Enums"]["item_check_status"]
          reprovados_count: number | null
          resultado: string
          tipo: Database["public"]["Enums"]["inspection_type"]
          vehicle_id: string
        }
        Insert: {
          arrefecimento?: Database["public"]["Enums"]["item_check_status"]
          avarias_observacoes?: string | null
          combustivel_entrega?: number | null
          combustivel_pct?: number | null
          company_id: string
          contrato_ref?: string | null
          created_at?: string
          data?: string
          docs_a_bordo?: Database["public"]["Enums"]["item_check_status"]
          driver_id?: string | null
          freios?: Database["public"]["Enums"]["item_check_status"]
          id?: string
          interior?: Database["public"]["Enums"]["item_check_status"]
          itens_obrigatorios?: Database["public"]["Enums"]["item_check_status"]
          km: number
          km_na_entrega?: number | null
          lataria_vidros?: Database["public"]["Enums"]["item_check_status"]
          luzes_setas?: Database["public"]["Enums"]["item_check_status"]
          oleo_fluidos?: Database["public"]["Enums"]["item_check_status"]
          palhetas?: Database["public"]["Enums"]["item_check_status"]
          pneus?: Database["public"]["Enums"]["item_check_status"]
          reprovados_count?: number | null
          resultado?: string
          tipo?: Database["public"]["Enums"]["inspection_type"]
          vehicle_id: string
        }
        Update: {
          arrefecimento?: Database["public"]["Enums"]["item_check_status"]
          avarias_observacoes?: string | null
          combustivel_entrega?: number | null
          combustivel_pct?: number | null
          company_id?: string
          contrato_ref?: string | null
          created_at?: string
          data?: string
          docs_a_bordo?: Database["public"]["Enums"]["item_check_status"]
          driver_id?: string | null
          freios?: Database["public"]["Enums"]["item_check_status"]
          id?: string
          interior?: Database["public"]["Enums"]["item_check_status"]
          itens_obrigatorios?: Database["public"]["Enums"]["item_check_status"]
          km?: number
          km_na_entrega?: number | null
          lataria_vidros?: Database["public"]["Enums"]["item_check_status"]
          luzes_setas?: Database["public"]["Enums"]["item_check_status"]
          oleo_fluidos?: Database["public"]["Enums"]["item_check_status"]
          palhetas?: Database["public"]["Enums"]["item_check_status"]
          pneus?: Database["public"]["Enums"]["item_check_status"]
          reprovados_count?: number | null
          resultado?: string
          tipo?: Database["public"]["Enums"]["inspection_type"]
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      insurance_policies: {
        Row: {
          cobertura: string
          company_id: string
          created_at: string
          dias_para_fim: number | null
          fim_vigencia: string
          franquia: number
          id: string
          inicio: string
          leitura: string | null
          observacoes: string | null
          premio_anual: number
          recuperado: number | null
          seguradora: string
          sinistralidade_pct: number | null
          sinistros_acionados: number | null
          situacao: string | null
          updated_at: string
        }
        Insert: {
          cobertura: string
          company_id: string
          created_at?: string
          dias_para_fim?: number | null
          fim_vigencia: string
          franquia?: number
          id?: string
          inicio: string
          leitura?: string | null
          observacoes?: string | null
          premio_anual?: number
          recuperado?: number | null
          seguradora: string
          sinistralidade_pct?: number | null
          sinistros_acionados?: number | null
          situacao?: string | null
          updated_at?: string
        }
        Update: {
          cobertura?: string
          company_id?: string
          created_at?: string
          dias_para_fim?: number | null
          fim_vigencia?: string
          franquia?: number
          id?: string
          inicio?: string
          leitura?: string | null
          observacoes?: string | null
          premio_anual?: number
          recuperado?: number | null
          seguradora?: string
          sinistralidade_pct?: number | null
          sinistros_acionados?: number | null
          situacao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_policies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenances: {
        Row: {
          company_id: string
          created_at: string
          data: string
          descricao: string
          dias_parado: number | null
          fornecedor: string
          id: string
          km: number
          nota_fiscal: boolean | null
          numero_nf: string | null
          observacoes: string | null
          parte_relacionada: boolean
          proxima_revisao_data: string | null
          proxima_revisao_km: number | null
          ref_financeiro: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
          tipo: Database["public"]["Enums"]["maintenance_type"]
          updated_at: string
          valor_mao_obra: number
          valor_pecas: number
          valor_total: number | null
          vehicle_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          data?: string
          descricao: string
          dias_parado?: number | null
          fornecedor: string
          id?: string
          km: number
          nota_fiscal?: boolean | null
          numero_nf?: string | null
          observacoes?: string | null
          parte_relacionada?: boolean
          proxima_revisao_data?: string | null
          proxima_revisao_km?: number | null
          ref_financeiro?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          tipo?: Database["public"]["Enums"]["maintenance_type"]
          updated_at?: string
          valor_mao_obra?: number
          valor_pecas?: number
          valor_total?: number | null
          vehicle_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          data?: string
          descricao?: string
          dias_parado?: number | null
          fornecedor?: string
          id?: string
          km?: number
          nota_fiscal?: boolean | null
          numero_nf?: string | null
          observacoes?: string | null
          parte_relacionada?: boolean
          proxima_revisao_data?: string | null
          proxima_revisao_km?: number | null
          ref_financeiro?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          tipo?: Database["public"]["Enums"]["maintenance_type"]
          updated_at?: string
          valor_mao_obra?: number
          valor_pecas?: number
          valor_total?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenances_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenances_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      mileage_logs: {
        Row: {
          created_at: string
          data: string
          destino: string | null
          driver_id: string | null
          finalidade_contrato: string | null
          id: string
          km_fim: number
          km_inicio: number
          km_rodados: number | null
          observacoes: string | null
          origem: string | null
          tipo: Database["public"]["Enums"]["mileage_log_type"]
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          destino?: string | null
          driver_id?: string | null
          finalidade_contrato?: string | null
          id?: string
          km_fim: number
          km_inicio: number
          km_rodados?: number | null
          observacoes?: string | null
          origem?: string | null
          tipo?: Database["public"]["Enums"]["mileage_log_type"]
          vehicle_id: string
        }
        Update: {
          created_at?: string
          data?: string
          destino?: string | null
          driver_id?: string | null
          finalidade_contrato?: string | null
          id?: string
          km_fim?: number
          km_inicio?: number
          km_rodados?: number | null
          observacoes?: string | null
          origem?: string | null
          tipo?: Database["public"]["Enums"]["mileage_log_type"]
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mileage_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mileage_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mileage_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      monthly_closing: {
        Row: {
          abastecimento_valor: number
          ano: number
          company_id: string
          created_at: string
          custo_acumulado: number | null
          dias_parados: number
          documentos_valor: number
          id: string
          km: number
          litros: number
          manutencao_valor: number
          mes: number
          multas_valor: number
          receita_acumulada: number
          sinistros_valor: number
          vehicle_id: string
        }
        Insert: {
          abastecimento_valor?: number
          ano: number
          company_id: string
          created_at?: string
          custo_acumulado?: number | null
          dias_parados?: number
          documentos_valor?: number
          id?: string
          km?: number
          litros?: number
          manutencao_valor?: number
          mes: number
          multas_valor?: number
          receita_acumulada?: number
          sinistros_valor?: number
          vehicle_id: string
        }
        Update: {
          abastecimento_valor?: number
          ano?: number
          company_id?: string
          created_at?: string
          custo_acumulado?: number | null
          dias_parados?: number
          documentos_valor?: number
          id?: string
          km?: number
          litros?: number
          manutencao_valor?: number
          mes?: number
          multas_valor?: number
          receita_acumulada?: number
          sinistros_valor?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_closing_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_closing_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_closing_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      parameters: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string
          value?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          ajustes: number
          ano: number
          cooperado_id: string
          created_at: string
          data_pagamento: string | null
          desconto_custos: number
          id: string
          mes: number
          observacoes: string | null
          receita_do_mes: number
          ref_financeiro: string | null
          repasse_liquido: number | null
          retencoes: number
          status: string
          taxa_adm_pct: number
          taxa_adm_valor: number | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          ajustes?: number
          ano: number
          cooperado_id: string
          created_at?: string
          data_pagamento?: string | null
          desconto_custos?: number
          id?: string
          mes: number
          observacoes?: string | null
          receita_do_mes?: number
          ref_financeiro?: string | null
          repasse_liquido?: number | null
          retencoes?: number
          status?: string
          taxa_adm_pct?: number
          taxa_adm_valor?: number | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          ajustes?: number
          ano?: number
          cooperado_id?: string
          created_at?: string
          data_pagamento?: string | null
          desconto_custos?: number
          id?: string
          mes?: number
          observacoes?: string | null
          receita_do_mes?: number
          ref_financeiro?: string | null
          repasse_liquido?: number | null
          retencoes?: number
          status?: string
          taxa_adm_pct?: number
          taxa_adm_valor?: number | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_cooperado_id_fkey"
            columns: ["cooperado_id"]
            isOneToOne: false
            referencedRelation: "cooperados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      preventive_schedule: {
        Row: {
          id: string
          km_atual: number
          km_para_revisao: number | null
          observacao: string | null
          proxima_revisao_data: string | null
          proxima_revisao_km: number
          situacao: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          id?: string
          km_atual?: number
          km_para_revisao?: number | null
          observacao?: string | null
          proxima_revisao_data?: string | null
          proxima_revisao_km: number
          situacao?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          id?: string
          km_atual?: number
          km_para_revisao?: number | null
          observacao?: string | null
          proxima_revisao_data?: string | null
          proxima_revisao_km?: number
          situacao?: string | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preventive_schedule_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preventive_schedule_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      profile_companies: {
        Row: {
          company_id: string
          profile_id: string
        }
        Insert: {
          company_id: string
          profile_id: string
        }
        Update: {
          company_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_companies_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          acesso_total: boolean
          ativo: boolean
          cargo: Database["public"]["Enums"]["user_role"]
          created_at: string
          email: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          acesso_total?: boolean
          ativo?: boolean
          cargo?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          email: string
          id: string
          nome: string
          updated_at?: string
        }
        Update: {
          acesso_total?: boolean
          ativo?: boolean
          cargo?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          email?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      rental_contracts: {
        Row: {
          cliente_orgao: string
          created_at: string
          empenho_contrato_ref: string | null
          empresa_locadora_id: string
          faturado: boolean
          fim: string
          id: string
          inicio: string
          modalidade: Database["public"]["Enums"]["rental_modality"]
          observacoes: string | null
          quantidade: number
          recebido: boolean
          status: string
          updated_at: string
          valor_total: number | null
          valor_unitario: number
          vehicle_id: string
        }
        Insert: {
          cliente_orgao: string
          created_at?: string
          empenho_contrato_ref?: string | null
          empresa_locadora_id: string
          faturado?: boolean
          fim: string
          id?: string
          inicio: string
          modalidade?: Database["public"]["Enums"]["rental_modality"]
          observacoes?: string | null
          quantidade?: number
          recebido?: boolean
          status?: string
          updated_at?: string
          valor_total?: number | null
          valor_unitario?: number
          vehicle_id: string
        }
        Update: {
          cliente_orgao?: string
          created_at?: string
          empenho_contrato_ref?: string | null
          empresa_locadora_id?: string
          faturado?: boolean
          fim?: string
          id?: string
          inicio?: string
          modalidade?: Database["public"]["Enums"]["rental_modality"]
          observacoes?: string | null
          quantidade?: number
          recebido?: boolean
          status?: string
          updated_at?: string
          valor_total?: number | null
          valor_unitario?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_contracts_empresa_locadora_id_fkey"
            columns: ["empresa_locadora_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_contracts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_contracts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      route_coverages: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          dias: number | null
          id: string
          km_dia_rota: number | null
          km_extra_estimado: number | null
          litros_extras_estimado: number | null
          motivo: Database["public"]["Enums"]["coverage_reason"]
          observacoes: string | null
          route_id: string
          status: string | null
          updated_at: string
          veiculo_cobrindo_id: string
          veiculo_parado_id: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          dias?: number | null
          id?: string
          km_dia_rota?: number | null
          km_extra_estimado?: number | null
          litros_extras_estimado?: number | null
          motivo?: Database["public"]["Enums"]["coverage_reason"]
          observacoes?: string | null
          route_id: string
          status?: string | null
          updated_at?: string
          veiculo_cobrindo_id: string
          veiculo_parado_id: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          dias?: number | null
          id?: string
          km_dia_rota?: number | null
          km_extra_estimado?: number | null
          litros_extras_estimado?: number | null
          motivo?: Database["public"]["Enums"]["coverage_reason"]
          observacoes?: string | null
          route_id?: string
          status?: string | null
          updated_at?: string
          veiculo_cobrindo_id?: string
          veiculo_parado_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_coverages_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_coverages_veiculo_cobrindo_id_fkey"
            columns: ["veiculo_cobrindo_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_coverages_veiculo_cobrindo_id_fkey"
            columns: ["veiculo_cobrindo_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "route_coverages_veiculo_parado_id_fkey"
            columns: ["veiculo_parado_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_coverages_veiculo_parado_id_fkey"
            columns: ["veiculo_parado_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      route_stops: {
        Row: {
          created_at: string
          endereco: string | null
          id: string
          nome_ponto: string
          ordem: number
          route_id: string
        }
        Insert: {
          created_at?: string
          endereco?: string | null
          id?: string
          nome_ponto: string
          ordem: number
          route_id: string
        }
        Update: {
          created_at?: string
          endereco?: string | null
          id?: string
          nome_ponto?: string
          ordem?: number
          route_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string
          horarios: string | null
          id: string
          id_rota_legado: string | null
          itinerario_descricao: string
          km_dia: number
          motorista_id: string | null
          observacoes: string | null
          praca: string
          situacao_rota: string | null
          status_titular: string | null
          turno: Database["public"]["Enums"]["route_shift"]
          updated_at: string
          veiculo_titular_id: string | null
        }
        Insert: {
          created_at?: string
          horarios?: string | null
          id?: string
          id_rota_legado?: string | null
          itinerario_descricao: string
          km_dia?: number
          motorista_id?: string | null
          observacoes?: string | null
          praca: string
          situacao_rota?: string | null
          status_titular?: string | null
          turno?: Database["public"]["Enums"]["route_shift"]
          updated_at?: string
          veiculo_titular_id?: string | null
        }
        Update: {
          created_at?: string
          horarios?: string | null
          id?: string
          id_rota_legado?: string | null
          itinerario_descricao?: string
          km_dia?: number
          motorista_id?: string | null
          observacoes?: string | null
          praca?: string
          situacao_rota?: string | null
          status_titular?: string | null
          turno?: Database["public"]["Enums"]["route_shift"]
          updated_at?: string
          veiculo_titular_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_veiculo_titular_id_fkey"
            columns: ["veiculo_titular_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_veiculo_titular_id_fkey"
            columns: ["veiculo_titular_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      service_orders: {
        Row: {
          aprovador: string | null
          company_id: string
          created_at: string
          data_abertura: string
          data_decisao: string | null
          descricao_servico: string
          fornecedor_oficina: string
          id: string
          nota_fiscal: string | null
          observacoes: string | null
          orcamento_mao_obra: number
          orcamento_pecas: number
          orcamento_total: number | null
          parte_relacionada: boolean
          ref_manutencao_id: string | null
          solicitante: string
          status: Database["public"]["Enums"]["os_status"]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          aprovador?: string | null
          company_id: string
          created_at?: string
          data_abertura?: string
          data_decisao?: string | null
          descricao_servico: string
          fornecedor_oficina: string
          id?: string
          nota_fiscal?: string | null
          observacoes?: string | null
          orcamento_mao_obra?: number
          orcamento_pecas?: number
          orcamento_total?: number | null
          parte_relacionada?: boolean
          ref_manutencao_id?: string | null
          solicitante: string
          status?: Database["public"]["Enums"]["os_status"]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          aprovador?: string | null
          company_id?: string
          created_at?: string
          data_abertura?: string
          data_decisao?: string | null
          descricao_servico?: string
          fornecedor_oficina?: string
          id?: string
          nota_fiscal?: string | null
          observacoes?: string | null
          orcamento_mao_obra?: number
          orcamento_pecas?: number
          orcamento_total?: number | null
          parte_relacionada?: boolean
          ref_manutencao_id?: string | null
          solicitante?: string
          status?: Database["public"]["Enums"]["os_status"]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_os_maintenance"
            columns: ["ref_manutencao_id"]
            isOneToOne: false
            referencedRelation: "maintenances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      tires: {
        Row: {
          alerta: string | null
          created_at: string
          custo: number
          custo_por_km: number | null
          data_instalacao: string
          data_medicao: string
          id: string
          id_pneu_legado: string | null
          km_instalacao: number
          km_rodado: number
          marca_modelo: string
          medida: string
          observacoes: string | null
          posicao: Database["public"]["Enums"]["tire_position"]
          status: Database["public"]["Enums"]["tire_status"]
          sulco_mm: number
          updated_at: string
          vehicle_id: string | null
          vida: Database["public"]["Enums"]["tire_life"]
          vida_util_estimada_km: number
        }
        Insert: {
          alerta?: string | null
          created_at?: string
          custo?: number
          custo_por_km?: number | null
          data_instalacao?: string
          data_medicao?: string
          id?: string
          id_pneu_legado?: string | null
          km_instalacao?: number
          km_rodado?: number
          marca_modelo: string
          medida: string
          observacoes?: string | null
          posicao?: Database["public"]["Enums"]["tire_position"]
          status?: Database["public"]["Enums"]["tire_status"]
          sulco_mm?: number
          updated_at?: string
          vehicle_id?: string | null
          vida?: Database["public"]["Enums"]["tire_life"]
          vida_util_estimada_km?: number
        }
        Update: {
          alerta?: string | null
          created_at?: string
          custo?: number
          custo_por_km?: number | null
          data_instalacao?: string
          data_medicao?: string
          id?: string
          id_pneu_legado?: string | null
          km_instalacao?: number
          km_rodado?: number
          marca_modelo?: string
          medida?: string
          observacoes?: string | null
          posicao?: Database["public"]["Enums"]["tire_position"]
          status?: Database["public"]["Enums"]["tire_status"]
          sulco_mm?: number
          updated_at?: string
          vehicle_id?: string | null
          vida?: Database["public"]["Enums"]["tire_life"]
          vida_util_estimada_km?: number
        }
        Relationships: [
          {
            foreignKeyName: "tires_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tires_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      vehicle_documents: {
        Row: {
          company_id: string
          comprovante_ref: string | null
          created_at: string
          data_vencimento: string
          id: string
          observacoes: string | null
          ref_ano: number
          situacao: Database["public"]["Enums"]["doc_status"]
          tipo_documento: Database["public"]["Enums"]["doc_type"]
          updated_at: string
          valor: number | null
          vehicle_id: string
        }
        Insert: {
          company_id: string
          comprovante_ref?: string | null
          created_at?: string
          data_vencimento: string
          id?: string
          observacoes?: string | null
          ref_ano: number
          situacao?: Database["public"]["Enums"]["doc_status"]
          tipo_documento: Database["public"]["Enums"]["doc_type"]
          updated_at?: string
          valor?: number | null
          vehicle_id: string
        }
        Update: {
          company_id?: string
          comprovante_ref?: string | null
          created_at?: string
          data_vencimento?: string
          id?: string
          observacoes?: string | null
          ref_ano?: number
          situacao?: Database["public"]["Enums"]["doc_status"]
          tipo_documento?: Database["public"]["Enums"]["doc_type"]
          updated_at?: string
          valor?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      vehicle_photos: {
        Row: {
          altura_px: number | null
          angulo: Database["public"]["Enums"]["photo_angle"]
          arquivo_path: string
          created_at: string
          id: string
          largura_px: number | null
          tamanho_kb: number | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          altura_px?: number | null
          angulo: Database["public"]["Enums"]["photo_angle"]
          arquivo_path: string
          created_at?: string
          id?: string
          largura_px?: number | null
          tamanho_kb?: number | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          altura_px?: number | null
          angulo?: Database["public"]["Enums"]["photo_angle"]
          arquivo_path?: string
          created_at?: string
          id?: string
          largura_px?: number | null
          tamanho_kb?: number | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_photos_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_photos_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      vehicle_pricing_inputs: {
        Row: {
          created_at: string
          custo_capital_pct_mes: number
          financiamento_mes: number
          id: string
          margem_alvo_pct: number
          outros_fixos_mes: number
          prazo_recebimento_dias: number
          rastreador_mes: number
          seguro_mes: number
          updated_at: string
          valor_mercado_fipe: number
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          custo_capital_pct_mes?: number
          financiamento_mes?: number
          id?: string
          margem_alvo_pct?: number
          outros_fixos_mes?: number
          prazo_recebimento_dias?: number
          rastreador_mes?: number
          seguro_mes?: number
          updated_at?: string
          valor_mercado_fipe?: number
          vehicle_id: string
        }
        Update: {
          created_at?: string
          custo_capital_pct_mes?: number
          financiamento_mes?: number
          id?: string
          margem_alvo_pct?: number
          outros_fixos_mes?: number
          prazo_recebimento_dias?: number
          rastreador_mes?: number
          seguro_mes?: number
          updated_at?: string
          valor_mercado_fipe?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_pricing_inputs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: true
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_pricing_inputs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: true
            referencedRelation: "view_vehicle_costs"
            referencedColumns: ["vehicle_id"]
          },
        ]
      }
      vehicles: {
        Row: {
          ano_fabricacao: number
          ano_modelo: number
          capacidade_tanque_l: number | null
          categoria: Database["public"]["Enums"]["vehicle_category"]
          chassi: string | null
          checklist_diario_status: string | null
          combustivel: Database["public"]["Enums"]["fuel_type"]
          combustivel_conta_de: Database["public"]["Enums"]["cost_accountability"]
          company_id: string
          cooperado_id: string | null
          cor: string | null
          created_at: string
          data_aquisicao: string | null
          id: string
          id_rastreador: string | null
          id_veiculo_legado: string | null
          km_atual: number
          manutencao_conta_de: Database["public"]["Enums"]["cost_accountability"]
          marca: string
          meta_kml: number | null
          modelo: string
          observacoes: string | null
          placa: string
          praca_contrato: string | null
          proprietario_titular: string | null
          rastreador: boolean | null
          renavam: string | null
          rota_atual: string | null
          status: Database["public"]["Enums"]["vehicle_status"]
          ultimo_checklist_data: string | null
          updated_at: string
          valor_aquisicao: number | null
          vinculo: Database["public"]["Enums"]["vehicle_vinculo"]
        }
        Insert: {
          ano_fabricacao: number
          ano_modelo: number
          capacidade_tanque_l?: number | null
          categoria: Database["public"]["Enums"]["vehicle_category"]
          chassi?: string | null
          checklist_diario_status?: string | null
          combustivel: Database["public"]["Enums"]["fuel_type"]
          combustivel_conta_de?: Database["public"]["Enums"]["cost_accountability"]
          company_id: string
          cooperado_id?: string | null
          cor?: string | null
          created_at?: string
          data_aquisicao?: string | null
          id?: string
          id_rastreador?: string | null
          id_veiculo_legado?: string | null
          km_atual?: number
          manutencao_conta_de?: Database["public"]["Enums"]["cost_accountability"]
          marca: string
          meta_kml?: number | null
          modelo: string
          observacoes?: string | null
          placa: string
          praca_contrato?: string | null
          proprietario_titular?: string | null
          rastreador?: boolean | null
          renavam?: string | null
          rota_atual?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          ultimo_checklist_data?: string | null
          updated_at?: string
          valor_aquisicao?: number | null
          vinculo?: Database["public"]["Enums"]["vehicle_vinculo"]
        }
        Update: {
          ano_fabricacao?: number
          ano_modelo?: number
          capacidade_tanque_l?: number | null
          categoria?: Database["public"]["Enums"]["vehicle_category"]
          chassi?: string | null
          checklist_diario_status?: string | null
          combustivel?: Database["public"]["Enums"]["fuel_type"]
          combustivel_conta_de?: Database["public"]["Enums"]["cost_accountability"]
          company_id?: string
          cooperado_id?: string | null
          cor?: string | null
          created_at?: string
          data_aquisicao?: string | null
          id?: string
          id_rastreador?: string | null
          id_veiculo_legado?: string | null
          km_atual?: number
          manutencao_conta_de?: Database["public"]["Enums"]["cost_accountability"]
          marca?: string
          meta_kml?: number | null
          modelo?: string
          observacoes?: string | null
          placa?: string
          praca_contrato?: string | null
          proprietario_titular?: string | null
          rastreador?: boolean | null
          renavam?: string | null
          rota_atual?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          ultimo_checklist_data?: string | null
          updated_at?: string
          valor_aquisicao?: number | null
          vinculo?: Database["public"]["Enums"]["vehicle_vinculo"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_vehicles_cooperado"
            columns: ["cooperado_id"]
            isOneToOne: false
            referencedRelation: "cooperados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      view_vehicle_costs: {
        Row: {
          company_id: string | null
          custo_total: number | null
          margem_liquida: number | null
          modelo: string | null
          placa: string | null
          receita_total: number | null
          total_abastecimento: number | null
          total_documentos: number | null
          total_manutencao: number | null
          total_multas: number | null
          total_sinistros: number | null
          vehicle_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      company_type: "locadora" | "oficina" | "tecnologia" | "outro"
      cost_accountability: "nos" | "prefeitura" | "terceiro"
      coverage_reason:
        | "quebrado_manutencao"
        | "sinistro"
        | "documentacao"
        | "falta_motorista"
        | "outro"
      doc_status: "em_dia" | "a_vencer" | "vencido"
      doc_type:
        | "crlv_licenciamento"
        | "ipva"
        | "seguro"
        | "tacografo_afericao"
        | "vistoria"
        | "outro"
      driver_status: "ativo" | "inativo" | "afastado" | "ferias"
      fine_severity: "leve" | "media" | "grave" | "gravissima"
      fine_status: "pendente" | "indicada" | "paga" | "em_recurso" | "cancelada"
      fuel_type: "diesel_s10" | "diesel_s500" | "gasolina" | "etanol" | "flex"
      incident_culpability:
        | "motorista_proprio"
        | "terceiro"
        | "cliente"
        | "caso_fortuito"
      incident_severity: "leve" | "moderada" | "grave" | "perda_total"
      incident_type:
        | "colisao"
        | "abalroamento"
        | "capotamento"
        | "roubo_furto"
        | "incendio"
        | "outro"
      inspection_type:
        | "checklist_diario"
        | "entrega"
        | "devolucao"
        | "retorno_manutencao"
      item_check_status: "ok" | "reprovado" | "na"
      maintenance_status: "agendada" | "em_execucao" | "concluida" | "cancelada"
      maintenance_type:
        | "preventiva"
        | "corretiva"
        | "revisao"
        | "troca_pneu"
        | "funilaria_lataria"
      mileage_log_type:
        | "servico"
        | "entrega"
        | "devolucao"
        | "transferencia"
        | "deslocamento"
      os_status:
        | "aguardando_aprovacao"
        | "aprovada"
        | "recusada"
        | "em_execucao"
        | "concluida"
      payment_method: "dinheiro" | "pix" | "cartao" | "boleto" | "faturado"
      photo_angle: "frente" | "lado_esquerdo" | "lado_direito" | "traseira"
      rental_modality: "mensal" | "diaria" | "por_km" | "por_rota"
      route_shift: "manha" | "tarde" | "noite" | "manha_tarde"
      tire_life: "novo" | "recape_1" | "recape_2" | "recape_3" | "descartado"
      tire_position:
        | "dianteiro_esquerdo"
        | "dianteiro_direito"
        | "traseiro_esquerdo_ext"
        | "traseiro_esquerdo_int"
        | "traseiro_direito_ext"
        | "traseiro_direito_int"
        | "estepe"
        | "outros"
      tire_status: "em_uso" | "estoque" | "em_recapagem" | "descartado"
      user_role:
        | "admin_grupo"
        | "gestor"
        | "financeiro"
        | "motorista"
        | "oficina"
      vehicle_category:
        | "leve"
        | "pesado"
        | "utilitario"
        | "maquina"
        | "moto"
        | "onibus_urbano"
        | "onibus_rodoviario"
      vehicle_status:
        | "ativo_disponivel"
        | "locado"
        | "em_manutencao"
        | "parado"
        | "vendido"
      vehicle_vinculo: "proprio" | "familia" | "cooperado" | "terceirizado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      company_type: ["locadora", "oficina", "tecnologia", "outro"],
      cost_accountability: ["nos", "prefeitura", "terceiro"],
      coverage_reason: [
        "quebrado_manutencao",
        "sinistro",
        "documentacao",
        "falta_motorista",
        "outro",
      ],
      doc_status: ["em_dia", "a_vencer", "vencido"],
      doc_type: [
        "crlv_licenciamento",
        "ipva",
        "seguro",
        "tacografo_afericao",
        "vistoria",
        "outro",
      ],
      driver_status: ["ativo", "inativo", "afastado", "ferias"],
      fine_severity: ["leve", "media", "grave", "gravissima"],
      fine_status: ["pendente", "indicada", "paga", "em_recurso", "cancelada"],
      fuel_type: ["diesel_s10", "diesel_s500", "gasolina", "etanol", "flex"],
      incident_culpability: [
        "motorista_proprio",
        "terceiro",
        "cliente",
        "caso_fortuito",
      ],
      incident_severity: ["leve", "moderada", "grave", "perda_total"],
      incident_type: [
        "colisao",
        "abalroamento",
        "capotamento",
        "roubo_furto",
        "incendio",
        "outro",
      ],
      inspection_type: [
        "checklist_diario",
        "entrega",
        "devolucao",
        "retorno_manutencao",
      ],
      item_check_status: ["ok", "reprovado", "na"],
      maintenance_status: ["agendada", "em_execucao", "concluida", "cancelada"],
      maintenance_type: [
        "preventiva",
        "corretiva",
        "revisao",
        "troca_pneu",
        "funilaria_lataria",
      ],
      mileage_log_type: [
        "servico",
        "entrega",
        "devolucao",
        "transferencia",
        "deslocamento",
      ],
      os_status: [
        "aguardando_aprovacao",
        "aprovada",
        "recusada",
        "em_execucao",
        "concluida",
      ],
      payment_method: ["dinheiro", "pix", "cartao", "boleto", "faturado"],
      photo_angle: ["frente", "lado_esquerdo", "lado_direito", "traseira"],
      rental_modality: ["mensal", "diaria", "por_km", "por_rota"],
      route_shift: ["manha", "tarde", "noite", "manha_tarde"],
      tire_life: ["novo", "recape_1", "recape_2", "recape_3", "descartado"],
      tire_position: [
        "dianteiro_esquerdo",
        "dianteiro_direito",
        "traseiro_esquerdo_ext",
        "traseiro_esquerdo_int",
        "traseiro_direito_ext",
        "traseiro_direito_int",
        "estepe",
        "outros",
      ],
      tire_status: ["em_uso", "estoque", "em_recapagem", "descartado"],
      user_role: [
        "admin_grupo",
        "gestor",
        "financeiro",
        "motorista",
        "oficina",
      ],
      vehicle_category: [
        "leve",
        "pesado",
        "utilitario",
        "maquina",
        "moto",
        "onibus_urbano",
        "onibus_rodoviario",
      ],
      vehicle_status: [
        "ativo_disponivel",
        "locado",
        "em_manutencao",
        "parado",
        "vendido",
      ],
      vehicle_vinculo: ["proprio", "familia", "cooperado", "terceirizado"],
    },
  },
} as const

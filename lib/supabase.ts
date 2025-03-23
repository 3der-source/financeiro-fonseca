"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificação de segurança para garantir que as URLs são válidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Variáveis de ambiente do Supabase não configuradas")
}

// Cliente para componentes do lado do cliente
export const createClientComponentClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variáveis de ambiente do Supabase não configuradas")
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Cliente para uso direto - com verificação de segurança
export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Retornar um cliente mock que lança erro quando usado
    return {
      auth: {
        getSession: () => {
          throw new Error("Variáveis de ambiente do Supabase não configuradas")
        },
        signInWithPassword: () => {
          throw new Error("Variáveis de ambiente do Supabase não configuradas")
        },
      },
      from: () => {
        throw new Error("Variáveis de ambiente do Supabase não configuradas")
      },
      storage: {
        from: () => {
          throw new Error("Variáveis de ambiente do Supabase não configuradas")
        },
      },
    } as any
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
})()


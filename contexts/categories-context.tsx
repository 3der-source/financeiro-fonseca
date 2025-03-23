"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Category {
  id: string
  name: string
  color: string
  created_at: string
}

interface CategoriesContextType {
  categories: Category[]
  loading: boolean
  error: Error | null
  refreshCategories: () => Promise<void>
}

const CategoriesContext = createContext<CategoriesContextType>({
  categories: [],
  loading: false,
  error: null,
  refreshCategories: async () => {},
})

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true })

      if (error) throw error

      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao carregar categorias"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const refreshCategories = async () => {
    await fetchCategories()
  }

  return (
    <CategoriesContext.Provider value={{ categories, loading, error, refreshCategories }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export const useCategories = () => {
  const context = useContext(CategoriesContext)
  if (!context) {
    throw new Error("useCategories deve ser usado dentro de um CategoriesProvider")
  }
  return context
} 
"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { generateRandomColor } from "@/lib/utils"
import { toast } from "sonner"

export interface Category {
  id: string
  name: string
  color: string
  icon?: string
}

// Categorias padrão
const defaultCategories: Omit<Category, "id">[] = [
  { name: "Alimentação", color: "#FF8042" },
  { name: "Transporte", color: "#00C49F" },
  { name: "Moradia", color: "#0088FE" },
  { name: "Lazer", color: "#FFBB28" },
  { name: "Saúde", color: "#FF0000" },
  { name: "Educação", color: "#9C27B0" },
  { name: "Salário", color: "#4CAF50" },
  { name: "Investimentos", color: "#2196F3" },
  { name: "Outros", color: "#607D8B" },
]

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // Carregar categorias do banco de dados
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return

      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase.from("categories").select("*").eq("user_id", user.id).order("name")

        if (error) {
          throw error
        }

        if (data.length === 0) {
          // Se não houver categorias, criar as categorias padrão
          await createDefaultCategories()
        } else {
          setCategories(
            data.map((cat) => ({
              id: cat.id,
              name: cat.name,
              color: cat.color,
              icon: cat.icon || undefined,
            })),
          )
        }
      } catch (err: any) {
        console.error("Erro ao carregar categorias:", err)
        setError(err.message)
        toast.error("Erro ao carregar categorias", {
          description: err.message || "Não foi possível carregar suas categorias.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [user, supabase])

  // Criar categorias padrão para novos usuários
  const createDefaultCategories = async () => {
    if (!user) return

    try {
      const categoriesToInsert = defaultCategories.map((cat) => ({
        user_id: user.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
      }))

      const { data, error } = await supabase.from("categories").insert(categoriesToInsert).select()

      if (error) {
        throw error
      }

      if (data) {
        setCategories(
          data.map((cat) => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            icon: cat.icon || undefined,
          })),
        )
      }
    } catch (err: any) {
      console.error("Erro ao criar categorias padrão:", err)
      setError(err.message)
      toast.error("Erro ao criar categorias padrão", {
        description: err.message || "Não foi possível criar as categorias padrão.",
      })
    }
  }

  const addCategory = async (name: string) => {
    if (!user) return null

    try {
      const newCategory = {
        user_id: user.id,
        name,
        color: generateRandomColor(),
      }

      const { data, error } = await supabase.from("categories").insert(newCategory).select().single()

      if (error) {
        throw error
      }

      const addedCategory = {
        id: data.id,
        name: data.name,
        color: data.color,
        icon: data.icon || undefined,
      }

      setCategories((prev) => [...prev, addedCategory])

      toast.success("Categoria adicionada", {
        description: "Sua categoria foi adicionada com sucesso.",
      })

      return addedCategory
    } catch (err: any) {
      console.error("Erro ao adicionar categoria:", err)
      setError(err.message)
      toast.error("Erro ao adicionar categoria", {
        description: err.message || "Não foi possível adicionar sua categoria.",
      })
      return null
    }
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: updates.name,
          color: updates.color,
          icon: updates.icon,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        throw error
      }

      setCategories((prev) => prev.map((category) => (category.id === id ? { ...category, ...updates } : category)))

      toast.success("Categoria atualizada", {
        description: "Sua categoria foi atualizada com sucesso.",
      })

      return true
    } catch (err: any) {
      console.error("Erro ao atualizar categoria:", err)
      setError(err.message)
      toast.error("Erro ao atualizar categoria", {
        description: err.message || "Não foi possível atualizar sua categoria.",
      })
      return false
    }
  }

  const deleteCategory = async (id: string) => {
    if (!user) return false

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        throw error
      }

      setCategories((prev) => prev.filter((category) => category.id !== id))

      toast.success("Categoria excluída", {
        description: "Sua categoria foi excluída com sucesso.",
      })

      return true
    } catch (err: any) {
      console.error("Erro ao excluir categoria:", err)
      setError(err.message)
      toast.error("Erro ao excluir categoria", {
        description: err.message || "Não foi possível excluir sua categoria.",
      })
      return false
    }
  }

  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id) || { id: "outros", name: "Outros", color: "#607D8B" }
  }

  return {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  }
}


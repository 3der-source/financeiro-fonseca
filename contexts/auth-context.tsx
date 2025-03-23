"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"
import { toast } from "sonner"

interface AuthContextProps {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<{ error: any }>
  uploadAvatar: (file: File) => Promise<{ error: any; url?: string }>
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Criar uma única instância do cliente Supabase
  const supabase = useMemo(() => createClientComponentClient(), [])

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Erro ao obter sessão:", error)
          return
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error("Erro ao obter sessão:", err)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session?.user?.email)
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)

        // Se houver uma sessão e estivermos na página de login, redirecione para o dashboard
        if (session && window.location.pathname === "/login") {
          router.push("/dashboard")
        }
        // Se não houver sessão e não estivermos em uma página pública, redirecione para o login
        else if (!session && !window.location.pathname.match(/^\/(login|register|forgot-password|reset-password)/)) {
          router.push("/login")
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true)
      console.log("Iniciando processo de registro para:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Erro no registro:", error)
        throw error
      }

      if (data?.user) {
        // Tentar criar as categorias padrão, mas não bloquear o fluxo se falhar
        try {
          await createDefaultCategories(data.user.id)
        } catch (err) {
          console.error("Erro ao criar categorias padrão:", err)
        }

        toast.success("Conta criada com sucesso!", {
          description: "Um email de confirmação foi enviado. Por favor, verifique sua caixa de entrada e confirme seu email antes de fazer login.",
          duration: 6000,
        })

        // Redirecionar para login após um delay maior para dar tempo de ler a mensagem
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }

      return { data, error: null }
    } catch (error: any) {
      console.error("Erro ao criar conta:", error)
      
      let errorMessage = error.message
      if (error.message?.includes("already registered")) {
        errorMessage = "Este email já está registrado. Por favor, use outro email ou faça login."
      }

      toast.error("Erro ao criar conta", {
        description: errorMessage,
      })

      return { data: null, error }
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      console.log("Tentando fazer login com:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Erro de login:", error)
        throw error
      }

      if (data.user) {
        console.log("Login bem-sucedido para:", data.user.email)
        
        if (!data.user.email_confirmed_at) {
          toast.error("Email não confirmado", {
            description: "Por favor, confirme seu email antes de fazer login.",
          })
          return { error: new Error("Email não confirmado") }
        }

        toast.success("Login realizado com sucesso", {
          description: `Bem-vindo de volta, ${data.user.email}!`,
        })

        router.push("/dashboard")
      }

      return { error: null }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error)

      let errorMessage = "Verifique suas credenciais e tente novamente."

      if (error.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou senha incorretos."
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Por favor, confirme seu email antes de fazer login."
        } else {
          errorMessage = error.message
        }
      }

      toast.error("Erro ao fazer login", {
        description: errorMessage,
      })

      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  const createDefaultCategories = async (userId: string) => {
    const defaultCategories = [
      { name: "Alimentação", color: "#FF8042", type: "expense" },
      { name: "Transporte", color: "#00C49F", type: "expense" },
      { name: "Moradia", color: "#0088FE", type: "expense" },
      { name: "Lazer", color: "#FFBB28", type: "expense" },
      { name: "Saúde", color: "#FF0000", type: "expense" },
      { name: "Educação", color: "#9C27B0", type: "expense" },
      { name: "Salário", color: "#4CAF50", type: "income" },
      { name: "Investimentos", color: "#2196F3", type: "income" },
      { name: "Outros", color: "#607D8B", type: "expense" },
    ]

    try {
      console.log("Criando categorias padrão para:", userId)
      
      // Aguardar um momento para garantir que a autenticação está completa
      await new Promise(resolve => setTimeout(resolve, 1000))

      const categoriesToInsert = defaultCategories.map((cat) => ({
        user_id: userId,
        name: cat.name,
        color: cat.color,
        type: cat.type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { error } = await supabase.from("categories").insert(categoriesToInsert)

      if (error) {
        console.error("Erro ao criar categorias padrão:", error)
        // Não vamos lançar o erro para não interromper o fluxo de registro
        toast.error("Não foi possível criar as categorias padrão", {
          description: "Você pode criar suas categorias manualmente mais tarde."
        })
      } else {
        console.log("Categorias padrão criadas com sucesso")
      }
    } catch (err) {
      console.error("Erro ao criar categorias padrão:", err)
      // Não vamos lançar o erro para não interromper o fluxo de registro
      toast.error("Não foi possível criar as categorias padrão", {
        description: "Você pode criar suas categorias manualmente mais tarde."
      })
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Logout realizado com sucesso")
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast.error("Erro ao fazer logout")
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      toast.success("Email enviado", {
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      })

      return { error: null }
    } catch (error: any) {
      console.error("Erro ao enviar email de redefinição:", error)

      toast.error("Erro ao enviar email", {
        description: error.message || "Não foi possível enviar o email de redefinição de senha.",
      })

      return { error }
    }
  }

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      if (!user) throw new Error("Usuário não autenticado")

      // Atualizar metadados do usuário
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: updates.full_name,
          avatar_url: updates.avatar_url,
        },
      })

      if (authError) throw authError

      // Atualizar tabela de perfis
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: updates.full_name,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      toast.success("Perfil atualizado", {
        description: "Suas informações foram atualizadas com sucesso.",
      })

      return { error: null }
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error)

      toast.error("Erro ao atualizar perfil", {
        description: error.message || "Não foi possível atualizar seu perfil.",
      })

      return { error }
    }
  }

  const uploadAvatar = async (file: File) => {
    try {
      if (!user) throw new Error("Usuário não autenticado")

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload do arquivo para o Storage
      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file)

      if (uploadError) throw uploadError

      // Obter URL pública do arquivo
      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath)

      const avatarUrl = data.publicUrl

      // Atualizar perfil com a nova URL
      await updateProfile({ avatar_url: avatarUrl })

      return { error: null, url: avatarUrl }
    } catch (error: any) {
      console.error("Erro ao fazer upload da imagem:", error)

      toast.error("Erro ao fazer upload da imagem", {
        description: error.message || "Não foi possível fazer o upload da imagem.",
      })

      return { error, url: undefined }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    uploadAvatar,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


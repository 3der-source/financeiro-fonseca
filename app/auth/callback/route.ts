import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const error = requestUrl.searchParams.get("error")
    const error_description = requestUrl.searchParams.get("error_description")

    // Se houver erro, redirecionar para a página de erro
    if (error || error_description) {
      console.error("Erro na autenticação:", error, error_description)
      return NextResponse.redirect(new URL("/auth/error", request.url))
    }

    if (code) {
      const cookieStore = cookies()
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Variáveis de ambiente do Supabase não configuradas")
        return NextResponse.redirect(new URL("/auth/error", request.url))
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
        },
        global: {
          headers: {
            cookie: cookieStore.toString(),
          },
        },
      })

      try {
        console.log("Trocando código por sessão:", code)
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error("Erro ao trocar código por sessão:", error)
          return NextResponse.redirect(new URL("/auth/error", request.url))
        }

        console.log("Troca de código bem-sucedida, usuário:", data?.user?.email)
      } catch (error) {
        console.error("Exceção ao trocar código por sessão:", error)
        return NextResponse.redirect(new URL("/auth/error", request.url))
      }
    }

    // URL para redirecionar após a autenticação
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Erro na rota de callback:", error)
    // Em caso de erro, redirecionar para a página de erro
    return NextResponse.redirect(new URL("/auth/error", request.url))
  }
}


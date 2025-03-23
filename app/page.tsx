import { createServerComponentClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function HomePage() {
  const supabase = await createServerComponentClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("Erro ao verificar sessão:", sessionError)
  }

  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}


import { createServerComponentClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Dashboard from "@/components/dashboard"

export default async function DashboardPage() {
  const supabase = await createServerComponentClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("Erro ao verificar sessão:", sessionError)
  }

  if (!session) {
    redirect("/login")
  }

  return <Dashboard />
} 
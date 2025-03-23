import { RegisterForm } from "@/components/register-form"
import { Logo } from "@/components/logo"
import { createServerComponentClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function RegisterPage() {
  const supabase = await createServerComponentClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("Erro ao verificar sessão:", sessionError)
  }

  // If session exists, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-background p-8 shadow-lg">
        <div className="flex flex-col items-center space-y-2">
          <Logo className="h-12 w-12" />
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-center text-muted-foreground">
            Preencha os dados abaixo para criar sua conta
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}


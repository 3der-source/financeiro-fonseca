import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { Logo } from "@/components/logo"
import { createServerComponentClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function ForgotPasswordPage() {
  const supabase = createServerComponentClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <div className="w-full max-w-md p-8 space-y-8 bg-background rounded-lg shadow-lg">
        <div className="flex flex-col items-center space-y-2">
          <Logo className="h-12 w-12" />
          <h1 className="text-2xl font-bold">Recuperar senha</h1>
          <p className="text-muted-foreground text-center">
            Digite seu email para receber um link de recuperação de senha
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}


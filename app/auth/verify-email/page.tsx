import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { MailCheck } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">Verifique seu email</CardTitle>
          <CardDescription>Enviamos um link de confirmação para o seu email</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-primary/10 p-6">
            <MailCheck className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <p>Por favor, verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.</p>
            <p className="text-sm text-muted-foreground">
              Se você não recebeu o email, verifique sua pasta de spam ou tente novamente.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/login">Voltar para o login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}


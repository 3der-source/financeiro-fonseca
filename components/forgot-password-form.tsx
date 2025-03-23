"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { z } from "zod"

// Schema de validação
const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { resetPassword } = useAuth()

  const validateEmail = (value: string) => {
    try {
      forgotPasswordSchema.shape.email.parse(value)
      setErrors((prev) => ({ ...prev, email: "" }))
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors[0]?.message || "Email inválido"
        setErrors((prev) => ({ ...prev, email: message }))
        return false
      }
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    validateEmail(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)

    if (!validateEmail(email)) return

    setIsLoading(true)

    try {
      const { error } = await resetPassword(email)
      if (error) {
        setGeneralError(error.message || "Erro ao enviar email de recuperação")
      } else {
        setIsSubmitted(true)
      }
    } catch (err: any) {
      setGeneralError(err.message || "Ocorreu um erro ao enviar o email. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            Email enviado com sucesso! Verifique sua caixa de entrada para redefinir sua senha.
          </AlertDescription>
        </Alert>

        <Button asChild className="w-full">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o login
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={handleChange}
          className={errors.email ? "border-red-500" : ""}
          required
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar link de recuperação"
        )}
      </Button>

      <div className="text-center text-sm">
        <Link href="/login" className="font-medium text-primary hover:underline">
          <ArrowLeft className="inline-block mr-1 h-3 w-3" />
          Voltar para o login
        </Link>
      </div>
    </form>
  )
}


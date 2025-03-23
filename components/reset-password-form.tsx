"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { z } from "zod"
import { toast } from "sonner"

// Schema de validação
const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const validateField = (field: keyof ResetPasswordFormData, value: string) => {
    try {
      if (field === "confirmPassword") {
        if (value !== formData.password) {
          setErrors((prev) => ({ ...prev, confirmPassword: "As senhas não coincidem" }))
          return false
        } else {
          setErrors((prev) => ({ ...prev, confirmPassword: "" }))
          return true
        }
      }

      const fieldSchema = resetPasswordSchema.shape[field]
      fieldSchema.parse(value)
      setErrors((prev) => ({ ...prev, [field]: "" }))
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors[0]?.message || `Campo ${field} inválido`
        setErrors((prev) => ({ ...prev, [field]: message }))
        return false
      }
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "confirmPassword") {
      validateField("confirmPassword", value)
    } else if (name === "password" && formData.confirmPassword) {
      // Revalidar confirmPassword quando password mudar
      validateField("confirmPassword", formData.confirmPassword)
    } else {
      validateField(name as keyof ResetPasswordFormData, value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)

    // Validar todos os campos
    let isValid = true
    Object.entries(formData).forEach(([field, value]) => {
      if (!validateField(field as keyof ResetPasswordFormData, value)) {
        isValid = false
      }
    })

    if (!isValid) return

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (error) {
        throw error
      }

      toast.success("Senha redefinida com sucesso", {
        description: "Você pode fazer login com sua nova senha.",
      })

      // Redirecionar para a página de login
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (err: any) {
      console.error("Erro ao redefinir senha:", err)
      setGeneralError(err.message || "Ocorreu um erro ao redefinir sua senha. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
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
        <Label htmlFor="password">Nova senha (mínimo 6 caracteres)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? "border-red-500" : ""}
          required
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={errors.confirmPassword ? "border-red-500" : ""}
          required
        />
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redefinindo senha...
          </>
        ) : (
          "Redefinir senha"
        )}
      </Button>
    </form>
  )
}


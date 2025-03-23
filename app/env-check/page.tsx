"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle } from "lucide-react"

export default function EnvCheckPage() {
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null)
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string | null>(null)

  useEffect(() => {
    // Verificar variáveis de ambiente
    setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || null)
    setSupabaseAnonKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null)
  }, [])

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Verificação de Ambiente</CardTitle>
          <CardDescription>Verificando se as variáveis de ambiente necessárias estão configuradas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={supabaseUrl ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {supabaseUrl ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <AlertTitle>NEXT_PUBLIC_SUPABASE_URL</AlertTitle>
            </div>
            <AlertDescription>
              {supabaseUrl
                ? `Configurado: ${supabaseUrl.substring(0, 10)}...`
                : "Não configurado. Adicione esta variável ao seu arquivo .env.local"}
            </AlertDescription>
          </Alert>

          <Alert variant={supabaseAnonKey ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {supabaseAnonKey ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <AlertTitle>NEXT_PUBLIC_SUPABASE_ANON_KEY</AlertTitle>
            </div>
            <AlertDescription>
              {supabaseAnonKey
                ? `Configurado: ${supabaseAnonKey.substring(0, 10)}...`
                : "Não configurado. Adicione esta variável ao seu arquivo .env.local"}
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground mt-4">
            <p>Para configurar estas variáveis:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>
                Crie um arquivo <code>.env.local</code> na raiz do projeto
              </li>
              <li>Adicione as variáveis acima com seus valores do Supabase</li>
              <li>Reinicie o servidor de desenvolvimento</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


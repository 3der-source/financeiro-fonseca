"use client"

import { useState } from "react"
import { createClientComponentClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestConnectionPage() {
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult("")
    setError("")

    try {
      const supabase = createClientComponentClient()
      console.log("Cliente Supabase criado")

      // Teste simples - buscar a versão do Postgres
      const { data, error } = await supabase.rpc("version")

      if (error) {
        throw error
      }

      setResult(JSON.stringify(data, null, 2))
    } catch (err: any) {
      console.error("Erro ao testar conexão:", err)
      setError(err.message || "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Conexão Supabase</CardTitle>
          <CardDescription>Verifica se a conexão com o Supabase está funcionando</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={loading}>
            {loading ? "Testando..." : "Testar Conexão"}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-green-600">Conexão bem-sucedida!</h3>
              <pre className="mt-2 rounded bg-gray-100 p-2 text-sm overflow-auto">{result}</pre>
            </div>
          )}

          {error && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-red-600">Erro de conexão</h3>
              <pre className="mt-2 rounded bg-red-50 p-2 text-sm text-red-800 overflow-auto">{error}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Esta página testa a conexão com o Supabase usando as variáveis de ambiente configuradas.
        </CardFooter>
      </Card>
    </div>
  )
}


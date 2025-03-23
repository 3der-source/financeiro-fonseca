"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { CategoriesProvider } from "@/contexts/categories-context"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <CategoriesProvider>
          {children}
        </CategoriesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
} 
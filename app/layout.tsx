import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import { CategoriesProvider } from "@/contexts/categories-context"
import { ThemeProvider } from "@/components/ui/use-theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Finanças Pessoais",
  description: "Gerencie suas finanças pessoais de forma simples e eficiente.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CategoriesProvider>
            <Providers>{children}</Providers>
          </CategoriesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
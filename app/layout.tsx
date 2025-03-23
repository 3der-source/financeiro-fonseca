import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

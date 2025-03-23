import { cn } from "@/lib/utils"
import { Wallet } from "lucide-react"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Wallet className="h-6 w-6" />
    </div>
  )
}


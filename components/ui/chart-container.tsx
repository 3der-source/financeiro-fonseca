import { cn } from "@/lib/utils"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ChartContainer({ children, className, ...props }: ChartContainerProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  )
} 
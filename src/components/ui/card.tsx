import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white text-gray-950 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

const CardHeader = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
}

const CardTitle = ({ className, ...props }: CardProps) => {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

const CardDescription = ({ className, ...props }: CardProps) => {
  return (
    <p
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  )
}

const CardContent = ({ className, ...props }: CardProps) => {
  return (
    <div className={cn("p-6 pt-0", className)} {...props} />
  )
}

const CardFooter = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

import * as React from "react"

import { cn } from "@/utils/style/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  theme?: "light" | "dark"
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, theme = "dark", error = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // Dark theme (default)
          theme === "dark" && [
            "border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring",
            error && "border-destructive focus-visible:ring-destructive"
          ],
          // Light theme
          theme === "light" && [
            "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-orange-500 focus-visible:border-orange-500",
            error && "border-red-400 focus-visible:ring-red-500 focus-visible:border-red-500"
          ],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

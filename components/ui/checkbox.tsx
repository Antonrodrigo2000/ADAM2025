"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/utils/style/utils"

export interface CheckboxProps extends 
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  theme?: "light" | "dark"
  error?: boolean
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, theme = "dark", error = false, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      // Dark theme (default)
      theme === "dark" && [
        "border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:ring-ring",
        error && "border-destructive data-[state=checked]:bg-destructive"
      ],
      // Light theme
      theme === "light" && [
        "border-gray-300 bg-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 data-[state=checked]:text-white focus-visible:ring-orange-500",
        error && "border-red-400 data-[state=checked]:bg-red-500"
      ],
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

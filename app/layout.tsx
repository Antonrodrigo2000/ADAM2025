import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk, MuseoModerno } from "next/font/google"
import "./globals.css"
import { cn } from "@/utils/style/utils"
import { AppProviders } from "@/contexts"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
})

const museoModerno = MuseoModerno({
  subsets: ["latin"],
  weight: ["800"], // ExtraBold
  variable: "--font-museo-moderno",
})

export const metadata: Metadata = {
  title: "Adam - Men's Telehealth",
  description: "Modern telehealth for men. Hair loss, skincare, and sexual health.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={cn("bg-white text-gray-900 font-sans", inter.variable, spaceGrotesk.variable, museoModerno.variable)}
      >
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  )
}

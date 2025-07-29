"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header({ darkText = false }: { darkText?: boolean }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const textColor = darkText ? "text-black" : "text-white"
  const hoverColor = darkText ? "hover:text-primary" : "hover:text-primary"

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-colors duration-300",
        scrolled ? (darkText ? "bg-white/80 backdrop-blur-sm" : "bg-black/80 backdrop-blur-sm") : "bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className={cn("text-2xl font-extrabold font-logo tracking-tighter uppercase", textColor)}>
          ADAM
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/products/minoxidil-5" className={cn("transition-colors", textColor, hoverColor)}>
            Hair Loss
          </Link>
          <Link href="#skin" className={cn("transition-colors", textColor, hoverColor)}>
            Skincare
          </Link>
          <Link href="#sexual-health" className={cn("transition-colors", textColor, hoverColor)}>
            Sexual Health
          </Link>
        </nav>
        <Button
          asChild
          variant="ghost"
          className={cn("rounded-full", darkText ? "text-black hover:text-primary" : "text-white hover:text-primary")}
        >
          <Link href="/auth">Get Started</Link>
        </Button>
      </div>
    </header>
  )
}

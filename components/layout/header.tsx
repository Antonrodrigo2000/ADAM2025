"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-colors duration-300",
        scrolled ? "bg-black/80 backdrop-blur-sm" : "bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="#" className="text-2xl font-bold font-display tracking-tighter">
          Adam
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="#hair" className="hover:text-primary transition-colors">
            Hair Loss
          </Link>
          <Link href="#skin" className="hover:text-primary transition-colors">
            Skincare
          </Link>
          <Link href="#sexual-health" className="hover:text-primary transition-colors">
            Sexual Health
          </Link>
        </nav>
        <Button variant="ghost" className="rounded-full">
          Get Started
        </Button>
      </div>
    </header>
  )
}

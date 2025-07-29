"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface HeaderProps {
  textColor?: string
}

export default function Header({ textColor = "text-white" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className={`text-xl font-bold ${textColor}`}>ADAM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/hair-loss" className={`${textColor} hover:text-orange-300 transition-colors`}>
              Hair Loss
            </Link>
            <Link href="/skincare" className={`${textColor} hover:text-orange-300 transition-colors`}>
              Skincare
            </Link>
            <Link href="/sexual-health" className={`${textColor} hover:text-orange-300 transition-colors`}>
              Sexual Health
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-colors">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className={`md:hidden ${textColor}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="flex flex-col space-y-4">
              <Link href="/hair-loss" className={`${textColor} hover:text-orange-300 transition-colors`}>
                Hair Loss
              </Link>
              <Link href="/skincare" className={`${textColor} hover:text-orange-300 transition-colors`}>
                Skincare
              </Link>
              <Link href="/sexual-health" className={`${textColor} hover:text-orange-300 transition-colors`}>
                Sexual Health
              </Link>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-colors w-fit">
                Get Started
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

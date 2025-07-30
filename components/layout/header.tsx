"use client"

import { useState } from "react"
import Link from "next/link"

interface HeaderProps {
  variant?: "default" | "dark" | "light"
}

export function Header({ variant = "default" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getHeaderClasses = () => {
    switch (variant) {
      case "dark":
        return "bg-white text-black border-gray-200"
      case "light":
        return "bg-gray-100 text-gray-900 border-gray-300"
      default:
        return "bg-white/95 backdrop-blur-sm text-gray-900 border-gray-200"
    }
  }

  const getLinkClasses = () => {
    switch (variant) {
      case "dark":
        return "text-black hover:text-blue-600"
      case "light":
        return "text-gray-900 hover:text-blue-600"
      default:
        return "text-gray-900 hover:text-blue-600"
    }
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b ${getHeaderClasses()}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-extrabold font-logo tracking-tighter uppercase">
            ADAM
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products/minoxidil-5-solution" className={`font-medium transition-colors ${getLinkClasses()}`}>
              Hair Loss
            </Link>
            <Link href="/quiz" className={`font-medium transition-colors ${getLinkClasses()}`}>
              Sexual Health
            </Link>
            <Link
              href="/products/minoxidil-finasteride-combination-spray"
              className={`font-medium transition-colors ${getLinkClasses()}`}
            >
              Skincare
            </Link>
            <Link href="/about" className={`font-medium transition-colors ${getLinkClasses()}`}>
              About
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth" className={`font-medium transition-colors ${getLinkClasses()}`}>
              Sign In
            </Link>
            <Link
              href="/quiz"
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              Start Assessment
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={`block w-5 h-0.5 bg-current transform transition-transform ${isMenuOpen ? "rotate-45 translate-y-1" : ""}`}
              />
              <span className={`block w-5 h-0.5 bg-current mt-1 transition-opacity ${isMenuOpen ? "opacity-0" : ""}`} />
              <span
                className={`block w-5 h-0.5 bg-current mt-1 transform transition-transform ${isMenuOpen ? "-rotate-45 -translate-y-1" : ""}`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/products/minoxidil-5-solution"
                className={`font-medium transition-colors ${getLinkClasses()}`}
              >
                Hair Loss
              </Link>
              <Link href="/quiz" className={`font-medium transition-colors ${getLinkClasses()}`}>
                Sexual Health
              </Link>
              <Link
                href="/products/minoxidil-finasteride-combination-spray"
                className={`font-medium transition-colors ${getLinkClasses()}`}
              >
                Skincare
              </Link>
              <Link href="/about" className={`font-medium transition-colors ${getLinkClasses()}`}>
                About
              </Link>
              <Link href="/auth" className={`font-medium transition-colors ${getLinkClasses()}`}>
                Sign In
              </Link>
              <Link
                href="/quiz"
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors w-fit"
              >
                Start Assessment
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

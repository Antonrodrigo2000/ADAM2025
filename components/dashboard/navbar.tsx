'use client'

import Link from 'next/link'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MobileNav } from './mobile-nav'
import { UserProfile, Theme } from './types'

interface NavbarProps {
  user: UserProfile
  onSignOut: () => void
  theme?: Theme
}

export function Navbar({ user, onSignOut, theme = 'light' }: NavbarProps) {
  const isLight = theme === 'light'
  
  return (
    <header className={isLight 
      ? "sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-gray-200"
      : "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    }>
      <div className="container flex h-16 items-center px-4">
        {/* Mobile Navigation */}
        <MobileNav theme={theme} onSignOut={onSignOut} />
        
        {/* Logo */}
        <div className="mr-6 flex items-center">
          <Link href="/dashboard" className={isLight 
            ? "text-2xl font-extrabold font-logo tracking-tighter uppercase text-black"
            : "text-2xl font-extrabold font-logo tracking-tighter uppercase"
          }>
            ADAM
          </Link>
        </div>

        {/* Centered Search Bar */}
        <div className="flex flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search orders, consultations..."
              className={isLight 
                ? "pl-10 bg-white border-gray-300 w-full"
                : "pl-10 bg-background w-full"
              }
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className={isLight 
            ? "relative text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            : "relative hover:bg-accent hover:text-accent-foreground"
          }>
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              3
            </Badge>
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
'use client'

import { ReactNode } from 'react'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'
import { UserProfile, Theme } from './types'

interface DashboardLayoutProps {
  children: ReactNode
  user: UserProfile
  onSignOut: () => void
  theme?: Theme
}

export function DashboardLayout({ children, user, onSignOut, theme = 'light' }: DashboardLayoutProps) {
  const isLight = theme === 'light'
  
  return (
    <div className={isLight ? "min-h-screen bg-gray-50" : "min-h-screen bg-background"}>
      {/* Top Navigation Bar */}
      <Navbar user={user} onSignOut={onSignOut} theme={theme} />
      
      {/* Sidebar for Desktop */}
      <Sidebar theme={theme} onSignOut={onSignOut} />
      
      {/* Main Content Area */}
      <main className="md:pl-64 pt-16">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
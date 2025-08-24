'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NavItem } from './nav-item'
import { dashboardNavConfig } from './nav-config'
import { Theme } from './types'

interface SidebarProps {
  theme?: Theme
  onSignOut: () => void
}

export function Sidebar({ theme = 'light', onSignOut }: SidebarProps) {
  const isLight = theme === 'light'
  return (
    <div className={isLight 
      ? "hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col fixed left-0 top-16 border-r bg-white border-gray-200"
      : "hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col fixed left-0 top-16 border-r bg-card"
    }>
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {dashboardNavConfig.map((section) => (
            <div key={section.title}>
              <h4 className={isLight 
                ? "mb-2 px-3 text-sm font-semibold text-gray-500"
                : "mb-2 px-3 text-sm font-semibold text-muted-foreground"
              }>
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItem key={item.href} item={item} theme={theme} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Sign Out Button at Bottom */}
      <div className="p-3 border-t border-gray-200">
        <Button 
          variant="ghost" 
          onClick={onSignOut}
          className={isLight
            ? "w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            : "w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
          }
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NavItem } from './nav-item'
import { dashboardNavConfig } from './nav-config'
import { Theme } from './types'

interface MobileNavProps {
  theme?: Theme
  onSignOut: () => void
}

export function MobileNav({ theme = 'light', onSignOut }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className={`mr-2 px-2 text-base md:hidden ${theme === 'light' 
            ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' 
            : 'hover:bg-transparent focus-visible:bg-transparent'
          } focus-visible:ring-0 focus-visible:ring-offset-0`}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className={theme === 'light' 
        ? "pr-0 w-72 bg-white border-r border-gray-200" 
        : "pr-0 w-72"
      }>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className={theme === 'light' 
              ? "font-bold text-lg text-black" 
              : "font-bold text-lg"
            }>ADAM</span>
          </div>
        </div>
        <div className="flex flex-col h-[calc(100vh-5rem)]">
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6">
              {dashboardNavConfig.map((section) => (
                <div key={section.title}>
                  <h4 className={theme === 'light' 
                  ? "mb-2 text-sm font-semibold text-gray-500"
                  : "mb-2 text-sm font-semibold text-muted-foreground"
                }>
                    {section.title}
                  </h4>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <NavItem
                        key={item.href}
                        item={item}
                        onClick={() => setOpen(false)}
                        theme={theme}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Sign Out Button at Bottom */}
          <div className="p-6 border-t border-gray-200">
            <Button 
              variant="ghost" 
              onClick={() => {
                onSignOut()
                setOpen(false)
              }}
              className={theme === 'light'
                ? "w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                : "w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
              }
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/style/utils'
import { Badge } from '@/components/ui/badge'
import { NavItem as NavItemType, Theme } from './types'

interface NavItemProps {
  item: NavItemType
  className?: string
  onClick?: () => void
  theme?: Theme
}

export function NavItem({ item, className, onClick, theme = 'light' }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
  const isLight = theme === 'light'

  const ItemContent = () => (
    <>
      <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
      <span className="flex-1 truncate">{item.title}</span>
      {item.badge && (
        <Badge 
          variant={isActive ? "secondary" : "outline"} 
          className={isLight 
            ? "ml-auto flex-shrink-0 bg-gray-100 text-gray-600 border-gray-300"
            : "ml-auto flex-shrink-0"
          }
        >
          {item.badge}
        </Badge>
      )}
    </>
  )

  const itemClasses = cn(
    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isLight 
      ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      : "hover:bg-accent hover:text-accent-foreground",
    "focus-visible:outline-none focus-visible:ring-2",
    isLight
      ? "focus-visible:ring-blue-500"
      : "focus-visible:ring-ring",
    isActive && isLight && "bg-blue-50 text-blue-700 font-semibold",
    isActive && !isLight && "bg-accent text-accent-foreground",
    className
  )

  if (item.isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClasses}
        onClick={onClick}
      >
        <ItemContent />
      </a>
    )
  }

  return (
    <Link href={item.href} className={itemClasses} onClick={onClick}>
      <ItemContent />
    </Link>
  )
}
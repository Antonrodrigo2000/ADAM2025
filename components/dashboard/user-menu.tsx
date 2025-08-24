'use client'

import { LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserProfile, Theme } from './types'

interface UserMenuProps {
  user: UserProfile
  onSignOut: () => void
  theme?: Theme
}

export function UserMenu({ user, onSignOut, theme = 'light' }: UserMenuProps) {
  const isLight = theme === 'light'
  const displayName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user.email || 'User'
  
  const initials = user.first_name && user.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`
    : user.email?.[0]?.toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={isLight 
          ? "relative h-10 w-10 rounded-full p-0 hover:bg-gray-100"
          : "relative h-10 w-10 rounded-full p-0"
        }>
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={isLight 
        ? "w-56 bg-white border-gray-200 shadow-lg"
        : "w-56"
      } align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-gray-500">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem asChild>
          <a href="/dashboard/profile" className="cursor-pointer text-gray-700 hover:bg-gray-100 focus:bg-gray-100">
            <User className="mr-2 h-4 w-4" />
            Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/dashboard/settings" className="cursor-pointer text-gray-700 hover:bg-gray-100 focus:bg-gray-100">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-gray-700 hover:bg-gray-100 focus:bg-gray-100">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
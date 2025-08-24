export interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  badge?: string | number
  isExternal?: boolean
}

export interface UserProfile {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  date_of_birth?: string
  sex?: string
  address?: any
  verification_status?: string
  account_status?: string
  created_at: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export type Theme = 'light' | 'dark'

export interface ThemeProps {
  theme?: Theme
}
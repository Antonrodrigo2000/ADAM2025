import { 
  Home, 
  Package, 
  User, 
  Heart, 
  CreditCard, 
  Settings, 
  FileText, 
  Calendar, 
  MessageSquare,
  Shield,
  Bell
} from 'lucide-react'
import { NavSection } from './types'

export const dashboardNavConfig: NavSection[] = [
  {
    title: 'Dashboard',
    items: [
      {
        title: 'Overview',
        href: '/dashboard',
        icon: Home,
        description: 'Your health dashboard overview'
      }
    ]
  },
  {
    title: 'Health & Orders',
    items: [
      {
        title: 'My Orders',
        href: '/dashboard/orders',
        icon: Package,
        description: 'View and track your orders'
      },
      {
        title: 'Health Profile',
        href: '/dashboard/health',
        icon: Heart,
        description: 'Your health information and history'
      },
      {
        title: 'Consultations',
        href: '/dashboard/consultations',
        icon: MessageSquare,
        description: 'Doctor consultations and reviews'
      },
      {
        title: 'Appointments',
        href: '/dashboard/appointments',
        icon: Calendar,
        description: 'Schedule and manage appointments'
      }
    ]
  },
  {
    title: 'Account',
    items: [
      {
        title: 'Profile',
        href: '/dashboard/profile',
        icon: User,
        description: 'Manage your personal information'
      },
      {
        title: 'Payment Methods',
        href: '/dashboard/payments',
        icon: CreditCard,
        description: 'Manage payment methods and billing'
      },
      {
        title: 'Privacy & Security',
        href: '/dashboard/security',
        icon: Shield,
        description: 'Account security and privacy settings'
      },
      {
        title: 'Notifications',
        href: '/dashboard/notifications',
        icon: Bell,
        description: 'Notification preferences'
      }
    ]
  },
  {
    title: 'Support',
    items: [
      {
        title: 'Help Center',
        href: '/help',
        icon: FileText,
        description: 'FAQs and support articles',
        isExternal: true
      },
      {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        description: 'App preferences and settings'
      }
    ]
  }
]
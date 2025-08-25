"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  className?: string
}

export function Breadcrumbs({ items, showHome = true, className = "" }: BreadcrumbsProps) {
  const allItems = showHome 
    ? [{ label: "Home", href: "/" }, ...items]
    : items

  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          const isHome = index === 0 && showHome

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/60" />
              )}
              
              {item.href && !isLast ? (
                <Link 
                  href={item.href}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  {isHome && <Home className="w-4 h-4" />}
                  {item.label}
                </Link>
              ) : (
                <span 
                  className={`flex items-center gap-1 ${
                    isLast ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {isHome && <Home className="w-4 h-4" />}
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Pre-built breadcrumb configurations for common pages
export const DashboardBreadcrumbs = () => (
  <Breadcrumbs 
    items={[
      { label: "Dashboard", current: true }
    ]} 
  />
)

export const OrdersBreadcrumbs = () => (
  <Breadcrumbs 
    items={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Orders", current: true }
    ]} 
  />
)

export const OrderDetailBreadcrumbs = (orderId: string) => (
  <Breadcrumbs 
    items={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Orders", href: "/dashboard/orders" },
      { label: `Order #${orderId.slice(-8)}`, current: true }
    ]} 
  />
)

export const ConsultationsBreadcrumbs = () => (
  <Breadcrumbs 
    items={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Consultations", current: true }
    ]} 
  />
)

export const ConsultationDetailBreadcrumbs = (consultationId: string) => (
  <Breadcrumbs 
    items={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Consultations", href: "/dashboard/consultations" },
      { label: `Consultation #${consultationId.slice(-8)}`, current: true }
    ]} 
  />
)

export const ProfileBreadcrumbs = () => (
  <Breadcrumbs 
    items={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Profile", current: true }
    ]} 
  />
)
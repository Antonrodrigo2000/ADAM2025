import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function Breadcrumb() {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
      <Link href="/" className="hover:text-blue-600 transition-colors">
        Home
      </Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-gray-900 font-medium">Products</span>
    </nav>
  )
}

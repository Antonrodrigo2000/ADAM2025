import Link from "next/link"

export function Breadcrumb() {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link href="/" className="hover:text-blue-600 transition-colors">
        Home
      </Link>
      <span className="text-gray-400">/</span>
      <span className="text-gray-900 font-medium">Treatments</span>
    </nav>
  )
}

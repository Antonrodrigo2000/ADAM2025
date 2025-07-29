import Link from "next/link"

export function Breadcrumb() {
  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
      <Link href="/" className="hover:text-blue-600 transition-colors">
        Home
      </Link>
      <span>/</span>
      <span className="text-slate-900 font-medium">Treatments</span>
    </nav>
  )
}

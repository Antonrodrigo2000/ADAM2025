import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductsHero } from "@/components/products/products-hero"
import { ProductsGrid } from "@/components/products/products-grid"
import { TrustBadges } from "@/components/products/trust-badges"
import { Breadcrumb } from "@/components/products/breadcrumb"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header variant="dark" />

      <main className="pt-20">
        <div className="container mx-auto px-4 md:px-6">
          <Breadcrumb />
          <ProductsHero />
          <TrustBadges />
          <ProductsGrid />
        </div>
      </main>

      <Footer />
    </div>
  )
}

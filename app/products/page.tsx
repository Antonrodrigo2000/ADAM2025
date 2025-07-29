import { Breadcrumb } from "@/components/products/breadcrumb"
import { ProductsHero } from "@/components/products/products-hero"
import { ProductsGrid } from "@/components/products/products-grid"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import dummyData from "@/data/dummy-products.json"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="light" />

      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb />
          <ProductsHero trustBadges={dummyData.trustBadges} />
          <ProductsGrid categories={dummyData.categories} />
        </div>
      </main>

      <Footer />
    </div>
  )
}

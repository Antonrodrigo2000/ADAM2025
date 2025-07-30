import type { Metadata } from "next"
import { ProductDetailPage } from "@/components/products/product-detail-page"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { combinationSprayData } from "@/data/combination-spray-data"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${combinationSprayData.name} - ADAM Telehealth`,
    description: combinationSprayData.description,
  }
}

export default function CombinationSprayPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header variant="dark" />
      <ProductDetailPage product={combinationSprayData} />
      <Footer />
    </div>
  )
}

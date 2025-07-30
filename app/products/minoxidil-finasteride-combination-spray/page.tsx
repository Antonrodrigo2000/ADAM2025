import type { Metadata } from "next"
import { ProductDetailPage } from "@/components/products/product-detail-page"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { combinationSpraySample } from "@/data/combination-spray-sample"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${combinationSpraySample.name} - ADAM Telehealth`,
    description: combinationSpraySample.description,
  }
}

export default function CombinationSprayPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="dark" />
      <ProductDetailPage product={combinationSpraySample} />
      <Footer />
    </div>
  )
}

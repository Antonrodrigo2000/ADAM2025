import type { Metadata } from "next"
import { ProductDetailPage } from "@/components/products/product-detail-page"
import { combinationSprayData } from "@/data/combination-spray-data"
import { Header } from "@/components/layout/header"

export const metadata: Metadata = {
  title: `${combinationSprayData.name} | ADAM`,
  description: combinationSprayData.description,
  keywords: "minoxidil, finasteride, hair loss, combination therapy, prescription, Sri Lanka, men's health",
}

export default function CombinationSprayPage() {
  return (
    <>
      <Header variant="dark" />
      <ProductDetailPage product={combinationSprayData} />
    </>
  )
}

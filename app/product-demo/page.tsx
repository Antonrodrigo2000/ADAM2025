import JsonProductPage from "@/components/products/json-product-page"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

// Sample product data based on your JSON structure
const sampleProduct = {
  id: "60d2baeb0fdbd800082e6f2a",
  created: "2021-06-23T04:09:39.371Z",
  updated: "2021-06-23T04:10:14.288Z",
  name: "Premium Hair Growth Treatment Kit",
  image: [
    "/placeholder.svg?height=600&width=600&text=Main+Product",
    "/placeholder.svg?height=600&width=600&text=Side+View",
    "/placeholder.svg?height=600&width=600&text=Contents",
  ],
  categoryId: "60d2b403db100b00098cd7cf",
  description:
    "Advanced hair growth treatment kit containing clinically proven ingredients. This comprehensive solution includes topical treatments, supplements, and detailed usage instructions to help you achieve optimal results.",
  price: 89.99,
  locationId: "60d2b403db100b00098cd7ce",
  companyId: "5df00bbd8f0931da1d096769",
  currency: "$",
  taxes: [],
  stockLevel: 15,
  showDetailView: true,
  detailViewContent:
    "This premium hair growth treatment kit has been formulated by leading dermatologists and contains FDA-approved ingredients. The kit includes a 3-month supply of topical treatment, daily supplements, and a comprehensive guide to maximize your results. Clinical studies show 85% of users see visible improvement within 12 weeks.",
  productUrl: "/products/hair-growth-kit",
  sku: "HGK-001-PRE",
  productSlug: "premium-hair-growth-kit",
  deductFromStockLevel: true,
  category: {
    id: "60d2b403db100b00098cd7cf",
    created: "2021-06-23T04:09:39.371Z",
    updated: "2021-06-23T04:10:14.288Z",
    name: "Hair Care",
    locationId: "60d2b403db100b00098cd7ce",
    companyId: "5df00bbd8f0931da1d096769",
    canDelete: false,
    default: true,
    productOrder: ["60d2b403db100b00098cd7c1", "60d2b403db100b00098cd7c2"],
    description: "Professional-grade hair care treatments and solutions",
    productCount: 12,
  },
}

export default function ProductDemoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header textColor="black" />
      <main className="flex-1">
        <JsonProductPage product={sampleProduct} />
      </main>
      <Footer />
    </div>
  )
}

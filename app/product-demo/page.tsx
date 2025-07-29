import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import JsonProductPage from "@/components/products/json-product-page"

// Mock product data based on the JSON structure
const mockProduct = {
  id: "60d2b403db100b00098cd7d1",
  created: "2021-06-23T04:09:39.371Z",
  updated: "2021-06-23T04:10:14.288Z",
  name: "Minoxidil 5% Hair Growth Solution",
  image: [
    "/placeholder.svg?height=600&width=600&text=Minoxidil+5%+Solution",
    "/placeholder.svg?height=600&width=600&text=Product+Back+View",
    "/placeholder.svg?height=600&width=600&text=Product+Side+View",
  ],
  categoryId: "60d2b403db100b00098cd7cf",
  description:
    "Clinically proven hair regrowth treatment with 5% Minoxidil. FDA-approved formula that helps stimulate hair follicles and promote new hair growth. Suitable for male pattern baldness and thinning hair.",
  price: 49.99,
  locationId: "60d2b403db100b00098cd7ce",
  companyId: "5df00bbd8f0931da1d096769",
  currency: "$",
  taxes: [
    {
      id: "60d2baeb0fdbd800082e6f2a",
      name: "VAT",
      code: "VAT",
      percentage: 20,
      applyOn: "PRODUCT",
    },
  ],
  stockLevel: 15,
  showDetailView: true,
  detailViewContent:
    "This advanced hair growth solution contains 5% Minoxidil, the only FDA-approved ingredient for hair regrowth. Apply twice daily to affected areas for best results. Visible improvements typically seen within 3-4 months of consistent use.",
  productUrl: "https://example.com/products/minoxidil-5",
  sku: "MIN-5-100ML",
  productSlug: "minoxidil-5-hair-growth-solution",
  deductFromStockLevel: true,
  category: {
    id: "60d2b403db100b00098cd7cf",
    created: "2021-06-23T04:09:39.371Z",
    updated: "2021-06-23T04:10:14.288Z",
    name: "Hair Loss",
    locationId: "60d2b403db100b00098cd7ce",
    companyId: "5df00bbd8f0931da1d096769",
    canDelete: false,
    default: true,
    productOrder: ["60d2b403db100b00098cd7c1", "60d2b403db100b00098cd7c2"],
    description: "Professional hair loss treatments and solutions",
    productCount: 8,
  },
}

export default function ProductDemoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header textColor="text-black" />
      <main className="flex-1">
        <JsonProductPage product={mockProduct} />
      </main>
      <Footer />
    </div>
  )
}

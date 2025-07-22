import { ProductPage } from "@/components/products/product-page"
import { notFound } from "next/navigation"

// Mock product data - in a real app, this would come from a database or API
const products = {
  "topical-finasteride-minoxidil": {
    id: 1,
    slug: "topical-finasteride-minoxidil",
    name: "Topical Finasteride & Minoxidil Spray",
    badge: "#1 customer favorite",
    description:
      "A 2-in-1 spray to treat hair loss and regrow new hair, made with two clinically proven ingredients. It's a no pill option to treat hair loss and our best selling treatment for a reason.",
    mainImage: "/placeholder.svg?height=400&width=400",
    thumbnails: [
      "/placeholder.svg?height=56&width=56",
      "/placeholder.svg?height=56&width=56",
      "/placeholder.svg?height=56&width=56",
      "/placeholder.svg?height=56&width=56",
      "/placeholder.svg?height=56&width=56",
    ],
    sections: [
      {
        id: "meet-spray",
        title: "Meet the 2-in-1 spray",
        content:
          "Our topical spray combines two FDA-approved ingredients in one convenient treatment. Finasteride blocks DHT production while minoxidil stimulates hair follicles, working together to prevent further hair loss and promote regrowth.",
      },
      {
        id: "how-it-works",
        title: "How it works",
        content:
          "Apply directly to affected areas of the scalp twice daily. The topical formula delivers active ingredients directly to hair follicles without systemic absorption, reducing potential side effects while maximizing effectiveness.",
      },
      {
        id: "ingredients",
        title: "Ingredients",
        content:
          "Active ingredients: Finasteride 0.25%, Minoxidil 6%. Inactive ingredients: Propylene glycol, ethanol, purified water. Formulated for optimal absorption and minimal irritation.",
      },
      {
        id: "shipping-restrictions",
        title: "Shipping restrictions",
        content:
          "Due to alcohol content, this product cannot be shipped to certain military addresses (APO, FPO, DPO). Standard shipping available to all other US addresses with discreet packaging.",
      },
    ],
    shippingNotice:
      "Due to U.S. Department of Transportation regulations, certain items, including alcohol-based products have shipping restrictions to military addresses. We regret that we are not able to offer shipping to APO, FPO, DPO, or Military addresses on orders with restricted items.",
    fdaDisclaimer:
      "Topical Finasteride & Minoxidil Spray is a compounded product and has not been approved by the FDA. The FDA does not verify the safety or effectiveness of compounded drugs. Only available if prescribed. Subscription required.",
  },
}

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default function ProductPageRoute({ params }: ProductPageProps) {
  const product = products[params.slug as keyof typeof products]

  if (!product) {
    notFound()
  }

  return <ProductPage product={product} />
}

export function generateStaticParams() {
  return Object.keys(products).map((slug) => ({
    slug,
  }))
}

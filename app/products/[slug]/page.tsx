import { notFound } from "next/navigation"
import { ProductPage } from "@/components/products/product-page"

// Mock product data - structure for future backend integration
const products = [
  {
    id: 1,
    slug: "topical-finasteride-minoxidil-spray",
    name: "Topical Finasteride & Minoxidil Spray",
    badge: "#1 customer favorite",
    description:
      "A 2-in-1 spray to treat hair loss and regrow new hair, made with two clinically proven ingredients. It's a no pill option to treat hair loss and our best selling treatment for a reason.",
    mainImage: "/placeholder.svg?height=600&width=600&text=Hair+Loss+Spray",
    thumbnails: [
      "/placeholder.svg?height=80&width=80&text=1",
      "/placeholder.svg?height=80&width=80&text=2",
      "/placeholder.svg?height=80&width=80&text=3",
      "/placeholder.svg?height=80&width=80&text=4",
      "/placeholder.svg?height=80&width=80&text=5",
    ],
    sections: [
      {
        id: "meet-spray",
        title: "Meet the 2-in-1 spray",
        content:
          "This innovative spray combines two FDA-approved ingredients in one convenient application. Finasteride blocks DHT production while Minoxidil stimulates blood flow to hair follicles.",
      },
      {
        id: "how-it-works",
        title: "How it works",
        content:
          "Apply directly to affected areas twice daily. The topical formula delivers active ingredients directly to hair follicles without systemic side effects common with oral medications.",
      },
      {
        id: "ingredients",
        title: "Ingredients",
        content:
          "Active ingredients: Finasteride 0.25%, Minoxidil 6%. Inactive ingredients: Propylene glycol, ethanol, purified water.",
      },
      {
        id: "shipping",
        title: "Shipping restrictions",
        content:
          "Due to U.S. Department of Transportation regulations, certain items, including alcohol-based products have shipping restrictions to military addresses. We regret that we are not able to offer shipping to APO, FPO, or Military addresses on orders with restricted items.",
        expanded: true,
      },
    ],
    disclaimer:
      "Topical Finasteride & Minoxidil Spray is a compounded product and has not been approved by the FDA. The FDA does not verify the safety or effectiveness of compounded drugs. Only available if prescribed after an online consultation with a healthcare provider.",
    footnote: "*Based on separate individual studies of oral minoxidil and oral finasteride.",
  },
  {
    id: 2,
    slug: "hair-growth-gummies",
    name: "Hair Growth Gummies",
    badge: "Most popular",
    description:
      "Clinically studied ingredients in a delicious gummy format. Support hair growth from within with biotin, saw palmetto, and other essential nutrients.",
    mainImage: "/placeholder.svg?height=600&width=600&text=Hair+Gummies",
    thumbnails: [
      "/placeholder.svg?height=80&width=80&text=A",
      "/placeholder.svg?height=80&width=80&text=B",
      "/placeholder.svg?height=80&width=80&text=C",
      "/placeholder.svg?height=80&width=80&text=D",
    ],
    sections: [
      {
        id: "meet-gummies",
        title: "Meet the hair growth gummies",
        content:
          "A convenient daily supplement packed with clinically studied ingredients to support healthy hair growth from the inside out.",
      },
      {
        id: "how-it-works",
        title: "How it works",
        content:
          "Take 2 gummies daily with or without food. The blend of vitamins, minerals, and botanicals work together to nourish hair follicles and support the hair growth cycle.",
      },
      {
        id: "ingredients",
        title: "Ingredients",
        content: "Biotin, Saw Palmetto Extract, Vitamin D3, Zinc, Iron, and other essential nutrients for hair health.",
      },
    ],
  },
]

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default function ProductPageRoute({ params }: ProductPageProps) {
  const product = products.find((p) => p.slug === params.slug)

  if (!product) {
    notFound()
  }

  return <ProductPage product={product} />
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }))
}

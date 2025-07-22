import ProductPage from "@/components/products/product-page"
import { notFound } from "next/navigation"

// Sample product data - you can move this to a separate data file
const products = {
  "minoxidil-5": {
    category: "2-IN-1 TOPICAL TREATMENT",
    title: "Topical Finasteride and Minoxidil Gel",
    subtitle: "0.25% FINASTERIDE AND 5% MINOXIDIL",
    description:
      "Topical finasteride and minoxidil gel is a two-in-one prescription hair loss treatment that stimulates hair regrowth and reduces hair loss.",
    images: [
      {
        src: "/placeholder.svg?height=600&width=600",
        alt: "Topical Finasteride and Minoxidil Gel",
      },
      {
        src: "/placeholder.svg?height=600&width=600",
        alt: "Product label close-up",
      },
    ],
    variants: [
      {
        id: "subscription",
        name: "Monthly Subscription",
        type: "subscription" as const,
        originalPrice: 60,
        price: 40,
        frequency: "Ships every 3 months",
      },
      {
        id: "one-time",
        name: "One-time Purchase",
        type: "one-time" as const,
        price: 60,
      },
    ],
    options: [
      { id: "gel", name: "gel", label: "Gel" },
      { id: "foam", name: "foam", label: "Foam" },
    ],
    defaultVariant: "subscription",
    defaultOption: "gel",
    requiresConsultation: true,
    howItWorks:
      "Apply the gel directly to your scalp twice daily. The combination of finasteride and minoxidil works to block DHT production while stimulating blood flow to hair follicles, promoting regrowth and preventing further loss.",
    aboutTreatment:
      "This prescription treatment combines two FDA-approved ingredients for hair loss. Finasteride blocks the hormone that causes hair loss, while minoxidil increases blood flow to hair follicles. Clinical studies show significant improvement in hair density and thickness when used consistently.",
  },
  "finasteride-oral": {
    category: "ORAL MEDICATION",
    title: "Finasteride Tablets",
    subtitle: "1MG DAILY TABLET",
    description:
      "Finasteride is an FDA-approved oral medication that blocks DHT production to prevent hair loss and promote regrowth.",
    images: [
      {
        src: "/placeholder.svg?height=600&width=600",
        alt: "Finasteride Tablets",
      },
    ],
    variants: [
      {
        id: "subscription",
        name: "Monthly Subscription",
        type: "subscription" as const,
        originalPrice: 25,
        price: 20,
        frequency: "Ships every month",
      },
      {
        id: "one-time",
        name: "One-time Purchase",
        type: "one-time" as const,
        price: 25,
      },
    ],
    defaultVariant: "subscription",
    requiresConsultation: true,
    howItWorks:
      "Take one tablet daily with or without food. Finasteride works by blocking the enzyme that converts testosterone to DHT, the hormone responsible for hair loss.",
    aboutTreatment:
      "Finasteride is clinically proven to stop hair loss in 83% of men and promote regrowth in 65% of men. Results are typically seen after 3-6 months of consistent use.",
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

  return <ProductPage {...product} />
}

export function generateStaticParams() {
  return Object.keys(products).map((slug) => ({
    slug,
  }))
}

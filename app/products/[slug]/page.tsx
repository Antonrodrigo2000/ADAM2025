import { notFound } from "next/navigation"
import { ProductPage } from "@/components/products/product-page"

// Mock product data - structure for future backend integration
const products = [
  {
    id: 1,
    slug: "minoxidil-5",
    name: "Minoxidil 5%",
    shortName: "Minoxidil",
    price: 29.99,
    originalPrice: 39.99,
    image: "/placeholder.svg?height=400&width=400",
    category: "Hair Loss Treatment",
    description:
      "Clinically proven topical solution for male pattern baldness. FDA-approved formula that stimulates hair follicles and promotes regrowth.",
    longDescription:
      "Our pharmaceutical-grade Minoxidil 5% solution is the gold standard for treating male pattern baldness. This FDA-approved topical treatment works by increasing blood flow to hair follicles, extending the growth phase of hair, and gradually increasing follicle size. Clinical studies show that 85% of men experience hair regrowth or reduced hair loss within 4 months of consistent use.",
    benefits: [
      "FDA-approved for male pattern baldness",
      "Clinically proven to regrow hair",
      "Increases hair follicle size",
      "Extends hair growth phase",
      "Visible results in 3-4 months",
    ],
    ingredients: ["Minoxidil 5% (active ingredient)", "Propylene glycol", "Ethanol", "Purified water"],
    usage: "Apply 1ml twice daily to affected areas of the scalp. Massage gently and allow to dry completely.",
    warnings: [
      "For external use only",
      "Avoid contact with eyes",
      "May cause temporary scalp irritation",
      "Consult physician if pregnant or nursing",
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 1247,
  },
  {
    id: 2,
    slug: "combination-spray",
    name: "Hair Growth Combination Spray",
    shortName: "Combination Spray",
    price: 49.99,
    originalPrice: 69.99,
    image: "/placeholder.svg?height=400&width=400",
    category: "Advanced Hair Treatment",
    description:
      "Advanced multi-ingredient formula combining Minoxidil, Finasteride, and growth peptides for maximum hair restoration results.",
    longDescription:
      "Our premium Hair Growth Combination Spray represents the pinnacle of hair restoration science. This physician-formulated treatment combines three powerful ingredients: Minoxidil 5% for follicle stimulation, Finasteride 0.1% to block DHT production, and proprietary growth peptides to enhance cellular regeneration. This synergistic approach targets hair loss from multiple pathways, delivering superior results compared to single-ingredient treatments.",
    benefits: [
      "Triple-action hair restoration formula",
      "Blocks DHT at the source",
      "Stimulates dormant follicles",
      "Enhances hair thickness and density",
      "Faster results than single treatments",
      "Convenient spray application",
    ],
    ingredients: ["Minoxidil 5%", "Finasteride 0.1%", "Copper peptides", "Adenosine", "Caffeine", "Biotin complex"],
    usage: "Spray 6-8 pumps onto affected scalp areas twice daily. Massage gently and do not rinse.",
    warnings: [
      "Prescription required",
      "For men only",
      "May cause initial shedding",
      "Avoid if planning pregnancy with partner",
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 892,
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

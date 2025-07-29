import { Suspense } from "react"
import { notFound } from "next/navigation"
import ProductDetailView from "@/components/products/product-detail-view"
import ProductDetailSkeleton from "@/components/products/product-detail-skeleton"
import type { Product } from "@/types/product"

// Mock data - replace with Supabase query
const mockProduct: Product = {
  id: "1",
  name: "Minoxidil 5% Solution",
  slug: "minoxidil-5-solution",
  description: "Clinically proven hair loss treatment that helps regrow hair and prevent further hair loss.",
  active_ingredient: "Minoxidil 5%",
  dosage: "Apply 1ml twice daily to affected areas",
  price: 4500,
  consultation_fee: 2000,
  prescription_required: false,
  health_vertical_id: "1",
  health_vertical: {
    name: "Hair Loss",
    slug: "hair-loss",
  },
  images: [
    {
      id: "1",
      url: "/placeholder.svg?height=400&width=400&text=Minoxidil+Bottle",
      alt: "Minoxidil 5% Solution Bottle",
      is_primary: true,
    },
    {
      id: "2",
      url: "/placeholder.svg?height=400&width=400&text=Application+Guide",
      alt: "How to apply minoxidil",
      is_primary: false,
    },
    {
      id: "3",
      url: "/placeholder.svg?height=400&width=400&text=Before+After",
      alt: "Before and after results",
      is_primary: false,
    },
  ],
  rating: 4.6,
  review_count: 1247,
  benefits: [
    "Clinically proven to regrow hair",
    "Prevents further hair loss",
    "FDA approved formula",
    "Visible results in 3-4 months",
  ],
  how_it_works:
    "Minoxidil works by widening blood vessels and opening potassium channels, allowing more oxygen, blood, and nutrients to the follicle.",
  expected_timeline:
    "Initial results may be seen after 2-3 months of consistent use. Full benefits typically appear after 6 months.",
  ingredients: [
    {
      name: "Minoxidil",
      dosage: "5%",
      description: "The active ingredient that promotes hair growth",
    },
    {
      name: "Propylene Glycol",
      dosage: "30%",
      description: "Helps the minoxidil penetrate the scalp",
    },
    {
      name: "Ethanol",
      dosage: "60%",
      description: "Solvent that helps with application",
    },
  ],
  side_effects: [
    "Scalp irritation or redness",
    "Unwanted facial hair growth",
    "Dizziness (rare)",
    "Rapid heart rate (rare)",
  ],
  contraindications: [
    "Pregnancy or breastfeeding",
    "Under 18 years of age",
    "Scalp infections or wounds",
    "Known hypersensitivity to minoxidil",
  ],
  warnings: [
    "For external use only",
    "Avoid contact with eyes",
    "Wash hands after application",
    "May cause temporary hair shedding initially",
  ],
  clinical_studies: "In clinical studies, 85% of men experienced hair regrowth after 4 months of use.",
  faqs: [
    {
      id: "1",
      question: "How long does shipping take?",
      answer:
        "We offer free 2-day delivery across Colombo and suburbs. Other areas receive delivery within 3-5 business days.",
    },
    {
      id: "2",
      question: "Do I need a prescription?",
      answer:
        "No, Minoxidil 5% is available without a prescription. However, we recommend consulting with our doctors for personalized advice.",
    },
    {
      id: "3",
      question: "What if it doesn't work for me?",
      answer:
        "We offer a 90-day money-back guarantee. If you're not satisfied with the results, contact our support team for a full refund.",
    },
  ],
}

async function getProduct(slug: string): Promise<Product | null> {
  // TODO: Replace with actual Supabase query
  // const { data, error } = await supabase
  //   .from('products')
  //   .select(`
  //     *,
  //     health_vertical:health_verticals(name, slug),
  //     images:product_images(*),
  //     ingredients:product_ingredients(*),
  //     faqs:product_faqs(*)
  //   `)
  //   .eq('slug', slug)
  //   .single()

  if (slug === "minoxidil-5-solution") {
    return mockProduct
  }

  return null
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailView product={product} />
      </Suspense>
    </div>
  )
}

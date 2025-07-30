import type { Metadata } from "next"
import { ProductDetailPage } from "@/components/products/product-details-page"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

// Sample product data - will be replaced with Supabase query
const sampleProduct = {
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
      alt_text: "Minoxidil 5% Solution Bottle",
      is_primary: true,
    },
    {
      id: "2",
      url: "/placeholder.svg?height=400&width=400&text=Application+Guide",
      alt_text: "How to apply minoxidil",
      is_primary: false,
    },
    {
      id: "3",
      url: "/placeholder.svg?height=400&width=400&text=Before+After",
      alt_text: "Before and after results",
      is_primary: false,
    },
    {
      id: "4",
      url: "/placeholder.svg?height=400&width=400&text=Lifestyle+Image",
      alt_text: "Man using product",
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
    "Easy twice-daily application",
  ],
  how_it_works:
    "Minoxidil works by widening blood vessels and opening potassium channels, allowing more oxygen, blood, and nutrients to the follicle. This may cause follicles in the telogen phase to shed, which are then replaced by thicker hairs in a new anagen phase.",
  expected_timeline:
    "Initial shedding may occur in weeks 2-6. New hair growth typically begins around month 3-4, with significant improvement visible by month 6.",
  ingredients: [
    {
      name: "Minoxidil",
      dosage: "5%",
      description: "The active ingredient that promotes hair growth by improving blood flow to hair follicles.",
    },
    {
      name: "Propylene Glycol",
      dosage: "30%",
      description: "Helps the minoxidil penetrate the scalp effectively.",
    },
    {
      name: "Ethanol",
      dosage: "60%",
      description: "Solvent that helps deliver the active ingredient.",
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
    "Discontinue if severe irritation occurs",
  ],
  clinical_studies: [
    {
      title: "FDA Clinical Trial Results",
      description: "48-week study showing 85% of men experienced hair regrowth",
      efficacy_rate: 85,
      study_url: "#",
    },
    {
      title: "European Hair Research Study",
      description: "Significant improvement in hair density after 6 months of use",
      efficacy_rate: 78,
      study_url: "#",
    },
  ],
  faqs: [
    {
      question: "How long does it take to see results?",
      answer:
        "Most users see initial results within 3-4 months of consistent use. Full benefits are typically visible after 6-12 months.",
    },
    {
      question: "Do I need a prescription for this product?",
      answer: "No, this is an over-the-counter treatment that does not require a prescription.",
    },
    {
      question: "What happens if I stop using it?",
      answer: "Hair loss will gradually return to its previous pattern within 3-4 months of discontinuing treatment.",
    },
    {
      question: "Can I use this with other hair products?",
      answer: "Yes, but wait at least 4 hours after applying minoxidil before using other hair styling products.",
    },
  ],
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${sampleProduct.name} - ADAM Telehealth`,
    description: sampleProduct.description,
  }
}

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="dark" />
      <ProductDetailPage product={sampleProduct} />
      <Footer />
    </div>
  )
}

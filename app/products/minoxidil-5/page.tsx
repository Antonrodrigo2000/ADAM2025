import ProductPage from "@/components/products/product-page"
import ProductInfoSection from "@/components/products/product-info-section"
import { Header } from "@/components/layout/header"
import Link from "next/link"

export default function MinoxidilProductPage() {
  const productData = {
    category: "TOPICAL HAIR LOSS TREATMENT",
    title: "Minoxidil USP 5% Solution",
    subtitle: "FDA-APPROVED HAIR REGROWTH TREATMENT",
    description:
      "Minoxidil USP 5% is a clinically proven, FDA-approved topical solution that stimulates hair follicles and promotes hair regrowth. This powerful treatment increases blood flow to the scalp, revitalizes shrunken hair follicles, and helps restore thicker, fuller hair over time.",
    images: [
      {
        src: "/placeholder.svg?height=600&width=600",
        alt: "Minoxidil USP 5% Solution - Front View",
      },
      {
        src: "/placeholder.svg?height=600&width=600",
        alt: "Minoxidil USP 5% Solution - Side View with Dropper",
      },
      {
        src: "/placeholder.svg?height=600&width=600",
        alt: "Minoxidil USP 5% Solution - Back Label with Ingredients",
      },
      {
        src: "/placeholder.svg?height=600&width=600",
        alt: "Minoxidil Application Demonstration",
      },
    ],
    variants: [
      {
        id: "subscription-3month",
        name: "3-Month Subscription",
        type: "subscription" as const,
        originalPrice: 45,
        price: 35,
        frequency: "Ships every 3 months (3 bottles)",
      },
      {
        id: "subscription-monthly",
        name: "Monthly Subscription",
        type: "subscription" as const,
        originalPrice: 18,
        price: 15,
        frequency: "Ships every month (1 bottle)",
      },
      {
        id: "one-time-single",
        name: "Single Bottle",
        type: "one-time" as const,
        price: 18,
      },
      {
        id: "one-time-3pack",
        name: "3-Bottle Pack",
        type: "one-time" as const,
        originalPrice: 54,
        price: 45,
      },
    ],
    options: [
      { id: "solution", name: "solution", label: "Solution" },
      { id: "foam", name: "foam", label: "Foam" },
    ],
    defaultVariant: "subscription-3month",
    defaultOption: "solution",
    requiresConsultation: false,
    howItWorks:
      "Apply 1ml of Minoxidil solution directly to the affected areas of your scalp twice daily (morning and evening). Use the included dropper to measure the correct amount. Gently massage into the scalp and allow to dry completely before styling your hair. Do not wash your hair for at least 4 hours after application. Results typically become visible after 2-4 months of consistent use, with optimal results seen after 6-12 months.",
    aboutTreatment:
      "Minoxidil USP 5% is the only FDA-approved over-the-counter treatment for androgenetic alopecia (male pattern baldness). Originally developed as a blood pressure medication, researchers discovered its hair growth properties as a side effect. Clinical studies show that 5% minoxidil is significantly more effective than 2% concentration, with 45% of men experiencing moderate to dense hair regrowth after one year of use. The treatment works by widening blood vessels and opening potassium channels, which allows more oxygen, blood, and nutrients to reach hair follicles. This process can reverse the miniaturization of hair follicles and extend the growth phase of the hair cycle.",
  }

  const infoSectionData = {
    title: "On minoxidil for men's hair loss",
    image: "/placeholder.svg?height=600&width=600",
    formatsTitle: "Solution, foam, or spray?",
    formatsDescription:
      "Topical minoxidil is available in three different formulations. It's available in a dropper solution, or a light and airy topical foam as the single ingredient, and in a 2-in-1 treatment spray that also contains finasteride.",
    benefitsTitle: "Better together",
    benefitsDescription:
      "Minoxidil is a clinically proven hair regrowth treatment for men that can regrow hair on the vertex or crown in as little as 3-6 months. When paired with finasteride, it is proven to give even better results. Connect with a provider, 100% online, to see which treatments might be best for you.",
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header darkText={true} />
      <main className="flex-1 pt-20">
        <ProductPage {...productData} />
        <ProductInfoSection {...infoSectionData} />
      </main>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold font-display mb-4">Adam</h3>
            <p className="text-sm text-neutral-400">© 2025 BASKR Health (Private) Limited. All rights reserved.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Treatments</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link href="/products/minoxidil-5" className="hover:text-primary transition-colors">
                  Hair Loss
                </Link>
              </li>
              <li>
                <a href="#skin" className="hover:text-primary transition-colors">
                  Skincare
                </a>
              </li>
              <li>
                <a href="#sexual-health" className="hover:text-primary transition-colors">
                  Sexual Health
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

export const metadata = {
  title: "Minoxidil USP 5% Solution - Hair Regrowth Treatment | Adam Telehealth",
  description:
    "FDA-approved Minoxidil USP 5% solution for hair loss treatment. Clinically proven to stimulate hair regrowth and restore thicker, fuller hair. Available with subscription savings.",
  keywords: "minoxidil, hair loss, hair regrowth, FDA approved, male pattern baldness, hair treatment",
}

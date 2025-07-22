import ProductPage from "@/components/products/product-page"

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

  return <ProductPage {...productData} />
}

export const metadata = {
  title: "Minoxidil USP 5% Solution - Hair Regrowth Treatment | Adam Telehealth",
  description:
    "FDA-approved Minoxidil USP 5% solution for hair loss treatment. Clinically proven to stimulate hair regrowth and restore thicker, fuller hair. Available with subscription savings.",
  keywords: "minoxidil, hair loss, hair regrowth, FDA approved, male pattern baldness, hair treatment",
}

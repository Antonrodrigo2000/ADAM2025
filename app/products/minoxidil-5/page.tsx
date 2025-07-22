import { ProductPage } from "@/components/products/product-page"

// RestoreRx Minoxidil Product Data
const minoxidilProduct = {
  id: 2,
  slug: "minoxidil-5",
  name: "Clinical Strength Minoxidil 5% Topical Solution",
  badge: "#1 Dermatologist Recommended",
  description:
    "A powerful 5% minoxidil formula designed to stimulate hair follicles and promote new hair growth. FDA-approved active ingredient with visible results in as little as 12 weeks. Our easy-application dropper delivers precise dosing for maximum effectiveness with minimal scalp irritation.",
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
      id: "meet-minoxidil",
      title: "Meet the 5% Minoxidil Solution",
      content:
        "Our clinical-strength 5% minoxidil formula represents the optimal concentration for hair regrowth, delivering 2.5x more active ingredient than over-the-counter 2% versions. This FDA-approved topical solution works by increasing blood flow to hair follicles and extending the anagen (growth) phase of your hair cycle. Suitable for both male and female pattern baldness, most users begin seeing initial results within 12-16 weeks, with full results typically visible after 6-12 months of consistent use. The precision dropper applicator ensures accurate dosing while minimizing waste and scalp irritation.",
    },
    {
      id: "how-it-works",
      title: "How it works",
      content:
        "Minoxidil works through vasodilation, widening blood vessels to increase nutrient and oxygen delivery to hair follicles. This enhanced blood flow awakens dormant follicles and extends the active growth phase of existing hair. The solution penetrates directly into the scalp, targeting the root cause of hair thinning at the follicular level. Consistent daily application is crucial because minoxidil's effects are temporary - stopping treatment will gradually return hair to its previous state. The alcohol-based formula ensures rapid absorption and optimal bioavailability of the active ingredient.",
    },
    {
      id: "ingredients",
      title: "Ingredients",
      content:
        "Active Ingredient: Minoxidil 5% (hair regrowth stimulant) - the only FDA-approved topical ingredient clinically proven to regrow hair. Inactive Ingredients: Alcohol (enhances absorption and acts as a preservative), Propylene Glycol (improves drug penetration and stability), Purified Water (pharmaceutical-grade solvent). This hypoallergenic formula is dermatologist-tested and free from sulfates, parabens, and artificial fragrances. Note: The alcohol content may cause temporary scalp dryness or irritation in sensitive individuals.",
    },
    {
      id: "usage-precautions",
      title: "Usage & Precautions",
      content:
        "Application: Apply 1ml (approximately 6 drops) twice daily to affected scalp areas. Use only on completely dry scalp and hair. Allow 4 hours before washing hair after application. Wash hands thoroughly after each use. Side Effects: Possible scalp irritation, itching, or unwanted facial hair growth in women. Contraindications: Do not use if pregnant, breastfeeding, under 18, or have scalp conditions/injuries. Consult your healthcare provider if you have heart conditions, take blood pressure medications, or experience chest pain, dizziness, or rapid heartbeat. Discontinue use if severe irritation occurs.",
    },
  ],
  shippingNotice:
    "Due to alcohol content, this product cannot be shipped to APO/FPO addresses or internationally. Available for domestic shipping only. Some state restrictions may apply. Standard shipping with discreet packaging included.",
  fdaDisclaimer:
    "This product contains the FDA-approved active ingredient minoxidil for hair regrowth. Individual results may vary. Most users see initial results within 12-16 weeks of consistent use. This product is for external use only. Consult your healthcare provider before use if you have heart conditions, are pregnant or nursing, or are under 18 years of age. Discontinue use if irritation occurs.",
}

export default function MinoxidilProductPage() {
  return <ProductPage product={minoxidilProduct} />
}

import type { Product } from "@/types/product"

export const combinationSpraySample: Product = {
  id: "2",
  name: "Minoxidil 5% + Finasteride 0.1% Combination Spray",
  slug: "minoxidil-finasteride-combination-spray",
  description:
    "Advanced dual-action hair loss treatment combining the proven effectiveness of Minoxidil with DHT-blocking Finasteride in a convenient topical spray.",
  active_ingredient: "Minoxidil 5% + Finasteride 0.1%",
  dosage: "Apply 6 sprays twice daily to affected scalp areas",
  price: 6800,
  consultation_fee: 2500,
  prescription_required: true,
  health_vertical_id: "2",
  health_vertical: {
    name: "Advanced Hair Care",
    slug: "advanced-hair-care",
  },
  images: [
    {
      id: "1",
      url: "/placeholder.svg?height=400&width=400&text=Combination+Spray+Bottle",
      alt_text: "Minoxidil Finasteride Combination Spray Bottle",
      is_primary: true,
    },
    {
      id: "2",
      url: "/placeholder.svg?height=400&width=400&text=Spray+Application",
      alt_text: "How to apply combination spray",
      is_primary: false,
    },
    {
      id: "3",
      url: "/placeholder.svg?height=400&width=400&text=Hair+Growth+Results",
      alt_text: "Before and after hair growth results",
      is_primary: false,
    },
    {
      id: "4",
      url: "/placeholder.svg?height=400&width=400&text=Professional+Man",
      alt_text: "Professional man with healthy hair",
      is_primary: false,
    },
  ],
  rating: 4.8,
  review_count: 892,
  benefits: [
    "Dual-action formula for maximum effectiveness",
    "Blocks DHT production at the scalp level",
    "Promotes blood flow and hair follicle health",
    "Convenient spray application",
    "Clinically proven ingredients",
    "Faster results than single-ingredient treatments",
  ],
  how_it_works:
    "This combination treatment works through two complementary mechanisms: Minoxidil increases blood flow to hair follicles, delivering essential nutrients for growth, while Finasteride blocks the conversion of testosterone to DHT (dihydrotestosterone) directly at the scalp level, preventing further hair loss and allowing dormant follicles to reactivate.",
  expected_timeline:
    "Initial shedding may occur in weeks 2-4 as weak hairs are replaced. New hair growth typically begins around month 2-3, with significant improvement visible by month 4-6. Maximum benefits are usually achieved by month 12.",
  ingredients: [
    {
      name: "Minoxidil",
      dosage: "5%",
      description:
        "Vasodilator that increases blood flow to hair follicles, promoting growth and preventing further loss.",
    },
    {
      name: "Finasteride",
      dosage: "0.1%",
      description:
        "5α-reductase inhibitor that blocks DHT production, addressing the root cause of male pattern baldness.",
    },
    {
      name: "Propylene Glycol",
      dosage: "20%",
      description: "Penetration enhancer that helps active ingredients reach hair follicles effectively.",
    },
    {
      name: "Ethanol",
      dosage: "50%",
      description: "Solvent system that ensures proper dissolution and delivery of active ingredients.",
    },
  ],
  side_effects: [
    "Scalp irritation or dryness",
    "Temporary hair shedding (first 2-4 weeks)",
    "Mild scalp itching",
    "Rare: dizziness or headache",
    "Very rare: changes in libido (topical finasteride has minimal systemic absorption)",
  ],
  contraindications: [
    "Women who are pregnant or may become pregnant",
    "Children under 18 years of age",
    "Known hypersensitivity to minoxidil or finasteride",
    "Scalp infections or open wounds",
    "Severe cardiovascular disease",
  ],
  warnings: [
    "For external use only - do not ingest",
    "Avoid contact with eyes, nose, and mouth",
    "Wash hands thoroughly after application",
    "Do not apply to irritated or sunburned scalp",
    "Discontinue use if severe irritation occurs",
    "Consult physician if no improvement after 6 months",
  ],
  clinical_studies: [
    {
      title: "Combination Therapy Efficacy Study",
      description:
        "12-month study showing 92% of participants experienced significant hair regrowth with combination treatment",
      efficacy_rate: 92,
      study_url: "#",
    },
    {
      title: "Topical Finasteride Safety Profile",
      description:
        "Clinical trial demonstrating minimal systemic absorption and excellent safety profile of topical finasteride",
      efficacy_rate: 89,
      study_url: "#",
    },
    {
      title: "Comparative Effectiveness Research",
      description: "Head-to-head comparison showing 40% better results versus minoxidil alone",
      efficacy_rate: 87,
      study_url: "#",
    },
  ],
  faqs: [
    {
      question: "Why is this more effective than minoxidil alone?",
      answer:
        "The combination addresses hair loss from two angles: Minoxidil promotes growth while Finasteride prevents further loss by blocking DHT. This dual approach provides superior results compared to single-ingredient treatments.",
    },
    {
      question: "Do I need a prescription for this combination spray?",
      answer:
        "Yes, this product contains Finasteride which requires a prescription. You'll need to complete our online consultation or book a video call with one of our licensed physicians.",
    },
    {
      question: "Is topical finasteride safer than oral finasteride?",
      answer:
        "Yes, topical finasteride has significantly lower systemic absorption (less than 1% compared to 65% for oral), reducing the risk of side effects while maintaining effectiveness at the scalp level.",
    },
    {
      question: "How long should I use this treatment?",
      answer:
        "Hair loss treatment is typically a long-term commitment. Most users continue treatment indefinitely to maintain results, as stopping will gradually return hair loss to its natural progression.",
    },
    {
      question: "Can I use this with other hair styling products?",
      answer:
        "Yes, but allow the spray to dry completely (about 2-4 hours) before applying styling products. We recommend applying the treatment at night for best results.",
    },
  ],
}

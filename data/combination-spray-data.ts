import type { Product } from "@/types/product"

export const combinationSprayData: Product = {
  id: "2",
  name: "Minoxidil 5% + Finasteride 0.1% Spray",
  slug: "minoxidil-finasteride-combination-spray",
  description:
    "Advanced dual-action hair loss treatment combining minoxidil and finasteride in a convenient topical spray for maximum effectiveness.",
  active_ingredient: "Minoxidil 5% + Finasteride 0.1%",
  dosage: "Apply 1ml twice daily to affected scalp areas",
  price: 7500,
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
      url: "/placeholder.svg?height=400&width=400&text=Clinical+Results",
      alt_text: "Clinical study results",
      is_primary: false,
    },
    {
      id: "4",
      url: "/placeholder.svg?height=400&width=400&text=Professional+Use",
      alt_text: "Professional using product",
      is_primary: false,
    },
  ],
  rating: 4.8,
  review_count: 892,
  benefits: [
    "Dual-action formula for superior results",
    "Blocks DHT production at the source",
    "Stimulates blood flow to follicles",
    "Convenient once-daily application",
    "Clinically proven combination therapy",
    "Reduces hair loss by up to 90%",
  ],
  how_it_works:
    "This combination therapy works through two complementary mechanisms: Minoxidil increases blood flow and nutrient delivery to hair follicles, while Finasteride blocks the conversion of testosterone to DHT (dihydrotestosterone), the primary hormone responsible for male pattern baldness. Together, they provide comprehensive hair loss prevention and regrowth.",
  expected_timeline:
    "Initial stabilization of hair loss occurs within 3-6 months. New hair growth typically begins around month 4-6, with significant improvement visible by month 8-12. Maximum benefits are usually achieved after 12-18 months of consistent use.",
  ingredients: [
    {
      name: "Minoxidil",
      dosage: "5%",
      description:
        "Vasodilator that increases blood flow to hair follicles, promoting growth and preventing miniaturization.",
    },
    {
      name: "Finasteride",
      dosage: "0.1%",
      description:
        "5α-reductase inhibitor that blocks DHT production, preventing further hair loss at the hormonal level.",
    },
    {
      name: "Propylene Glycol",
      dosage: "20%",
      description: "Enhanced penetration enhancer for optimal absorption of active ingredients.",
    },
    {
      name: "Ethanol",
      dosage: "50%",
      description: "Solvent system optimized for dual-drug delivery and rapid drying.",
    },
  ],
  side_effects: [
    "Mild scalp irritation or dryness",
    "Temporary increase in hair shedding (first 2-8 weeks)",
    "Rare: decreased libido (less than 2% of users)",
    "Rare: breast tenderness",
    "Contact dermatitis (uncommon)",
  ],
  contraindications: [
    "Women of childbearing age",
    "Pregnancy or breastfeeding",
    "Under 18 years of age",
    "Known hypersensitivity to finasteride or minoxidil",
    "Liver disease or dysfunction",
    "Prostate cancer",
  ],
  warnings: [
    "Prescription medication - medical supervision required",
    "For external use only - avoid contact with eyes",
    "Wash hands thoroughly after application",
    "Women should not handle crushed or broken components",
    "Discontinue if severe side effects occur",
    "Regular monitoring recommended during first 6 months",
  ],
  clinical_studies: [
    {
      title: "Combination Therapy Efficacy Study",
      description: "24-month study showing 94% of men maintained or increased hair count with combination therapy",
      efficacy_rate: 94,
      study_url: "#",
    },
    {
      title: "Topical Finasteride Safety Profile",
      description: "Reduced systemic absorption compared to oral finasteride while maintaining efficacy",
      efficacy_rate: 87,
      study_url: "#",
    },
    {
      title: "DHT Suppression Analysis",
      description: "Significant reduction in scalp DHT levels with minimal systemic effects",
      efficacy_rate: 76,
      study_url: "#",
    },
  ],
  faqs: [
    {
      question: "How is this different from using minoxidil alone?",
      answer:
        "The combination addresses hair loss from two angles: minoxidil stimulates growth while finasteride prevents further loss by blocking DHT. Studies show combination therapy is significantly more effective than either treatment alone.",
    },
    {
      question: "Do I need a prescription for this product?",
      answer:
        "Yes, this is a prescription medication that requires consultation with one of our licensed physicians. Finasteride requires medical supervision and monitoring.",
    },
    {
      question: "Are there fewer side effects compared to oral finasteride?",
      answer:
        "Yes, topical application significantly reduces systemic absorption, leading to fewer side effects while maintaining therapeutic effectiveness at the scalp level.",
    },
    {
      question: "How long before I see results?",
      answer:
        "Most patients notice reduced hair loss within 3-4 months. New growth typically becomes visible around month 6, with optimal results achieved after 12-18 months of consistent use.",
    },
    {
      question: "Can I use this with other hair products?",
      answer:
        "Wait at least 4 hours after application before using styling products. Avoid harsh shampoos or treatments that might interfere with absorption. Consult your physician about other hair treatments.",
    },
    {
      question: "What happens if I miss applications?",
      answer:
        "Consistency is key for optimal results. If you miss a dose, apply as soon as you remember, but don't double up. Missing occasional applications won't significantly impact long-term results.",
    },
  ],
}

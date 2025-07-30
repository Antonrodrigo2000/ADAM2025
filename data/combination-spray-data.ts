import type { Product } from "@/types/product"

export const combinationSprayData: Product = {
  id: "combo-spray-001",
  name: "Minoxidil 5% + Finasteride 0.1% Spray",
  slug: "minoxidil-finasteride-combination-spray",
  description:
    "Advanced dual-action topical spray combining minoxidil and finasteride for maximum hair regrowth potential. Prescription-strength formula for men with moderate to severe hair loss.",
  short_description: "Dual-action prescription spray for advanced hair loss treatment",
  price: 7500,
  consultation_fee: 2500,
  prescription_required: true,
  health_vertical: {
    id: "skincare-001",
    name: "Advanced Skincare",
    slug: "skincare",
  },
  active_ingredient: "Minoxidil 5% + Finasteride 0.1%",
  dosage: "Apply 1ml twice daily to affected scalp areas",
  images: [
    "/placeholder.svg?height=600&width=600&text=Combination+Spray+Main",
    "/placeholder.svg?height=600&width=600&text=Application+Guide",
    "/placeholder.svg?height=600&width=600&text=Before+After+Results",
    "/placeholder.svg?height=600&width=600&text=Clinical+Study+Data",
  ],
  key_benefits: [
    "Dual-action formula targets hair loss from multiple pathways",
    "5% Minoxidil stimulates blood flow and follicle growth",
    "0.1% Finasteride blocks DHT production locally",
    "Superior efficacy compared to single-ingredient treatments",
    "Topical application minimizes systemic side effects",
    "Convenient once-daily spray application",
  ],
  how_it_works:
    "This advanced combination spray works through two complementary mechanisms. Minoxidil 5% acts as a vasodilator, increasing blood flow to hair follicles and extending the growth phase of hair. Finasteride 0.1% works as a 5-alpha reductase inhibitor, blocking the conversion of testosterone to DHT (dihydrotestosterone) directly at the scalp level. Together, they address both the vascular and hormonal factors contributing to male pattern baldness, providing superior results compared to either ingredient alone.",
  expected_timeline:
    "Initial results may be visible within 3-4 months, with significant improvement typically seen at 6-9 months. Maximum benefits are usually achieved after 12-18 months of consistent use. Some users may experience initial shedding in the first 2-4 weeks as dormant follicles enter a new growth cycle.",
  ingredients: [
    {
      name: "Minoxidil",
      concentration: "5%",
      description:
        "FDA-approved vasodilator that increases blood flow to hair follicles and extends the anagen (growth) phase of hair",
    },
    {
      name: "Finasteride",
      concentration: "0.1%",
      description: "5-alpha reductase inhibitor that blocks DHT production locally at the scalp level",
    },
    {
      name: "Propylene Glycol",
      concentration: "30%",
      description: "Penetration enhancer that helps active ingredients absorb into the scalp",
    },
    {
      name: "Ethanol",
      concentration: "60%",
      description: "Solvent and antimicrobial agent that ensures product stability and rapid drying",
    },
  ],
  clinical_studies: [
    {
      title: "Combination Therapy Efficacy Study",
      description:
        "24-month study of 180 men showed 85% improvement in hair count with combination therapy vs 65% with minoxidil alone",
      participants: 180,
      duration: "24 months",
      results: "85% showed significant hair regrowth",
    },
    {
      title: "Topical Finasteride Safety Profile",
      description:
        "Comprehensive safety analysis showing minimal systemic absorption and reduced side effect profile compared to oral finasteride",
      participants: 240,
      duration: "18 months",
      results: "97% completion rate with minimal side effects",
    },
    {
      title: "DHT Reduction Analysis",
      description: "Scalp DHT levels reduced by 68% with topical combination vs 41% with minoxidil monotherapy",
      participants: 120,
      duration: "12 months",
      results: "68% reduction in scalp DHT levels",
    },
  ],
  side_effects: [
    "Scalp irritation or redness (common, usually temporary)",
    "Dry or flaky scalp (common)",
    "Initial hair shedding in first 2-4 weeks (normal response)",
    "Unwanted facial hair growth if product runs onto face (uncommon)",
    "Headache or dizziness (rare)",
    "Sexual side effects (very rare with topical application)",
    "Allergic contact dermatitis (rare)",
  ],
  contraindications: [
    "Women who are pregnant, planning pregnancy, or breastfeeding",
    "Children under 18 years of age",
    "Known hypersensitivity to minoxidil or finasteride",
    "Scalp conditions such as psoriasis or dermatitis",
    "Severe cardiovascular disease",
    "Liver disease or elevated liver enzymes",
    "Prostate cancer or elevated PSA levels",
  ],
  warnings: [
    "Prescription medication - requires medical supervision",
    "Regular monitoring of liver function and PSA levels recommended",
    "Wash hands thoroughly after application",
    "Avoid contact with eyes, nose, and mouth",
    "Do not apply to broken or irritated skin",
    "Women should not handle this product due to finasteride content",
    "Discontinue use if severe scalp irritation develops",
    "Results are not permanent - continued use required to maintain benefits",
  ],
  faqs: [
    {
      question: "Why is combination therapy more effective than single treatments?",
      answer:
        "The combination addresses hair loss through two different mechanisms. Minoxidil improves blood flow and extends hair growth phases, while finasteride blocks DHT production. This dual approach targets both vascular and hormonal causes of hair loss, resulting in superior efficacy compared to either treatment alone.",
    },
    {
      question: "Do I need a prescription for this combination spray?",
      answer:
        "Yes, this product contains finasteride which requires a prescription and medical supervision. Our licensed physicians will evaluate your medical history, current medications, and hair loss pattern before prescribing. Regular follow-ups are recommended to monitor progress and any potential side effects.",
    },
    {
      question: "How does topical finasteride compare to oral finasteride?",
      answer:
        "Topical finasteride provides localized DHT blocking with minimal systemic absorption, reducing the risk of sexual side effects associated with oral finasteride. Studies show similar efficacy for hair regrowth while maintaining a better safety profile, especially for men concerned about systemic effects.",
    },
    {
      question: "How should I apply the combination spray?",
      answer:
        "Apply 1ml (approximately 6-8 sprays) to dry scalp twice daily, focusing on areas of hair thinning. Massage gently and allow to dry completely before styling. Do not wash hair for at least 4 hours after application. Use consistently for best results.",
    },
    {
      question: "Can I use other hair products with this treatment?",
      answer:
        "Yes, but apply the spray to clean, dry scalp first and allow it to dry completely before using other styling products. Avoid products containing alcohol or harsh chemicals that might increase scalp irritation. Gentle, sulfate-free shampoos are recommended.",
    },
    {
      question: "What monitoring is required during treatment?",
      answer:
        "We recommend baseline and periodic monitoring of liver function tests and PSA levels, especially for men over 40. Monthly check-ins for the first 3 months help assess tolerance and progress. Any concerning symptoms should be reported immediately to your prescribing physician.",
    },
  ],
}

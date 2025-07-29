// Sample product data to test your product detail page
export const sampleProduct = {
  id: "550e8400-e29b-41d4-a716-446655440011",
  name: "ADAM Hair Growth Treatment - Finasteride 1mg",
  description:
    "Clinically proven treatment for male pattern baldness. Our prescription-strength finasteride helps block DHT, the hormone responsible for hair loss, allowing your natural hair growth cycle to resume.",
  active_ingredient: "Finasteride",
  dosage: "1mg daily",
  price: 4500.0,
  consultation_fee: 2000.0,
  prescription_required: true,
  health_vertical_id: "550e8400-e29b-41d4-a716-446655440001",
  images: [
    "/placeholder.svg?height=400&width=400&text=Finasteride+Bottle",
    "/placeholder.svg?height=400&width=400&text=Application+Guide",
    "/placeholder.svg?height=400&width=400&text=Before+After",
    "/placeholder.svg?height=400&width=400&text=Clinical+Results",
  ],
  rating: 4.8,
  review_count: 324,
  benefits: [
    "Clinically proven to stop hair loss in 83% of men",
    "Regrow hair in 65% of users within 12 months",
    "FDA-approved active ingredient",
    "Convenient once-daily oral tablet",
  ],
  how_it_works:
    "Finasteride works by blocking the enzyme 5-alpha reductase, which converts testosterone to DHT. By reducing DHT levels, finasteride helps prevent further hair loss and can stimulate regrowth of dormant hair follicles.",
  timeline:
    "Most men see results within 3-6 months of consistent use. Peak effectiveness typically occurs at 12-24 months.",
  side_effects: [
    "Decreased libido (2-3% of users)",
    "Erectile dysfunction (1-2% of users)",
    "Decreased ejaculate volume (1% of users)",
    "Breast tenderness (rare)",
  ],
  contraindications: [
    "Women who are pregnant or may become pregnant",
    "Children under 18 years of age",
    "Known hypersensitivity to finasteride",
  ],
  health_verticals: {
    name: "Hair Loss Treatment",
    slug: "hair-loss",
  },
  faqs: [
    {
      question: "How long do I need to take finasteride?",
      answer: "Finasteride is most effective when used long-term. Hair loss will resume if treatment is discontinued.",
    },
    {
      question: "Can I take finasteride with other medications?",
      answer:
        "Finasteride has few drug interactions, but always consult with your physician about all medications you're taking.",
    },
    {
      question: "Is generic finasteride as effective as brand name?",
      answer:
        "Yes, generic finasteride contains the same active ingredient and is equally effective as brand-name versions.",
    },
  ],
  reviews: [
    {
      id: 1,
      rating: 5,
      review_text:
        "Started seeing results after 4 months. My hairline has definitely improved and I feel much more confident.",
      author: "Rohan K.",
      verified_purchase: true,
      created_at: "2024-01-15",
    },
    {
      id: 2,
      rating: 4,
      review_text: "Good results but took longer than expected. Customer service was excellent throughout the process.",
      author: "Dinesh P.",
      verified_purchase: true,
      created_at: "2024-01-10",
    },
  ],
}

// Sample categories data
export const sampleCategories = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Hair Loss Treatment",
    slug: "hair-loss",
    description: "Comprehensive hair loss treatment and prevention solutions",
    product_count: 4,
    starting_price: 2800,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Sexual Health",
    slug: "sexual-health",
    description: "Discreet and effective treatments for erectile dysfunction and performance",
    product_count: 6,
    starting_price: 3200,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Skincare",
    slug: "skincare",
    description: "Dermatologist-approved skincare treatments for men",
    product_count: 8,
    starting_price: 2400,
  },
]

// Sample related products
export const sampleRelatedProducts = [
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    name: "ADAM Hair Growth Treatment - Minoxidil 5%",
    price: 3200.0,
    consultation_fee: 1500.0,
    rating: 4.6,
    review_count: 189,
    prescription_required: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440014",
    name: "Hair Health Supplements",
    price: 2800.0,
    consultation_fee: 0.0,
    rating: 4.4,
    review_count: 156,
    prescription_required: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440013",
    name: "ADAM Complete Hair Care Kit",
    price: 6800.0,
    consultation_fee: 2500.0,
    rating: 4.9,
    review_count: 98,
    prescription_required: true,
  },
]

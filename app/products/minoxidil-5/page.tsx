import { ProductPage } from "@/components/products/product-page"

const product = {
  id: 1,
  slug: "minoxidil-5",
  name: "Topical Finasteride & Minoxidil Spray",
  badge: "#1 customer favorite",
  description:
    "A 2-in-1 spray to treat hair loss and regrow new hair, made with two clinically proven ingredients. It's a no pill option to treat hair loss and our best selling treatment for a reason.",
  mainImage: "/placeholder.svg?height=600&width=600&text=Minoxidil+Spray",
  thumbnails: [
    "/placeholder.svg?height=80&width=80&text=Front",
    "/placeholder.svg?height=80&width=80&text=Back",
    "/placeholder.svg?height=80&width=80&text=Side",
    "/placeholder.svg?height=80&width=80&text=Top",
    "/placeholder.svg?height=80&width=80&text=Hand",
  ],
  sections: [
    {
      id: "meet-spray",
      title: "Meet the 2-in-1 spray",
      content:
        "This innovative spray combines two FDA-approved ingredients in one convenient application. Finasteride blocks DHT production at the scalp level while Minoxidil stimulates blood flow to hair follicles, creating the optimal environment for hair regrowth. The topical delivery system ensures maximum effectiveness with minimal systemic absorption.",
    },
    {
      id: "how-it-works",
      title: "How it works",
      content:
        "Apply 6-8 sprays directly to affected areas of dry scalp twice daily. Massage gently with fingertips and allow to dry completely before styling. The dual-action formula works by blocking DHT (the hormone responsible for hair loss) while simultaneously increasing blood circulation to dormant hair follicles. Most users see initial results within 3-4 months of consistent use.",
    },
    {
      id: "ingredients",
      title: "Ingredients",
      content:
        "Active ingredients: Finasteride 0.25%, Minoxidil 6%. Inactive ingredients: Propylene glycol (penetration enhancer), ethanol (solvent), purified water, sodium hydroxide (pH adjuster). This pharmaceutical-grade formulation is compounded in FDA-registered facilities following strict quality standards.",
    },
    {
      id: "shipping",
      title: "Shipping restrictions",
      content:
        "Due to U.S. Department of Transportation regulations, certain items, including alcohol-based products have shipping restrictions to military addresses. We regret that we are not able to offer shipping to APO, FPO, or Military addresses on orders with restricted items.",
      expanded: true,
    },
  ],
  disclaimer:
    "Topical Finasteride & Minoxidil Spray is a compounded product and has not been approved by the FDA. The FDA does not verify the safety or effectiveness of compounded drugs. Only available if prescribed after an online consultation with a healthcare provider.",
  footnote: "*Based on separate individual studies of oral minoxidil and oral finasteride.",
}

export default function MinoxidilProductPage() {
  return <ProductPage product={product} />
}

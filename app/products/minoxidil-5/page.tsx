import { ProductPage } from "@/components/products/product-page"

const minoxidilProduct = {
  id: 1,
  slug: "minoxidil-5",
  name: "Topical Finasteride & Minoxidil Spray",
  badge: "#1 customer favorite",
  description:
    "A 2-in-1 spray to treat hair loss and regrow new hair, made with two clinically proven ingredients. It's a no pill option to treat hair loss and our best selling treatment for a reason.",
  mainImage: "/placeholder.svg?height=600&width=600",
  thumbnails: [
    "/placeholder.svg?height=100&width=100",
    "/placeholder.svg?height=100&width=100",
    "/placeholder.svg?height=100&width=100",
    "/placeholder.svg?height=100&width=100",
    "/placeholder.svg?height=100&width=100",
  ],
  sections: [
    {
      id: "meet-spray",
      title: "Meet the 2-in-1 spray",
      content:
        "Our topical spray combines finasteride and minoxidil in one easy-to-use formula. Finasteride blocks DHT production to prevent further hair loss, while minoxidil stimulates blood flow to hair follicles to promote regrowth. Together, they provide comprehensive hair loss treatment without the need for daily pills.",
      expanded: false,
    },
    {
      id: "how-it-works",
      title: "How it works",
      content:
        "Apply 6 sprays to affected areas of your scalp twice daily. The topical formula is absorbed directly into the scalp, targeting hair follicles where it's needed most. Most customers see initial results within 3-4 months of consistent use, with continued improvement over time.",
      expanded: false,
    },
    {
      id: "ingredients",
      title: "Ingredients",
      content:
        "Active ingredients: Finasteride 0.25%, Minoxidil 6%. Inactive ingredients: Propylene glycol, ethanol, purified water. This compounded formulation is made in FDA-registered facilities following strict quality standards.",
      expanded: false,
    },
    {
      id: "shipping-restrictions",
      title: "Shipping restrictions",
      content:
        "Due to U.S. Department of Transportation regulations, certain items, including alcohol-based products have shipping restrictions to military addresses. We regret that we are not able to offer shipping to APO, FPO, DPO, or Military addresses on orders with restricted items.",
      expanded: true,
    },
  ],
  disclaimer:
    "Topical Finasteride & Minoxidil Spray is a compounded product and has not been approved by the FDA. The FDA does not verify the safety or effectiveness of compounded drugs. Only available if prescribed after an online consultation with a healthcare provider.",
  footnote: "*Based on separate individual studies of oral minoxidil and oral finasteride.",
}

export default function MinoxidilProductPage() {
  return <ProductPage product={minoxidilProduct} />
}

import { notFound } from "next/navigation"

// Mock product data - replace with Supabase later
const mockProducts = {
  "finasteride-1mg": {
    id: "1",
    name: "ADAM Hair Growth Treatment - Finasteride 1mg",
    slug: "finasteride-1mg",
    description:
      "Clinically proven treatment for male pattern baldness. Our prescription-strength finasteride helps block DHT, the hormone responsible for hair loss.",
    active_ingredient: "Finasteride",
    dosage: "1mg daily",
    price: 4500.0,
    consultation_fee: 2000.0,
    prescription_required: true,
    rating: 4.8,
    review_count: 324,
    images: [
      "/placeholder.svg?height=400&width=400&text=Finasteride+1mg",
      "/placeholder.svg?height=400&width=400&text=Application+Guide",
      "/placeholder.svg?height=400&width=400&text=Before+After",
    ],
    benefits: [
      "Clinically proven to stop hair loss in 83% of men",
      "Regrow hair in 65% of users within 12 months",
      "FDA-approved active ingredient",
      "Convenient once-daily oral tablet",
    ],
    category: {
      name: "Hair Loss Treatment",
      slug: "hair-loss",
    },
  },
  "minoxidil-5": {
    id: "2",
    name: "ADAM Hair Growth Treatment - Minoxidil 5%",
    slug: "minoxidil-5",
    description: "Topical solution to stimulate hair growth and improve scalp circulation.",
    active_ingredient: "Minoxidil",
    dosage: "5% solution twice daily",
    price: 3200.0,
    consultation_fee: 1500.0,
    prescription_required: false,
    rating: 4.6,
    review_count: 189,
    images: [
      "/placeholder.svg?height=400&width=400&text=Minoxidil+5%",
      "/placeholder.svg?height=400&width=400&text=Application+Guide",
    ],
    benefits: [
      "Stimulates hair follicles",
      "Improves scalp blood circulation",
      "Available without prescription",
      "Twice daily application",
    ],
    category: {
      name: "Hair Loss Treatment",
      slug: "hair-loss",
    },
  },
  "hair-supplements": {
    id: "3",
    name: "Hair Health Supplements",
    slug: "hair-supplements",
    description: "Vitamin and mineral supplements specifically formulated for hair health.",
    active_ingredient: "Biotin, Zinc, Iron",
    dosage: "2 capsules daily",
    price: 2800.0,
    consultation_fee: 0.0,
    prescription_required: false,
    rating: 4.4,
    review_count: 156,
    images: ["/placeholder.svg?height=400&width=400&text=Hair+Supplements"],
    benefits: [
      "Supports healthy hair growth",
      "Rich in essential vitamins",
      "No prescription required",
      "Easy daily supplementation",
    ],
    category: {
      name: "Hair Loss Treatment",
      slug: "hair-loss",
    },
  },
}

interface PageProps {
  params: {
    slug: string
  }
}

// Component for the product page
function ProductDetail({ product }: { product: any }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="text-sm">
            <span className="text-gray-500">Home</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-500">{product.category.name}</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg border overflow-hidden">
              <img
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.slice(1).map((image: string, index: number) => (
                <div key={index} className="aspect-square bg-white rounded-lg border overflow-hidden">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 pt-4">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Licensed Physicians</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Discreet Packaging</span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">2-Day Consultation</span>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.review_count} reviews)
                </span>
              </div>
            </div>

            {/* Prescription Badge */}
            {product.prescription_required && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-amber-800 font-medium">Prescription Required</span>
                </div>
                <p className="text-amber-700 text-sm mt-1">
                  This treatment requires a consultation with our licensed physicians.
                </p>
              </div>
            )}

            {/* Pricing */}
            <div className="bg-white border rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Treatment (monthly)</span>
                  <span className="font-semibold">LKR {product.price.toLocaleString()}</span>
                </div>
                {product.consultation_fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation (one-time)</span>
                    <span className="font-semibold">LKR {product.consultation_fee.toLocaleString()}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>First order total</span>
                  <span>LKR {(product.price + product.consultation_fee).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Key Benefits</h3>
              <ul className="space-y-2">
                {product.benefits.map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {product.prescription_required ? (
                <>
                  <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Start Consultation
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Learn More
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Add to Cart
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Buy Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="py-2 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600">
                Overview
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Ingredients
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Reviews
              </button>
            </nav>
          </div>

          <div className="py-8">
            <div className="prose max-w-none">
              <h3>About this treatment</h3>
              <p>{product.description}</p>

              <h4>Active Ingredient</h4>
              <p>
                <strong>{product.active_ingredient}</strong> - {product.dosage}
              </p>

              <h4>How to use</h4>
              <p>Take as prescribed by your physician. {product.dosage}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main page component
export default function ProductPage({ params }: PageProps) {
  const product = mockProducts[params.slug as keyof typeof mockProducts]

  if (!product) {
    notFound()
  }

  return <ProductDetail product={product} />
}

// Generate static params for known products (optional)
export function generateStaticParams() {
  return Object.keys(mockProducts).map((slug) => ({
    slug: slug,
  }))
}

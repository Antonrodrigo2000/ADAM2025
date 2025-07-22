"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

interface ProductImage {
  src: string
  alt: string
}

interface ProductVariant {
  id: string
  name: string
  type: "subscription" | "one-time"
  originalPrice?: number
  price: number
  frequency?: string
}

interface ProductOption {
  id: string
  name: string
  label: string
}

interface ProductPageProps {
  category: string
  title: string
  subtitle?: string
  description: string
  images: ProductImage[]
  variants: ProductVariant[]
  options?: ProductOption[]
  defaultVariant?: string
  defaultOption?: string
  requiresConsultation?: boolean
  howItWorks?: string
  aboutTreatment?: string
}

export default function ProductPage({
  category,
  title,
  subtitle,
  description,
  images,
  variants,
  options = [],
  defaultVariant,
  defaultOption,
  requiresConsultation = false,
  howItWorks,
  aboutTreatment,
}: ProductPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant || variants[0]?.id)
  const [selectedOption, setSelectedOption] = useState(defaultOption || options[0]?.id)
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)

  const currentVariant = variants.find((v) => v.id === selectedVariant)
  const isSubscription = currentVariant?.type === "subscription"

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Carousel - Left Side */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={images[currentImageIndex]?.src || "/placeholder.svg?height=600&width=600"}
                alt={images[currentImageIndex]?.alt || "Product image"}
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      index === currentImageIndex ? "border-black" : "border-gray-200"
                    }`}
                  >
                    <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information - Right Side */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">{category}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              {subtitle && <p className="text-sm text-gray-600 font-medium mb-4">{subtitle}</p>}
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>

            {/* Subscription Plan */}
            {isSubscription && currentVariant && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Your Subscription Plan:</h3>
                <p className="text-sm text-gray-600">{currentVariant.frequency || "Ships every 3 months"}</p>
              </div>
            )}

            {/* Pricing */}
            <div className="space-y-4">
              <RadioGroup value={selectedVariant} onValueChange={setSelectedVariant}>
                {variants.map((variant) => (
                  <div key={variant.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={variant.id} id={variant.id} />
                    <Label htmlFor={variant.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{variant.name}</span>
                        <div className="flex items-center space-x-2">
                          {variant.originalPrice && (
                            <span className="text-gray-500 line-through text-sm">${variant.originalPrice}</span>
                          )}
                          <span className="font-bold text-lg">
                            ${variant.price}
                            {variant.type === "subscription" ? "/mo" : ""}
                          </span>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Product Options */}
            {options.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">SELECT TYPE:</Label>
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  <div className="flex space-x-4">
                    {options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button className="w-full bg-black hover:bg-gray-800 text-white py-3 text-base font-medium">
              ADD TO CART
            </Button>

            {/* Consultation Notice */}
            {requiresConsultation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Rx</span> This treatment requires a free online consultation with a
                  medical provider.
                </p>
              </div>
            )}

            {/* Collapsible Sections */}
            <div className="space-y-4 border-t pt-6">
              {howItWorks && (
                <Collapsible open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-left">
                    <span className="font-medium text-gray-900">HOW IT WORKS</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isHowItWorksOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pb-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{howItWorks}</p>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {aboutTreatment && (
                <Collapsible open={isAboutOpen} onOpenChange={setIsAboutOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-left border-t">
                    <span className="font-medium text-gray-900">ABOUT THIS TREATMENT</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isAboutOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pb-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{aboutTreatment}</p>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

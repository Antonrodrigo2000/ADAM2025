"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Check, Truck, Shield, Clock } from "lucide-react"
import { useCart } from "@/contexts"
import { useToast } from "@/hooks/use-toast"

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
  const { actions: cartActions } = useCart()
  const { toast } = useToast()
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant || variants[0]?.id)
  const [selectedOption, setSelectedOption] = useState(defaultOption || options[0]?.id)
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  
  const handleAddToCart = () => {
    const variant = variants.find(v => v.id === selectedVariant)
    const option = options.find(o => o.id === selectedOption)
    
    if (!variant) return
    
    const cartItem = {
      productId: `${category.toLowerCase().replace(/\s+/g, '-')}-${title.toLowerCase().replace(/\s+/g, '-')}`,
      variantId: variant.id,
      productName: title,
      variantName: variant.name,
      price: variant.price,
      originalPrice: variant.originalPrice,
      quantity: 1,
      subscription: variant.type === 'subscription' ? {
        frequency: variant.frequency || 'Monthly',
        isActive: true
      } : undefined,
      selectedOptions: option ? { format: option.name } : undefined,
      image: images[0]?.src
    }
    
    cartActions.addItem(cartItem)
    
    // Show success notification
    toast({
      title: 'Added to Cart',
      description: `${title} has been added to your cart`
    })
  }

  const currentVariant = variants.find((v) => v.id === selectedVariant)
  const isSubscription = currentVariant?.type === "subscription"

  const calculateSavings = () => {
    if (!currentVariant?.originalPrice) return null
    const savings = currentVariant.originalPrice - currentVariant.price
    const percentage = Math.round((savings / currentVariant.originalPrice) * 100)
    return { amount: savings, percentage }
  }

  const savings = calculateSavings()

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Carousel - Left Side */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative group">
              <img
                src={images[currentImageIndex]?.src || "/placeholder.svg?height=600&width=600"}
                alt={images[currentImageIndex]?.alt || "Product image"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Navigation arrows for mobile */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1)
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg lg:hidden"
                  >
                    <ChevronDown className="w-5 h-5 rotate-90" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg lg:hidden"
                  >
                    <ChevronDown className="w-5 h-5 -rotate-90" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail navigation */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? "border-black shadow-md" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Product benefits - Desktop only */}
            <div className="hidden lg:block space-y-4 pt-6">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Truck className="w-5 h-5" />
                <span>Free shipping on all orders</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="w-5 h-5" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Clock className="w-5 h-5" />
                <span>Results typically seen in 2-4 months</span>
              </div>
            </div>
          </div>

          {/* Product Information - Right Side */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{category}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">{title}</h1>
              {subtitle && (
                <p className="text-base text-gray-600 font-medium mb-4 bg-gray-50 px-3 py-2 rounded-lg inline-block">
                  {subtitle}
                </p>
              )}
              <p className="text-gray-700 leading-relaxed text-lg">{description}</p>
            </div>

            {/* Pricing Options */}
            <div className="space-y-4 bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 text-lg mb-4">Choose Your Plan:</h3>
              <RadioGroup value={selectedVariant} onValueChange={setSelectedVariant} className="space-y-3">
                {variants.map((variant) => {
                  const variantSavings = variant.originalPrice ? variant.originalPrice - variant.price : 0
                  const isPopular = variant.type === "subscription" && variant.frequency?.includes("3 months")

                  return (
                    <div
                      key={variant.id}
                      className={`relative rounded-xl border-2 p-4 transition-all ${
                        selectedVariant === variant.id
                          ? "border-black bg-white shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-4 bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </div>
                      )}
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={variant.id} id={variant.id} />
                        <Label htmlFor={variant.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{variant.name}</div>
                              {variant.frequency && (
                                <div className="text-sm text-gray-600 mt-1">{variant.frequency}</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                {variant.originalPrice && (
                                  <span className="text-gray-400 line-through text-sm">${variant.originalPrice}</span>
                                )}
                                <span className="font-bold text-xl text-gray-900">
                                  ${variant.price}
                                  {variant.type === "subscription" ? "/mo" : ""}
                                </span>
                              </div>
                              {variantSavings > 0 && (
                                <div className="text-green-600 text-sm font-medium">Save ${variantSavings}</div>
                              )}
                            </div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>

            {/* Product Options */}
            {options.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">Select Format:</Label>
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  <div className="flex space-x-4">
                    {options.map((option) => (
                      <div
                        key={option.id}
                        className={`flex-1 border-2 rounded-xl p-4 transition-all ${
                          selectedOption === option.id
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="cursor-pointer font-medium">
                            {option.label}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="space-y-4">
              <Button 
                onClick={handleAddToCart}
                className="w-full bg-black hover:bg-gray-800 text-white py-4 text-lg font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                ADD TO CART
                {savings && (
                  <span className="ml-2 bg-white/20 px-2 py-1 rounded-md text-sm">Save {savings.percentage}%</span>
                )}
              </Button>

              {isSubscription && (
                <p className="text-center text-sm text-gray-600">Cancel or modify anytime • No commitment required</p>
              )}
            </div>

            {/* Consultation Notice */}
            {requiresConsultation && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Prescription Required:</span> This treatment requires a free online
                    consultation with a licensed medical provider.
                  </p>
                </div>
              </div>
            )}

            {/* Mobile benefits */}
            <div className="lg:hidden space-y-3 pt-4 border-t">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Truck className="w-5 h-5" />
                <span>Free shipping on all orders</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="w-5 h-5" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Clock className="w-5 h-5" />
                <span>Results typically seen in 2-4 months</span>
              </div>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-1 border-t pt-6">
              {howItWorks && (
                <Collapsible open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-4 text-left hover:bg-gray-50 rounded-lg px-4 transition-colors">
                    <span className="font-semibold text-gray-900 text-base">HOW TO USE</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isHowItWorksOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <p className="text-gray-700 leading-relaxed">{howItWorks}</p>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {aboutTreatment && (
                <Collapsible open={isAboutOpen} onOpenChange={setIsAboutOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-4 text-left hover:bg-gray-50 rounded-lg px-4 transition-colors">
                    <span className="font-semibold text-gray-900 text-base">ABOUT THIS TREATMENT</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isAboutOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <p className="text-gray-700 leading-relaxed">{aboutTreatment}</p>
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

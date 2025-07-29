"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, Shield, Truck, Clock } from "lucide-react"

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
  subtitle: string
  description: string
  images: ProductImage[]
  variants: ProductVariant[]
  options: ProductOption[]
  defaultVariant: string
  defaultOption: string
  requiresConsultation: boolean
  howItWorks: string
  aboutTreatment: string
}

export default function ProductPage({
  category,
  title,
  subtitle,
  description,
  images,
  variants,
  options,
  defaultVariant,
  defaultOption,
  requiresConsultation,
  howItWorks,
  aboutTreatment,
}: ProductPageProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant)
  const [selectedOption, setSelectedOption] = useState(defaultOption)

  const currentVariant = variants.find((v) => v.id === selectedVariant)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-50">
              <Image
                src={images[selectedImage].src || "/placeholder.svg"}
                alt={images[selectedImage].alt}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square relative overflow-hidden rounded-md bg-gray-50 border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3 text-xs font-medium">
                {category}
              </Badge>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{title}</h1>
              <p className="text-sm font-medium text-primary mb-4">{subtitle}</p>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>

            {/* Product Options */}
            {options.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Format</h3>
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="flex flex-wrap gap-3">
                  {options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="capitalize cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Pricing Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose Your Plan</h3>
              <RadioGroup value={selectedVariant} onValueChange={setSelectedVariant} className="space-y-3">
                {variants.map((variant) => (
                  <div key={variant.id} className="relative">
                    <RadioGroupItem value={variant.id} id={variant.id} className="sr-only" />
                    <Label
                      htmlFor={variant.id}
                      className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedVariant === variant.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{variant.name}</span>
                            {variant.type === "subscription" && (
                              <Badge variant="default" className="text-xs">
                                Most Popular
                              </Badge>
                            )}
                          </div>
                          {variant.frequency && <p className="text-sm text-gray-600">{variant.frequency}</p>}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            {variant.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">${variant.originalPrice}</span>
                            )}
                            <span className="text-xl font-bold text-gray-900">${variant.price}</span>
                          </div>
                          {variant.type === "subscription" && <p className="text-xs text-gray-600">per month</p>}
                        </div>
                      </div>
                      {selectedVariant === variant.id && (
                        <div className="absolute top-4 right-4">
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <Button size="lg" className="w-full text-lg py-6">
                {requiresConsultation ? "Start Consultation" : "Add to Cart"}
              </Button>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>FDA Approved</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>2-3 Day Delivery</span>
                </div>
              </div>
            </div>

            {/* Product Information Tabs */}
            <Tabs defaultValue="how-it-works" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="how-it-works" className="text-xs sm:text-sm">
                  How It Works
                </TabsTrigger>
                <TabsTrigger value="about" className="text-xs sm:text-sm">
                  About Treatment
                </TabsTrigger>
              </TabsList>
              <TabsContent value="how-it-works" className="mt-4">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h4 className="font-semibold mb-3">How to Use</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{howItWorks}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="about" className="mt-4">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h4 className="font-semibold mb-3">About This Treatment</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{aboutTreatment}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

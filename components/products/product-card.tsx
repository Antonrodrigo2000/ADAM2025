"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, CheckCircle, Clock } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    description: string
    price: number
    originalPrice: number
    primary_image: string | null
    images: Array<{
      id: string
      url: string
      alt_text: string
      is_primary: boolean
    }>
    category: {
      id: string
      name: string
      description: string
    }
    health_vertical: {
      name: string
      slug: string
    } | null
    rating: number
    review_count: number
    consultation_required: boolean
    consultation_fee: number
    active_ingredient: string
    dosage: string
    benefits: string[]
    in_stock: boolean
  }
  isRecommended?: boolean
}

export function ProductCard({ product, isRecommended }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const { actions } = useCart()

  const primaryImage = product.primary_image || product.images?.[0]?.url
  const hasDiscount = product.originalPrice > product.price

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking the button
    
    try {
      actions.addItem({
        productId: product.id,
        variantId: `${product.id}-standard`,
        productName: product.name,
        variantName: "Standard",
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: 1,
        subscription: undefined,
        selectedOptions: undefined,
        image: primaryImage || "/placeholder-product.png",
        months: 1,
        monthlyPrice: product.price,
        totalPrice: product.price,
        consultationFee: product.consultation_fee,
        consultationRequired: product.consultation_required
      })
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border overflow-hidden h-full flex flex-col">
      <Link href={`/products/${product.id}`} className="block flex-1">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Image */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {primaryImage && !imageError ? (
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true)
                  setImageLoading(false)
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl font-bold text-gray-300">
                  {product.name.charAt(0)}
                </div>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {isRecommended && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="destructive" className="text-xs">
                  Save £{(product.originalPrice - product.price).toFixed(2)}
                </Badge>
              )}
            </div>

            {/* Stock indicator */}
            {!product.in_stock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 flex-1 flex flex-col">
            {/* Health Vertical */}
            {product.health_vertical && (
              <Badge variant="outline" className="text-xs w-fit">
                {product.health_vertical.name}
              </Badge>
            )}

            {/* Title */}
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Active Ingredient */}
            {product.active_ingredient && (
              <p className="text-sm text-muted-foreground">
                {product.active_ingredient}
                {product.dosage && ` • ${product.dosage}`}
              </p>
            )}



            {/* Spacer to push pricing and button to bottom */}
            <div className="flex-1"></div>

            {/* Pricing */}
            <div className="space-y-1 mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">LKR {product.price.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    LKR {product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">per month</span>
              </div>
              
              {product.consultation_required && (
                <p className="text-xs text-muted-foreground">
                  + LKR 1,000 consultation fee
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Link>

      {/* Action Button - Outside Link to prevent navigation when clicking */}
      <div className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!product.in_stock}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </Card>
  )
}
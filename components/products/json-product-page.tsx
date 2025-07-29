"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Heart, Share2, Star, Truck, Shield, RotateCcw, Plus, Minus, Info } from "lucide-react"

interface Tax {
  id: string
  name: string
  code: string
  percentage: number
  applyOn: string
}

interface Category {
  id: string
  created: string
  updated: string
  name: string
  locationId: string
  companyId: string
  canDelete: boolean
  default: boolean
  productOrder: string[]
  description: string
  productCount: number
}

interface Product {
  id: string
  created: string
  updated: string
  name: string
  image: string[]
  categoryId: string
  description: string
  price: number
  locationId: string
  companyId: string
  currency: string
  taxes: Tax[]
  stockLevel: number
  showDetailView: boolean
  detailViewContent: string
  productUrl: string
  sku: string
  productSlug: string
  deductFromStockLevel: boolean
  category: Category
}

interface JsonProductPageProps {
  product: Product
}

export default function JsonProductPage({ product }: JsonProductPageProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  // Calculate total price including taxes
  const calculateTotalPrice = () => {
    let totalPrice = product.price * quantity
    product.taxes.forEach((tax) => {
      if (tax.applyOn === "PRODUCT") {
        totalPrice += (totalPrice * tax.percentage) / 100
      }
    })
    return totalPrice
  }

  const totalPrice = calculateTotalPrice()
  const isInStock = product.stockLevel > 0
  const isLowStock = product.stockLevel <= 5 && product.stockLevel > 0

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= product.stockLevel) {
      setQuantity(newQuantity)
    }
  }

  return (
    <div className="bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span>Home</span>
          <span>/</span>
          <span>{product.category.name}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border">
              <img
                src={product.image[selectedImageIndex] || "/placeholder.svg?height=600&width=600"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image Thumbnails */}
            {product.image.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.image.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex
                        ? "border-orange-500 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Category Badge */}
            <Badge variant="secondary" className="text-xs font-medium">
              {product.category.name}
            </Badge>

            {/* Product Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 text-sm">SKU: {product.sku}</p>
            </div>

            {/* Rating (Mock) */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.8) • 127 reviews</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">
                  {product.currency} {product.price.toFixed(2)}
                </span>
                {product.taxes.length > 0 && <span className="text-sm text-gray-500">+ taxes</span>}
              </div>

              {/* Tax Information */}
              {product.taxes.length > 0 && (
                <div className="text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Info className="w-4 h-4" />
                    <span>Includes {product.taxes.map((tax) => `${tax.name} (${tax.percentage}%)`).join(", ")}</span>
                  </div>
                  <div className="font-medium text-gray-900 mt-1">
                    Total: {product.currency} {totalPrice.toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
              {isInStock ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">
                    {isLowStock ? `Only ${product.stockLevel} left in stock` : "In Stock"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            {isInStock && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900">Quantity</label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stockLevel}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">{product.stockLevel} available</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold rounded-xl"
                  disabled={!isInStock}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl bg-transparent"
                    onClick={() => setIsFavorited(!isFavorited)}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>

                  <Button variant="outline" size="icon" className="rounded-xl bg-transparent">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {!isInStock && (
                <Button variant="outline" className="w-full py-3 rounded-xl bg-transparent">
                  Notify When Available
                </Button>
              )}
            </div>

            {/* Features */}
            <Card className="bg-gray-50 border-0">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Truck className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Free Shipping</div>
                      <div className="text-xs text-gray-600">On orders over $50</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Secure Payment</div>
                      <div className="text-xs text-gray-600">SSL encrypted</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <RotateCcw className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Easy Returns</div>
                      <div className="text-xs text-gray-600">30-day policy</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            {product.showDetailView && product.detailViewContent && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3">Product Details</h3>
                  <Separator className="mb-4" />
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700">{product.detailViewContent}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category Information */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">From {product.category.name}</h4>
                <p className="text-sm text-blue-800 mb-3">{product.category.description}</p>
                <div className="text-xs text-blue-700">{product.category.productCount} products in this category</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    <img
                      src="/placeholder.svg?height=200&width=200"
                      alt="Related product"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-medium text-sm mb-1">Related Product {i + 1}</h3>
                  <p className="text-orange-600 font-bold">
                    {product.currency} {(product.price * 0.8).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

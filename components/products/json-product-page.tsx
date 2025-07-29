"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Share2, Plus, Minus } from "lucide-react"

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
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-['Smooch_Sans']">{product.name}</h1>
              <p className="text-gray-600 text-sm">SKU: {product.sku}</p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900">
                  {product.currency}
                  {product.price.toFixed(2)}
                </span>
              </div>
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
                  className="flex-1 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white py-4 px-8 text-xl font-bold rounded-xl shadow-lg border-2 border-transparent hover:border-gray-300 hover:shadow-2xl transition-all duration-300 animate-pulse"
                  disabled={!isInStock}
                  style={{
                    boxShadow: "0 0 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <ShoppingCart className="w-6 h-6 mr-3" />
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
          </div>
        </div>
      </div>
    </div>
  )
}

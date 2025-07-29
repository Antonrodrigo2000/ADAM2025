"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Heart, Share2 } from "lucide-react"

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
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= product.stockLevel) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log(`Added ${quantity} of ${product.name} to cart`)
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.image[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {product.image.length > 1 && (
              <div className="flex space-x-2">
                {product.image.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-orange-500" : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`${product.name} view ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Title and Price */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "Smooch Sans, cursive" }}>
                {product.name}
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  {product.currency}
                  {product.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.stockLevel > 0 ? (
                <>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    In Stock
                  </Badge>
                  <span className="text-sm text-gray-600">{product.stockLevel} items available</span>
                </>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            {/* Product Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "Smooch Sans, cursive" }}>
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity Selector and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockLevel}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={product.stockLevel === 0}
                className="w-full py-4 px-8 text-xl font-semibold bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-gray-300 animate-pulse hover:animate-none"
                style={{
                  boxShadow: "0 0 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1)",
                }}
              >
                Add to Cart
              </Button>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                  <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              </div>
            </div>

            {/* Product Meta Information */}
            <div className="border-t pt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{product.category.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

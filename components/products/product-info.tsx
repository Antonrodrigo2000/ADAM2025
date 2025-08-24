"use client"

import { useState } from "react"
import { Shield, Truck, Clock, CheckCircle, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Product } from "@/data/types/product"
import { useCart } from "@/contexts/cart-context"

interface ProductInfoProps {
    product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
    const [quantity, setQuantity] = useState(1)
    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const { actions } = useCart()

    const totalPrice = product.price * quantity

    const handleAddToCart = async () => {
        setIsAddingToCart(true)

        try {
            actions.addItem({
                productId: product.id,
                variantId: `${product.id}-standard`,
                productName: product.name,
                variantName: "Standard",
                price: product.price,
                monthlyPrice: product.price,
                quantity: quantity,
                months: 1,
                totalPrice: totalPrice,
                consultationFee: 1000,
                prescriptionRequired: product.prescription_required,
                health_vertical_slug: product.health_vertical.slug,
                image: product.images?.[0]?.url || '',
            })

        } catch (error) {
            console.error('Failed to add to cart:', error)
        } finally {
            setIsAddingToCart(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Product Title & Category */}
            <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                    {product.health_vertical.name}
                </Badge>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
            </div>

            {/* Trust Elements */}
            <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-3">
                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Licensed physicians</span>
                </div>
                <div className="flex items-center space-x-3">
                    <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Discreet packaging</span>
                </div>
                <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>2-day consultation SLA</span>
                </div>
            </div>

            {/* Prescription Badge */}
            {product.prescription_required && (
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-blue-800">Prescription Required - Consultation Needed</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Price Breakdown */}
            <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-900">Price Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total price:</span>
                        <span className="font-semibold text-gray-900">LKR {totalPrice.toLocaleString()}</span>
                    </div>
                    {product.prescription_required && (
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Consultation:</span>
                            <span className="font-semibold text-gray-900">LKR 1,000 (1 time)</span>
                        </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="text-xl font-bold text-blue-600">LKR {(totalPrice + (product.prescription_required ? 1000 : 0)).toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Quantity Selector */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-gray-900">Quantity:</label>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity <= 1}
                    >
                        <Minus className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="text-lg font-semibold w-12 text-center text-gray-900">
                        {quantity}
                    </span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    >
                        <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="w-full py-6 text-lg font-semibold"
                    size="lg"
                >
                    {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
                </Button>
            </div>

            {/* Delivery Info */}
            <Card className="bg-gray-50/50">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <Truck className="w-4 h-4 text-gray-600" />
                            </div>
                            <span>Doorstep delivery</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <Clock className="w-4 h-4 text-gray-600" />
                            </div>
                            <span>2-3 day delivery</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

"use client"

import type React from "react"
import { Plus, CreditCard, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PaymentCard {
    id: string
    last4: string
    brand: string
    expiryMonth: number
    expiryYear: number
    isDefault: boolean
}

interface PaymentMethodsProps {
    paymentCards: PaymentCard[]
    selectedPaymentMethod: string | null
    onSelectPaymentMethod: (id: string) => void
    onAddCard: () => void
    isLoadingPayments: boolean
    user: any
}

export function PaymentMethods({ 
    paymentCards, 
    selectedPaymentMethod, 
    onSelectPaymentMethod, 
    onAddCard, 
    isLoadingPayments, 
    user 
}: PaymentMethodsProps) {
    const hasCards = paymentCards.length > 0

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                        2
                    </div>
                    <h2 className="text-xl font-semibold text-neutral-800">Payment method</h2>
                </div>
                {/* Top-right Add Card button - only shown when cards exist */}
                {hasCards && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-sm"
                        onClick={onAddCard}
                        disabled={!user}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Card
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {isLoadingPayments ? (
                    <div className="space-y-3">
                        <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ) : hasCards ? (
                    paymentCards.map((card) => (
                        <Card
                            key={card.id}
                            className={`p-4 cursor-pointer transition-all border ${selectedPaymentMethod === card.id
                                ? 'ring-2 ring-orange-500 bg-orange-50 border-orange-200 dark:bg-teal-950'
                                : 'hover:bg-gray-50 border-gray-200 dark:hover:bg-neutral-800'
                                }`}
                            onClick={() => onSelectPaymentMethod(card.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                        <CreditCard className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">•••• •••• •••• {card.last4}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {card.brand.toUpperCase()}
                                            </Badge>
                                            {card.isDefault && (
                                                <Badge variant="default" className="text-xs bg-orange-500 text-white">
                                                    Default
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                            Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                                        </p>
                                    </div>
                                </div>
                                {selectedPaymentMethod === card.id && (
                                    <Check className="w-5 h-5 text-orange-500" />
                                )}
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-sm text-orange-800 mb-4">No payment methods found. Please add a payment method to continue.</p>
                        {/* Bottom Add Payment Method button - only shown when no cards */}
                        <div className="flex justify-center">
                            <Button 
                                size="lg"
                                onClick={onAddCard}
                                variant={"default"}
                                disabled={!user}
                                className="w-full px-8"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Payment Method
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SinglePageCheckout } from "./single-page-checkout"
import { AddressPaymentView } from "./address-payment-view"
import { OrderSummary } from "./order-summary"
import { Header } from "@/components/layout/header"
import { useCart } from "@/contexts/cart-context"
import type { User } from "@/contexts/types"

type CheckoutStep = 'signup' | 'address_payment' | 'processing'

interface CheckoutState {
    step: CheckoutStep
    flowType?: 'signup_with_questionnaire' | 'signup_without_questionnaire' | 'authenticated_user'
    userId?: string
    isNewUser?: boolean
}

interface EnhancedCheckoutProps {
    user: User | null
    isAuthenticated: boolean
}

export function EnhancedCheckout({ user, isAuthenticated }: EnhancedCheckoutProps) {
    const [checkoutState, setCheckoutState] = useState<CheckoutState>({ step: 'signup' })
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { state: cartState } = useCart()

    // Set initial checkout state based on server-side auth
    useEffect(() => {
        if (isAuthenticated && user) {
            // For authenticated users, skip to address/payment
            setCheckoutState({
                step: 'address_payment',
                flowType: 'authenticated_user',
                userId: user.id,
                isNewUser: false
            })
        } else {
            // For unauthenticated users, start with signup
            setCheckoutState({
                step: 'signup',
                flowType: 'signup_without_questionnaire',
                isNewUser: true
            })
        }
    }, [isAuthenticated, user])

    // Handle signup completion from SinglePageCheckout
    const handleSignupComplete = (result: any) => {
        if (result.success) {
            setCheckoutState({
                step: 'address_payment',
                flowType: result.flowType,
                userId: result.userId,
                isNewUser: result.isNewUser
            })
        } else {
            setError(result.error || 'Signup failed')
        }
    }

    // Handle payment processing
    const handlePayNow = async (addressId?: string, paymentMethodId?: string) => {
        setIsProcessing(true)
        setError(null)

        try {
            // Here you would call your payment API
            const response = await fetch('/api/checkout/complete-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: checkoutState.userId,
                    addressId,
                    paymentMethodId,
                    cartItems: cartState.items,
                    cartTotal: cartState.total
                })
            })

            if (!response.ok) {
                throw new Error('Payment failed')
            }

            const result = await response.json()

            if (result.success) {
                // Redirect to success page or dashboard
                window.location.href = result.redirectUrl || '/dashboard'
            } else {
                throw new Error(result.error || 'Payment processing failed')
            }
        } catch (error) {
            console.error('Payment error:', error)
            setError(error instanceof Error ? error.message : 'Payment failed')
        } finally {
            setIsProcessing(false)
        }
    }


    return (
        <div className="min-h-screen bg-neutral-100">
            {/* Header */}
            <Header variant="light" />

            {/* Main Content - with top padding for fixed header */}
            <div className="container mx-auto px-3 py-5 pt-24">
                <div className="grid lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
                    {/* Left side - Checkout Flow */}
                    <div className="lg:col-span-2 space-y-5">
                        {error && (
                            <div className="neomorphic-container p-4">
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        )}

                        {checkoutState.step === 'signup' && (
                            <div className="space-y-5">
                                <SinglePageCheckout onComplete={handleSignupComplete} />
                            </div>
                        )}

                        {checkoutState.step === 'address_payment' && (
                            <AddressPaymentView
                                user={user}
                                onPayNow={handlePayNow}
                                isProcessing={isProcessing}
                            />
                        )}

                        {checkoutState.step === 'processing' && (
                            <div className="neomorphic-container p-4 md:p-5">
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                                    <h2 className="text-xl font-bold text-neutral-800 mb-2">Processing your order...</h2>
                                    <p className="text-neutral-600">Please wait while we complete your purchase.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right side - Order Summary (always visible) */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-5">
                            <OrderSummary />

                            {/* Flow Status Indicator */}
                            <div className="neomorphic-container p-4 mt-4">
                                <h3 className="text-sm font-semibold text-neutral-800 mb-3">Checkout Progress</h3>
                                <div className="space-y-2">
                                    <div className={`flex items-center space-x-2 ${checkoutState.step === 'signup' ? 'text-teal-600' :
                                        checkoutState.step === 'address_payment' || checkoutState.step === 'processing' ? 'text-green-600' : 'text-neutral-400'
                                        }`}>
                                        <div className={`w-4 h-4 rounded-full border-2 ${checkoutState.step === 'signup' ? 'border-teal-600 bg-teal-100' :
                                            checkoutState.step === 'address_payment' || checkoutState.step === 'processing' ? 'border-green-600 bg-green-600' : 'border-neutral-300'
                                            }`}></div>
                                        <span className="text-xs">
                                            {isAuthenticated ? 'Account Verified' : 'Account Setup'}
                                        </span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${checkoutState.step === 'address_payment' ? 'text-teal-600' :
                                        checkoutState.step === 'processing' ? 'text-green-600' : 'text-neutral-400'
                                        }`}>
                                        <div className={`w-4 h-4 rounded-full border-2 ${checkoutState.step === 'address_payment' ? 'border-teal-600 bg-teal-100' :
                                            checkoutState.step === 'processing' ? 'border-green-600 bg-green-600' : 'border-neutral-300'
                                            }`}></div>
                                        <span className="text-xs">Address & Payment</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${checkoutState.step === 'processing' ? 'text-teal-600' : 'text-neutral-400'
                                        }`}>
                                        <div className={`w-4 h-4 rounded-full border-2 ${checkoutState.step === 'processing' ? 'border-teal-600 bg-teal-100' : 'border-neutral-300'
                                            }`}></div>
                                        <span className="text-xs">Order Completion</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
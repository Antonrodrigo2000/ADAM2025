"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import type { User } from "@/contexts/types"
import { createClient } from "@/lib/supabase/client"
import { ConsultationWarning } from "./consultation-warning"
import { ConsultationValidationService, type ConsultationValidationResult } from "@/lib/services/consultation-validation"
import { CartEnrichmentService, type EnrichedCartItem } from "@/lib/services/cart-enrichment"
import { DeliveryAddress } from "./delivery-address"
import { PaymentMethods } from "./payment-methods"
import { PaymentAction } from "./payment-action"

interface Address {
    street: string
    city: string
    postcode: string
    country: string
}

interface PaymentCard {
    id: string
    last4: string
    brand: string
    expiryMonth: number
    expiryYear: number
    isDefault: boolean
}

interface CartItem {
    product_id: string
    quantity: number
    price: number
    productName?: string
    variantName?: string
    image?: string
    monthlyPrice?: number
    months?: number
    prescriptionRequired?: boolean
    consultationFee?: number
}

interface AddressPaymentViewProps {
    user: User | null
    cartItems?: CartItem[]
    sessionId?: string
    onPayNow: (addressId?: string, paymentMethodId?: string) => void
    isProcessing?: boolean
}

export function AddressPaymentView({ user, cartItems = [], sessionId, onPayNow, isProcessing = false }: AddressPaymentViewProps) {
    const [userAddress, setUserAddress] = useState<Address | null>(null)
    const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([])
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
    const [isLoadingPayments, setIsLoadingPayments] = useState(true)
    const [consultationValidation, setConsultationValidation] = useState<ConsultationValidationResult>({
        isValid: true,
        missingHealthVerticals: [],
        requiresConsultation: false
    })
    const [isValidatingConsultation, setIsValidatingConsultation] = useState(false)
    
    // Check if any items require consultation
    const hasConsultationItems = cartItems.some(item => item.prescriptionRequired)

    // Initialize address data immediately from server-side auth or session data
    useEffect(() => {
        console.log('Initializing user address from profile:', user?.profile?.address)
        if (user?.profile?.address) {
            setUserAddress(user.profile.address)
        }
    }, [user])

    // Function to load payment methods
    const loadPaymentMethods = useCallback(async () => {
        if (!user) {
            setIsLoadingPayments(false)
            return
        }

        try {
            console.log('Fetching payment methods for user:', user.id)

            const response = await fetch('/api/payment-methods')
            
            if (!response.ok) {
                throw new Error('Failed to fetch payment methods')
            }

            const result = await response.json()

            if (result.success) {
                const formattedCards = (result.paymentMethods || []).map((method: any) => ({
                    id: method.id,
                    last4: method.card_last_four,
                    brand: method.card_brand || 'unknown',
                    expiryMonth: method.expiry_month,
                    expiryYear: method.expiry_year,
                    isDefault: method.is_default
                }))

                setPaymentCards(formattedCards)

                // Auto-select default payment method
                const defaultMethod = formattedCards.find((card: { isDefault: any }) => card.isDefault)
                if (defaultMethod) {
                    setSelectedPaymentMethod(defaultMethod.id)
                }
            } else {
                console.error('Failed to fetch payment methods:', result.error)
            }
        } catch (error) {
            console.error('Error loading payment methods:', error)
        } finally {
            setIsLoadingPayments(false)
        }
    }, [user])

    // Load payment methods from API on component mount
    useEffect(() => {
        loadPaymentMethods()
    }, [loadPaymentMethods])

    // Listen for window focus to refresh payment methods (when user returns from adding a card)
    useEffect(() => {
        const handleFocus = () => {
            if (user) {
                loadPaymentMethods()
            }
        }

        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [user, loadPaymentMethods])

    // Fetch address and user profile from DB if not available in server auth
    useEffect(() => {
        const loadUserProfileFromDB = async () => {
            if (!user) return

            try {
                const supabase = createClient()

                const { data: profile, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('address, first_name, last_name, phone')
                    .eq('id', user.id)
                    .single()

                console.log('User profile fetched:', profile)

                if (profileError) {
                    console.error('Error fetching user profile:', profileError)
                } else if (profile) {
                    // Set address if available
                    if (profile.address) {
                        setUserAddress(profile.address)
                    }
                    
                    // Log user info for debugging reload issues
                    console.log('User profile data available:', {
                        hasProfile: !!user.profile,
                        profileData: user.profile,
                        freshDbData: profile
                    })
                }
            } catch (error) {
                console.error('Error loading user profile from DB:', error)
            }
        }

        loadUserProfileFromDB()
    }, [user?.id])

    // Validate consultation requirements when cartItems or user changes
    useEffect(() => {
        const validateConsultation = async () => {
            if (!cartItems || cartItems.length === 0) return

            setIsValidatingConsultation(true)
            try {
                // Enrich cart items with health vertical information
                const enrichedItems = await CartEnrichmentService.enrichCartItemsWithHealthVerticals(cartItems)
                
                // Validate consultation requirements
                const validation = await ConsultationValidationService.validateConsultationRequirements(
                    enrichedItems,
                    user?.id
                )
                
                setConsultationValidation(validation)
            } catch (error) {
                console.error('Error validating consultation requirements:', error)
                // On error, assume validation failed for safety
                const consultationItems = cartItems.filter(item => item.prescriptionRequired)
                setConsultationValidation({
                    isValid: false,
                    missingHealthVerticals: ['hair-loss'], // Default fallback
                    requiresConsultation: consultationItems.length > 0
                })
            } finally {
                setIsValidatingConsultation(false)
            }
        }

        validateConsultation()
    }, [cartItems, user?.id])

    const handleAddressUpdate = async (address: Address) => {
        try {
            if (!user) return

            const supabase = createClient()

            const { error } = await supabase
                .from('user_profiles')
                .update({ address: address })
                .eq('id', user.id)

            if (error) {
                console.error('Error updating address:', error)
            } else {
                setUserAddress(address)
            }
        } catch (error) {
            console.error('Error updating address:', error)
        }
    }

    const handleAddCard = async () => {
        if (!user) return

        try {
            const url = sessionId 
                ? `/api/payment-methods/add-card?sessionId=${sessionId}`
                : '/api/payment-methods/add-card'
                
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const result = await response.json()

            if (result.success && result.redirectUrl) {
                // Redirect to Genie IPG portal
                window.location.href = result.redirectUrl
            } else {
                console.error('Failed to initiate add card flow:', result.error)
                // You could show a toast notification here
            }
        } catch (error) {
            console.error('Error initiating add card flow:', error)
            // You could show a toast notification here
        }
    }

    const handlePayNow = () => {
        // Don't proceed if consultation validation is failing
        if (consultationValidation.requiresConsultation && !consultationValidation.isValid) {
            return
        }
        
        onPayNow('user-address', selectedPaymentMethod || undefined)
    }

    return (
        <div className="space-y-6">
            {/* Delivery Address Section */}
            <DeliveryAddress 
                userAddress={userAddress}
                onAddressUpdate={handleAddressUpdate}
            />

            {/* Payment Method Section */}
            <PaymentMethods
                paymentCards={paymentCards}
                selectedPaymentMethod={selectedPaymentMethod}
                onSelectPaymentMethod={setSelectedPaymentMethod}
                onAddCard={handleAddCard}
                isLoadingPayments={isLoadingPayments}
                user={user}
            />

            {/* Consultation Warning */}
            {consultationValidation.requiresConsultation && !consultationValidation.isValid && (
                <ConsultationWarning missingHealthVerticals={consultationValidation.missingHealthVerticals} />
            )}

            {/* Payment Action Section */}
            <PaymentAction
                hasAddress={!!userAddress}
                hasSelectedPaymentMethod={!!selectedPaymentMethod}
                isProcessing={isProcessing}
                isValidatingConsultation={isValidatingConsultation}
                consultationValidation={consultationValidation}
                onPayNow={handlePayNow}
            />
        </div>
    )
}
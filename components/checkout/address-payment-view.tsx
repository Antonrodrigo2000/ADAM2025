"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit2, CreditCard, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { User } from "@/contexts/types"
import { createClient } from "@/lib/supabase/client"
import { ConsultationWarning } from "./consultation-warning"
import { ConsultationValidationService, type ConsultationValidationResult } from "@/lib/services/consultation-validation"
import { CartEnrichmentService, type EnrichedCartItem } from "@/lib/services/cart-enrichment"

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
    onPayNow: (addressId?: string, paymentMethodId?: string) => void
    isProcessing?: boolean
}

export function AddressPaymentView({ user, cartItems = [], onPayNow, isProcessing = false }: AddressPaymentViewProps) {
    const [userAddress, setUserAddress] = useState<Address | null>(null)
    const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([])
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
    const [isEditingAddress, setIsEditingAddress] = useState(false)
    const [addressForm, setAddressForm] = useState<Address>({
        street: '',
        city: '',
        postcode: '',
        country: 'Sri Lanka'
    })
    const [isLoadingPayments, setIsLoadingPayments] = useState(true)
    const [consultationValidation, setConsultationValidation] = useState<ConsultationValidationResult>({
        isValid: true,
        missingHealthVerticals: [],
        requiresConsultation: false
    })
    const [isValidatingConsultation, setIsValidatingConsultation] = useState(false)

    // Initialize address data immediately from server-side auth
    useEffect(() => {
        // if (user?.profile?.address) {
        //     setUserAddress(user.profile.address)
        //     setAddressForm(user.profile.address)
        // }
    }, [user])

    // Load payment methods from Supabase
    useEffect(() => {
        const loadPaymentMethods = async () => {
            if (!user) {
                setIsLoadingPayments(false)
                return
            }

            try {
                const supabase = createClient()

                console.log('Fetching payment methods for user:', user.id)

                const { data: paymentMethods, error: paymentError } = await supabase
                    .from('user_payment_methods')
                    .select(`
                        id,
                        card_last_four,
                        card_brand,
                        expiry_month,
                        expiry_year,
                        is_default
                    `)
                    .eq('user_id', user.id)
                    .eq('is_active', true)
                    .order('is_default', { ascending: false })
                    .order('created_at', { ascending: false })

                console.log('Payment methods fetched:', paymentMethods)

                if (paymentError) {
                    console.error('Error fetching payment methods:', paymentError)
                } else {
                    const formattedCards = (paymentMethods || []).map(method => ({
                        id: method.id,
                        last4: method.card_last_four,
                        brand: method.card_brand || 'unknown',
                        expiryMonth: method.expiry_month,
                        expiryYear: method.expiry_year,
                        isDefault: method.is_default
                    }))

                    setPaymentCards(formattedCards)

                    // Auto-select default payment method
                    const defaultMethod = formattedCards.find(card => card.isDefault)
                    if (defaultMethod) {
                        setSelectedPaymentMethod(defaultMethod.id)
                    }
                }
            } catch (error) {
                console.error('Error loading payment methods:', error)
            } finally {
                setIsLoadingPayments(false)
            }
        }

        loadPaymentMethods()
    }, [user?.id])

    // Fetch address from DB if not available in server auth
    useEffect(() => {
        const loadAddressFromDB = async () => {
            if (!user) return

            try {
                const supabase = createClient()

                const { data: profile, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('address')
                    .eq('id', user.id)
                    .single()

                console.log('User profile fetched:', profile)

                if (profileError) {
                    console.error('Error fetching user profile:', profileError)
                } else if (profile?.address) {
                    setUserAddress(profile.address)
                    setAddressForm(profile.address)
                }
            } catch (error) {
                console.error('Error loading address from DB:', error)
            }
        }

        loadAddressFromDB()
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

    const handleAddressUpdate = async () => {
        try {
            if (!user) return

            const supabase = createClient()

            const { error } = await supabase
                .from('user_profiles')
                .update({ address: addressForm })
                .eq('id', user.id)

            if (error) {
                console.error('Error updating address:', error)
            } else {
                setUserAddress(addressForm)
                setIsEditingAddress(false)
            }
        } catch (error) {
            console.error('Error updating address:', error)
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
        <div className="space-y-5">
            {/* Delivery Address Section */}
            <div className="neomorphic-container p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold mr-3 text-sm">
                            1
                        </div>
                        <h2 className="text-xl font-bold text-neutral-800">Delivery address</h2>
                    </div>
                    <Dialog open={isEditingAddress} onOpenChange={setIsEditingAddress}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs">
                                <Edit2 className="w-3 h-3 mr-1" />
                                Edit
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Edit Delivery Address</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="street" className="text-xs font-medium">Address</Label>
                                    <Textarea
                                        id="street"
                                        value={addressForm.street}
                                        onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                                        rows={2}
                                        className="text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-xs font-medium">City</Label>
                                        <Input
                                            id="city"
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postcode" className="text-xs font-medium">Postcode</Label>
                                        <Input
                                            id="postcode"
                                            value={addressForm.postcode}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, postcode: e.target.value }))}
                                            className="text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" size="sm" onClick={() => setIsEditingAddress(false)}>
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleAddressUpdate}>
                                        Save Address
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {userAddress ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-neutral-800">{userAddress.street}</p>
                            <p className="text-sm text-neutral-600">
                                {userAddress.city}, {userAddress.postcode}
                            </p>
                            <p className="text-sm text-neutral-600">{userAddress.country}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <p className="text-sm text-orange-800 mb-3">No delivery address found. Please add your address.</p>
                        <Button size="sm" onClick={() => setIsEditingAddress(true)}>
                            Add Address
                        </Button>
                    </div>
                )}
            </div>

            {/* Payment Method Section */}
            <div className="neomorphic-container p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold mr-3 text-sm">
                            2
                        </div>
                        <h2 className="text-xl font-bold text-neutral-800">Payment method</h2>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Card
                    </Button>
                </div>

                <div className="space-y-3">
                    {isLoadingPayments ? (
                        <div className="space-y-3">
                            <div className="bg-neutral-100 rounded-xl p-4 animate-pulse">
                                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                            </div>
                            <div className="bg-neutral-100 rounded-xl p-4 animate-pulse">
                                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ) : paymentCards.length > 0 ? (
                        paymentCards.map((card) => (
                            <Card
                                key={card.id}
                                className={`p-4 cursor-pointer transition-all ${selectedPaymentMethod === card.id
                                    ? 'ring-2 ring-teal-500 bg-teal-50'
                                    : 'hover:bg-neutral-50'
                                    }`}
                                onClick={() => setSelectedPaymentMethod(card.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                            <CreditCard className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium">•••• •••• •••• {card.last4}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {card.brand.toUpperCase()}
                                                </Badge>
                                                {card.isDefault && (
                                                    <Badge variant="default" className="text-xs bg-teal-500">
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-neutral-600">
                                                Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedPaymentMethod === card.id && (
                                        <Check className="w-5 h-5 text-teal-500" />
                                    )}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <p className="text-sm text-orange-800 mb-3">No payment methods found. Please add a payment method.</p>
                            <Button size="sm">
                                <Plus className="w-3 h-3 mr-1" />
                                Add Payment Method
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Consultation Warning */}
            {consultationValidation.requiresConsultation && !consultationValidation.isValid && (
                <ConsultationWarning missingHealthVerticals={consultationValidation.missingHealthVerticals} />
            )}

            {/* Pay Now Button */}
            <div className="neomorphic-container p-4 md:p-5">
                <Button
                    onClick={handlePayNow}
                    disabled={
                        !userAddress || 
                        !selectedPaymentMethod || 
                        isProcessing || 
                        isValidatingConsultation ||
                        (consultationValidation.requiresConsultation && !consultationValidation.isValid)
                    }
                    size="lg"
                    className="w-full h-12 text-base bg-teal-500 hover:bg-teal-600 disabled:opacity-50"
                >
                    {isProcessing ? 'Processing Payment...' : 
                     isValidatingConsultation ? 'Validating Requirements...' :
                     'Pay Now →'}
                </Button>

                {(!userAddress || !selectedPaymentMethod || 
                  (consultationValidation.requiresConsultation && !consultationValidation.isValid)) && (
                    <p className="text-xs text-orange-600 mt-2 text-center">
                        {!userAddress || !selectedPaymentMethod 
                            ? 'Please complete your delivery address and select a payment method'
                            : 'Please complete the required questionnaires before proceeding'
                        }
                    </p>
                )}
            </div>
        </div>
    )
}
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Calendar, ChevronDown } from "lucide-react"
import { OrderSummary } from "./order-summary"
import { useCart } from "@/lib/contexts/cart-context"
import { useQuiz } from "@/lib/contexts/quiz-context"

interface FormData {
  email: string
  password: string
  legalFirstName: string
  legalSurname: string
  dateOfBirth: string
  phoneNumber: string
  sex: string
  postcode: string
  city: string
  address: string
  agreeToTerms: boolean
  marketingOptOut: boolean
}

export function SinglePageCheckout() {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isCartLoaded, setIsCartLoaded] = useState(false)
  const [checkoutCompleted, setCheckoutCompleted] = useState(false)
  const { state: cartState, actions: cartActions } = useCart()
  const { state: quizState } = useQuiz()

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    legalFirstName: "",
    legalSurname: "",
    dateOfBirth: "",
    phoneNumber: "",
    sex: "",
    postcode: "",
    city: "",
    address: "",
    agreeToTerms: false,
    marketingOptOut: false,
  })

  // Wait for cart to load from localStorage before checking if empty
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCartLoaded(true)
    }, 100) // Give cart context time to load from localStorage

    return () => clearTimeout(timer)
  }, [])

  // Redirect to home if cart is empty (but only after cart has loaded)
  // Note: Don't redirect if checkout was completed successfully
  useEffect(() => {
    if (isCartLoaded && cartState.items.length === 0 && !isSubmitting && !checkoutCompleted) {
      console.log("Cart is empty, redirecting to home")
      window.location.href = '/'
    }
  }, [isCartLoaded, cartState.items.length, isSubmitting, checkoutCompleted])

  // Load saved checkout data if available
  useEffect(() => {
    const savedCheckoutData = cartActions.getCheckoutData()
    if (savedCheckoutData?.userDetails) {
      setFormData(prev => ({
        ...prev,
        email: savedCheckoutData.userDetails?.email || "",
        legalFirstName: savedCheckoutData.userDetails?.firstName || "",
        legalSurname: savedCheckoutData.userDetails?.lastName || "",
        phoneNumber: savedCheckoutData.userDetails?.phone || "",
        dateOfBirth: savedCheckoutData.userDetails?.dateOfBirth || "",
        sex: savedCheckoutData.userDetails?.sex || "",
        postcode: savedCheckoutData.deliveryAddress?.postcode || "",
        city: savedCheckoutData.deliveryAddress?.city || "",
        address: savedCheckoutData.deliveryAddress?.street || "",
        agreeToTerms: savedCheckoutData.agreedToTerms || false,
        marketingOptOut: !savedCheckoutData.agreedToMarketing || false,
      }))
    }
  }, [cartActions])

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSubmitError(null) // Clear errors when user makes changes
  }

  const processCheckout = async () => {
    // Save checkout data before processing
    cartActions.saveCheckoutData({
      userDetails: {
        email: formData.email,
        firstName: formData.legalFirstName,
        lastName: formData.legalSurname,
        phone: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        sex: formData.sex,
      },
      deliveryAddress: {
        street: formData.address,
        city: formData.city,
        postcode: formData.postcode,
        country: 'Sri Lanka',
      },
      quizResponses: quizState.answers,
      agreedToTerms: formData.agreeToTerms,
      agreedToMarketing: !formData.marketingOptOut,
    })

    // Call the checkout API with all data
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        legalFirstName: formData.legalFirstName,
        legalSurname: formData.legalSurname,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        sex: formData.sex,
        postcode: formData.postcode,
        city: formData.city,
        address: formData.address,
        agreeToTerms: formData.agreeToTerms,
        marketingOptOut: formData.marketingOptOut,
        cartItems: cartState.items,
        cartTotal: cartState.total,
        quizResponses: quizState.answers,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Checkout failed')
    }

    const result = await response.json()
    return result
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Process checkout using server-side API
      const result = await processCheckout()

      if (result.success) {
        console.log(result)
        // Mark checkout as completed to prevent home redirect
        setCheckoutCompleted(true)
        
        // Clear cart and checkout data
        cartActions.clearCart()
        cartActions.clearCheckoutData()
        
        // Redirect to dashboard - server-side auth will handle authentication check
        window.location.href = result.redirectUrl || '/dashboard'
      } else {
        throw new Error('Checkout failed')
      }

    } catch (error) {
      console.error('Checkout error:', error)
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while cart is being loaded
  if (!isCartLoaded) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="container mx-auto px-3 py-5">
        <div className="grid lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {/* Left side - Forms */}
          <div className="lg:col-span-2 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Create Account Section */}
              <div className="neomorphic-container p-4 md:p-5">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold mr-3 text-sm">
                    1
                  </div>
                  <h2 className="text-xl font-bold text-neutral-800">Create an account</h2>
                </div>

                <div className="mb-4">
                  <span className="text-neutral-600 text-sm">Have an account? </span>
                  <button type="button" className="neomorphic-link text-sm">
                    Log in
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Email */}
                  <div className="neomorphic-input-container">
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">Email address</label>
                    <div className="neomorphic-input-wrapper">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        className="neomorphic-input h-10 text-sm"
                        required
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      We will let you know via email once your prescription has been issued.
                    </p>
                  </div>

                  {/* Password */}
                  <div className="neomorphic-input-container">
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">Password</label>
                    <div className="neomorphic-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                        className="neomorphic-input h-10 text-sm pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="neomorphic-eye-button"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Password must be at least 12 characters, including a mix of letters, numbers, and special
                      characters.
                    </p>
                  </div>

                  {/* Identity Confirmation Notice */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <p className="text-xs text-orange-800">
                      We are required to confirm the identity of our members. Any incorrect details will cause delays to
                      your order.
                    </p>
                  </div>

                  {/* Legal Names */}
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="neomorphic-input-container">
                      <label className="block text-xs font-medium text-neutral-700 mb-1.5">Legal first name</label>
                      <div className="neomorphic-input-wrapper">
                        <input
                          type="text"
                          value={formData.legalFirstName}
                          onChange={(e) => updateFormData("legalFirstName", e.target.value)}
                          className="neomorphic-input h-10 text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div className="neomorphic-input-container">
                      <label className="block text-xs font-medium text-neutral-700 mb-1.5">Legal surname</label>
                      <div className="neomorphic-input-wrapper">
                        <input
                          type="text"
                          value={formData.legalSurname}
                          onChange={(e) => updateFormData("legalSurname", e.target.value)}
                          className="neomorphic-input h-10 text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 -mt-1">
                    Please write your name as it appears on your passport or ID. We need your full legal name to confirm
                    your identity.
                  </p>

                  {/* Date of Birth */}
                  <div className="neomorphic-input-container">
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">Date of birth</label>
                    <div className="neomorphic-input-wrapper">
                      <input
                        type="text"
                        placeholder="Day / Month / Year"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                        className="neomorphic-input h-10 text-sm pr-10"
                        required
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="neomorphic-input-container">
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">Phone number</label>
                    <div className="neomorphic-input-wrapper">
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                        className="neomorphic-input h-10 text-sm"
                        required
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      In very rare cases our clinicians may need to call you. They will always be discreet.
                    </p>
                  </div>

                  {/* Sex */}
                  <div className="neomorphic-input-container">
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">Sex</label>
                    <div className="neomorphic-input-wrapper">
                      <select
                        value={formData.sex}
                        onChange={(e) => updateFormData("sex", e.target.value)}
                        className="neomorphic-input h-10 text-sm pr-8 appearance-none bg-transparent"
                        required
                      >
                        <option value="">Choose sex</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      What sex were you assigned at birth, as shown on your original birth certificate. This is
                      important for us to know because it allows us to provide you with treatments as safely as
                      possible.
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="neomorphic-container p-4 md:p-5">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold mr-3 text-sm">
                    2
                  </div>
                  <h2 className="text-xl font-bold text-neutral-800">Delivery address</h2>
                </div>

                <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-3 mb-4">
                  <p className="text-xs text-neutral-700">
                    Please make sure your address is accurate. Try using our auto-complete option. This will help us
                    confirm your identity.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Postcode */}
                  <div className="neomorphic-input-container">
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">Postcode</label>
                    <div className="neomorphic-input-wrapper">
                      <input
                        type="text"
                        value={formData.postcode}
                        onChange={(e) => updateFormData("postcode", e.target.value)}
                        className="neomorphic-input h-10 text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="neomorphic-input-container">
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">City</label>
                    <div className="neomorphic-input-wrapper">
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateFormData("city", e.target.value)}
                        className="neomorphic-input h-10 text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="neomorphic-input-container">
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">Address</label>
                    <div className="neomorphic-input-wrapper">
                      <textarea
                        value={formData.address}
                        onChange={(e) => updateFormData("address", e.target.value)}
                        rows={2}
                        className="neomorphic-input text-sm resize-none min-h-[60px]"
                        required
                      />
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={(e) => updateFormData("agreeToTerms", e.target.checked)}
                        className="w-4 h-4 text-teal-600 border-2 border-neutral-300 rounded focus:ring-teal-500 focus:ring-2 mt-0.5"
                        required
                      />
                      <span className="text-xs text-neutral-700">
                        Yes, I agree to Adam's{" "}
                        <button type="button" className="neomorphic-link">
                          Terms & Conditions
                        </button>{" "}
                        and{" "}
                        <button type="button" className="neomorphic-link">
                          Privacy Policy
                        </button>
                        .
                      </span>
                    </label>

                    <label className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.marketingOptOut}
                        onChange={(e) => updateFormData("marketingOptOut", e.target.checked)}
                        className="w-4 h-4 text-teal-600 border-2 border-neutral-300 rounded focus:ring-teal-500 focus:ring-2 mt-0.5"
                      />
                      <span className="text-xs text-neutral-700">
                        I do not wish to receive marketing communications that include special offers, promotions, or
                        educational content.
                      </span>
                    </label>
                  </div>

                  {/* Error Display */}
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-sm text-red-800">{submitError}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="neomorphic-button-container">
                    <button
                      type="submit"
                      disabled={isSubmitting || cartState.items.length === 0}
                      className="neomorphic-primary-button h-10 text-base group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                        {isSubmitting ? 'Processing...' : 'Continue to Payment →'}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-5">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { QuestionnaireNotice } from "./questionnaire-notice"
import { useCart } from "@/contexts/cart-context"
import { useQuiz } from "@/contexts/quiz-context"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface FormData {
    email: string
    password: string
    legalFirstName: string
    legalSurname: string
    nic: string
    dateOfBirth: string
    phoneNumber: string
    sex: string
    postcode: string
    city: string
    district: string
    address: string
    agreeToTerms: boolean
    marketingOptOut: boolean
}

const sriLankanNICRegex = /^(?:19|20|[0-9]{2})[0-9]{2}[0-9]{8}|[0-9]{9}[xXvV]$/

const formSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string()
        .min(12, "Password must be at least 12 characters")
        .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Password must include uppercase, lowercase, number, and special character"),
    legalFirstName: z.string().min(1, "Legal first name is required"),
    legalSurname: z.string().min(1, "Legal surname is required"),
    nic: z.string()
        .regex(sriLankanNICRegex, "Please enter a valid Sri Lankan NIC number")
        .refine((val) => val.length === 10 || val.length === 12, "NIC must be 10 or 12 characters"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    phoneNumber: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .regex(/^\+?[0-9\s-()]+$/, "Please enter a valid phone number"),
    sex: z.enum(["male", "female"], { errorMap: () => ({ message: "Please select your sex" }) }),
    postcode: z.string().min(1, "Postcode is required"),
    city: z.string().min(1, "City is required"),
    district: z.string().min(1, "District is required"),
    address: z.string().min(10, "Please provide a complete address"),
    agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
    marketingOptOut: z.boolean(),
})

type ValidationErrors = Partial<Record<keyof FormData, string>>

interface SinglePageCheckoutProps {
  onComplete?: (result: any) => void
}

export function SinglePageCheckout({ onComplete }: SinglePageCheckoutProps = {}) {
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isCartLoaded, setIsCartLoaded] = useState(false)
    const [checkoutCompleted, setCheckoutCompleted] = useState(false)
    const [errors, setErrors] = useState<ValidationErrors>({})
    const { state: cartState, actions: cartActions } = useCart()
    const { state: quizState } = useQuiz()

    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
        legalFirstName: "",
        legalSurname: "",
        nic: "",
        dateOfBirth: "",
        phoneNumber: "",
        sex: "",
        postcode: "",
        city: "",
        district: "",
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
        // Clear field-specific error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
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
            quizResponses: quizState.answers, // Send as-is, server handles images
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
                nic: formData.nic,
                dateOfBirth: formData.dateOfBirth,
                phoneNumber: formData.phoneNumber,
                sex: formData.sex,
                postcode: formData.postcode,
                city: formData.city,
                district: formData.district,
                address: formData.address,
                agreeToTerms: formData.agreeToTerms,
                marketingOptOut: formData.marketingOptOut,
                cartItems: cartState.items,
                cartTotal: cartState.total,
                quizResponses: quizState.answers, // Send as-is, server handles images
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

        // Validate form data
        const validationResult = formSchema.safeParse(formData)
        if (!validationResult.success) {
            const newErrors: ValidationErrors = {}
            validationResult.error.errors.forEach((error) => {
                const field = error.path[0] as keyof FormData
                newErrors[field] = error.message
            })
            setErrors(newErrors)
            setIsSubmitting(false)
            setSubmitError("Please fix the validation errors below")
            return
        }

        // Clear any previous errors
        setErrors({})

        try {
            // Process checkout using server-side API
            const result = await processCheckout()

            if (result.success) {
                // Mark checkout as completed to prevent home redirect
                setCheckoutCompleted(true)

                // If we have an onComplete callback, use it (for enhanced checkout flow)
                if (onComplete) {
                    onComplete(result)
                } else {
                    // Legacy behavior - clear cart and redirect
                    cartActions.clearCart()
                    cartActions.clearCheckoutData()
                    window.location.href = result.redirectUrl || '/dashboard'
                }
            } else {
                throw new Error('Checkout failed')
            }

        } catch (error) {
            console.error('Checkout error:', error)
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
            setSubmitError(errorMessage)
            
            // If we have an onComplete callback, notify about the error too
            if (onComplete) {
                onComplete({ success: false, error: errorMessage })
            }
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
        <>
            {/* Questionnaire Notice */}
            <QuestionnaireNotice />
            
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
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-medium" theme="light">Email address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateFormData("email", e.target.value)}
                                            className="h-10 text-sm"
                                            theme="light"
                                            error={!!errors.email}
                                            required
                                        />
                                        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                                        <p className="text-xs text-gray-500">
                                            We will let you know via email once your prescription has been issued.
                                        </p>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-xs font-medium" theme="light">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => updateFormData("password", e.target.value)}
                                                className="h-10 text-sm pr-10"
                                                theme="light"
                                                error={!!errors.password}
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 py-2"
                                                theme="light"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                                        <p className="text-xs text-gray-500">
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
                                        <div className="space-y-2">
                                            <Label htmlFor="legalFirstName" className="text-xs font-medium" theme="light">Legal first name</Label>
                                            <Input
                                                id="legalFirstName"
                                                type="text"
                                                value={formData.legalFirstName}
                                                onChange={(e) => updateFormData("legalFirstName", e.target.value)}
                                                className="h-10 text-sm"
                                                theme="light"
                                                error={!!errors.legalFirstName}
                                                required
                                            />
                                            {errors.legalFirstName && <p className="text-xs text-red-600">{errors.legalFirstName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="legalSurname" className="text-xs font-medium" theme="light">Legal surname</Label>
                                            <Input
                                                id="legalSurname"
                                                type="text"
                                                value={formData.legalSurname}
                                                onChange={(e) => updateFormData("legalSurname", e.target.value)}
                                                className="h-10 text-sm"
                                                theme="light"
                                                error={!!errors.legalSurname}
                                                required
                                            />
                                            {errors.legalSurname && <p className="text-xs text-red-600">{errors.legalSurname}</p>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 -mt-1">
                                        Please write your name as it appears on your passport or ID. We need your full legal name to confirm
                                        your identity.
                                    </p>

                                    {/* NIC and Date of Birth - Flexed to save space */}
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="nic" className="text-xs font-medium" theme="light">NIC Number</Label>
                                            <Input
                                                id="nic"
                                                type="text"
                                                value={formData.nic}
                                                onChange={(e) => updateFormData("nic", e.target.value)}
                                                className="h-10 text-sm"
                                                placeholder="Enter your NIC number"
                                                theme="light"
                                                error={!!errors.nic}
                                                required
                                            />
                                            {errors.nic && <p className="text-xs text-red-600">{errors.nic}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dateOfBirth" className="text-xs font-medium" theme="light">Date of birth</Label>
                                            <Input
                                                id="dateOfBirth"
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                                                className="h-10 text-sm"
                                                theme="light"
                                                error={!!errors.dateOfBirth}
                                                required
                                            />
                                            {errors.dateOfBirth && <p className="text-xs text-red-600">{errors.dateOfBirth}</p>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 -mt-1">
                                        Please enter your National Identity Card number as it appears on your ID.
                                    </p>

                                    {/* Phone Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber" className="text-xs font-medium" theme="light">Phone number</Label>
                                        <Input
                                            id="phoneNumber"
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                                            className="h-10 text-sm"
                                            theme="light"
                                            error={!!errors.phoneNumber}
                                            required
                                        />
                                        {errors.phoneNumber && <p className="text-xs text-red-600">{errors.phoneNumber}</p>}
                                        <p className="text-xs text-gray-500">
                                            In very rare cases our clinicians may need to call you. They will always be discreet.
                                        </p>
                                    </div>

                                    {/* Sex */}
                                    <div className="space-y-2">
                                        <Label htmlFor="sex" className="text-xs font-medium" theme="light">Sex</Label>
                                        <Select value={formData.sex} onValueChange={(value) => updateFormData("sex", value)}>
                                            <SelectTrigger className="h-10 text-sm" theme="light" error={!!errors.sex}>
                                                <SelectValue placeholder="Choose sex" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.sex && <p className="text-xs text-red-600">{errors.sex}</p>}
                                        <p className="text-xs text-muted-foreground">
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

                                <div className="bg-muted border border-border rounded-xl p-3 mb-4">
                                    <p className="text-xs text-foreground">
                                        Please make sure your address is accurate. Try using our auto-complete option. This will help us
                                        confirm your identity.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* Postcode */}
                                    <div className="space-y-2">
                                        <Label htmlFor="postcode" className="text-xs font-medium" theme="light">Postcode</Label>
                                        <Input
                                            id="postcode"
                                            type="text"
                                            value={formData.postcode}
                                            onChange={(e) => updateFormData("postcode", e.target.value)}
                                            className="h-10 text-sm"
                                            theme="light"
                                            error={!!errors.postcode}
                                            required
                                        />
                                        {errors.postcode && <p className="text-xs text-red-600">{errors.postcode}</p>}
                                    </div>

                                    {/* City */}
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-xs font-medium" theme="light">City</Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => updateFormData("city", e.target.value)}
                                            className="h-10 text-sm"
                                            theme="light"
                                            error={!!errors.city}
                                            required
                                        />
                                        {errors.city && <p className="text-xs text-red-600">{errors.city}</p>}
                                    </div>

                                    {/* District */}
                                    <div className="space-y-2">
                                        <Label htmlFor="district" className="text-xs font-medium" theme="light">District</Label>
                                        <Input
                                            id="district"
                                            type="text"
                                            value={formData.district}
                                            onChange={(e) => updateFormData("district", e.target.value)}
                                            className="h-10 text-sm"
                                            placeholder="Enter your district"
                                            theme="light"
                                            error={!!errors.district}
                                            required
                                        />
                                        {errors.district && <p className="text-xs text-red-600">{errors.district}</p>}
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-xs font-medium" theme="light">Address</Label>
                                        <Textarea
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => updateFormData("address", e.target.value)}
                                            rows={2}
                                            className="text-sm resize-none min-h-[60px]"
                                            theme="light"
                                            error={!!errors.address}
                                            required
                                        />
                                        {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
                                    </div>

                                    {/* Terms Agreement */}
                                    <div className="space-y-3">
                                        <div className="flex items-start space-x-2">
                                            <Checkbox
                                                id="agreeToTerms"
                                                checked={formData.agreeToTerms}
                                                onCheckedChange={(checked) => updateFormData("agreeToTerms", checked === true)}
                                                theme="light"
                                                error={!!errors.agreeToTerms}
                                                required
                                            />
                                            <div className="space-y-1">
                                                <Label htmlFor="agreeToTerms" className="text-xs font-normal leading-normal" theme="light">
                                                    Yes, I agree to Adam's{" "}
                                                    <Button variant="link" className="h-auto p-0 text-teal-600 hover:text-teal-700 underline text-xs" theme="light">
                                                        Terms & Conditions
                                                    </Button>{" "}
                                                    and{" "}
                                                    <Button variant="link" className="h-auto p-0 text-teal-600 hover:text-teal-700 underline text-xs" theme="light">
                                                        Privacy Policy
                                                    </Button>
                                                    .
                                                </Label>
                                                {errors.agreeToTerms && <p className="text-xs text-red-600">{errors.agreeToTerms}</p>}
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-2">
                                            <Checkbox
                                                id="marketingOptOut"
                                                checked={formData.marketingOptOut}
                                                onCheckedChange={(checked) => updateFormData("marketingOptOut", checked === true)}
                                                theme="light"
                                            />
                                            <Label htmlFor="marketingOptOut" className="text-xs font-normal leading-normal" theme="light">
                                                I do not wish to receive marketing communications that include special offers, promotions, or
                                                educational content.
                                            </Label>
                                        </div>
                                    </div>

                                    {/* Error Display */}
                                    {submitError && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                            <p className="text-sm text-red-800">{submitError}</p>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="w-full">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || cartState.items.length === 0}
                                            size="lg"
                                            className="w-full h-10 text-base bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            theme="light"
                                        >
                                            {isSubmitting ? 'Processing...' : 'Continue to Payment →'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
        </>
    )
}

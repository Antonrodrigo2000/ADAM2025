"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
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
        .min(10, "Password must be at least 10 characters")
        .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])/, "Password must include uppercase, lowercase, number, and special character"),
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

interface SignupFormProps {
    onComplete?: (result: any) => void
}

export function SignupForm({ onComplete }: SignupFormProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [errors, setErrors] = useState<ValidationErrors>({})

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

    const updateFormData = (field: keyof FormData, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setSubmitError(null)
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const processSignup = async () => {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Signup failed')
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

        setErrors({})

        try {
            const result = await processSignup()

            if (result.success) {
                if (onComplete) {
                    onComplete(result)
                } else {
                    window.location.href = '/dashboard'
                }
            } else {
                throw new Error('Signup failed')
            }

        } catch (error) {
            console.error('Signup error:', error)
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
            setSubmitError(errorMessage)

            if (onComplete) {
                onComplete({ success: false, error: errorMessage })
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                        1
                    </div>
                    <h2 className="text-xl font-semibold text-neutral-800">Account Information</h2>
                </div>

                <div className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium" theme="light">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData("email", e.target.value)}
                            className="h-10"
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
                        <Label htmlFor="password" className="text-sm font-medium" theme="light">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => updateFormData("password", e.target.value)}
                                className="h-10 pr-10"
                                theme="light"
                                error={!!errors.password}
                                required
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                theme="light"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                        </div>
                        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                        <p className="text-xs text-gray-500">
                            Password must be at least 10 characters, including a mix of letters, numbers, and special characters.
                        </p>
                    </div>
                </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                        2
                    </div>
                    <h2 className="text-xl font-semibold text-neutral-800">Personal Information</h2>
                </div>

                {/* Identity Confirmation Notice */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-orange-800">
                        We are required to confirm the identity of our members. Any incorrect details will cause delays to your account setup.
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Legal Names */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="legalFirstName" className="text-sm font-medium" theme="light">Legal first name</Label>
                            <Input
                                id="legalFirstName"
                                type="text"
                                value={formData.legalFirstName}
                                onChange={(e) => updateFormData("legalFirstName", e.target.value)}
                                className="h-10"
                                theme="light"
                                error={!!errors.legalFirstName}
                                required
                            />
                            {errors.legalFirstName && <p className="text-xs text-red-600">{errors.legalFirstName}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="legalSurname" className="text-sm font-medium" theme="light">Legal surname</Label>
                            <Input
                                id="legalSurname"
                                type="text"
                                value={formData.legalSurname}
                                onChange={(e) => updateFormData("legalSurname", e.target.value)}
                                className="h-10"
                                theme="light"
                                error={!!errors.legalSurname}
                                required
                            />
                            {errors.legalSurname && <p className="text-xs text-red-600">{errors.legalSurname}</p>}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 -mt-2">
                        Please write your name as it appears on your passport or ID. We need your full legal name to confirm your identity.
                    </p>

                    {/* NIC and Date of Birth */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nic" className="text-sm font-medium" theme="light">NIC Number</Label>
                            <Input
                                id="nic"
                                type="text"
                                value={formData.nic}
                                onChange={(e) => updateFormData("nic", e.target.value)}
                                className="h-10"
                                placeholder="Enter your NIC number"
                                theme="light"
                                error={!!errors.nic}
                                required
                            />
                            {errors.nic && <p className="text-xs text-red-600">{errors.nic}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth" className="text-sm font-medium" theme="light">Date of birth</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                                className="h-10"
                                theme="light"
                                error={!!errors.dateOfBirth}
                                required
                            />
                            {errors.dateOfBirth && <p className="text-xs text-red-600">{errors.dateOfBirth}</p>}
                        </div>
                    </div>

                    {/* Sex */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber" className="text-sm font-medium" theme="light">Phone number</Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                                className="h-10"
                                theme="light"
                                error={!!errors.phoneNumber}
                                required
                            />
                            {errors.phoneNumber && <p className="text-xs text-red-600">{errors.phoneNumber}</p>}
                            <p className="text-xs text-gray-500">
                                In very rare cases our clinicians may need to call you. They will always be discreet.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sex" className="text-sm font-medium" theme="light">Sex</Label>
                            <Select value={formData.sex} onValueChange={(value) => updateFormData("sex", value)}>
                                <SelectTrigger className="h-10" theme="light" error={!!errors.sex}>
                                    <SelectValue placeholder="Choose sex" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.sex && <p className="text-xs text-red-600">{errors.sex}</p>}
                            <p className="text-xs text-gray-500">
                                What sex were you assigned at birth, as shown on your original birth certificate.
                                This is important for us to know because it allows us to provide you with treatments as safely as possible.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                        3
                    </div>
                    <h2 className="text-xl font-semibold text-neutral-800">Address Information</h2>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                        Please make sure your address is accurate. This will help us confirm your identity and ensure successful delivery of any orders.
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Postcode and City */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="postcode" className="text-sm font-medium" theme="light">Postcode</Label>
                            <Input
                                id="postcode"
                                type="text"
                                value={formData.postcode}
                                onChange={(e) => updateFormData("postcode", e.target.value)}
                                className="h-10"
                                theme="light"
                                error={!!errors.postcode}
                                required
                            />
                            {errors.postcode && <p className="text-xs text-red-600">{errors.postcode}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-sm font-medium" theme="light">City</Label>
                            <Input
                                id="city"
                                type="text"
                                value={formData.city}
                                onChange={(e) => updateFormData("city", e.target.value)}
                                className="h-10"
                                theme="light"
                                error={!!errors.city}
                                required
                            />
                            {errors.city && <p className="text-xs text-red-600">{errors.city}</p>}
                        </div>
                    </div>

                    {/* District */}
                    <div className="space-y-2">
                        <Label htmlFor="district" className="text-sm font-medium" theme="light">District</Label>
                        <Input
                            id="district"
                            type="text"
                            value={formData.district}
                            onChange={(e) => updateFormData("district", e.target.value)}
                            className="h-10"
                            placeholder="Enter your district"
                            theme="light"
                            error={!!errors.district}
                            required
                        />
                        {errors.district && <p className="text-xs text-red-600">{errors.district}</p>}
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium" theme="light">Address</Label>
                        <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => updateFormData("address", e.target.value)}
                            rows={3}
                            className="resize-none"
                            theme="light"
                            error={!!errors.address}
                            required
                        />
                        {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
                    </div>

                    {/* Terms Agreement */}
                    <div className="space-y-3 pt-4">
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onCheckedChange={(checked) => updateFormData("agreeToTerms", checked === true)}
                                theme="light"
                                error={!!errors.agreeToTerms}
                                required
                            />
                            <div className="space-y-1">
                                <Label htmlFor="agreeToTerms" className="text-sm font-normal leading-normal" theme="light">
                                    Yes, I agree to Adam's{" "}
                                    <Button variant="link" className="h-auto p-0 text-orange-600 hover:text-orange-700 underline text-sm" theme="light">
                                        Terms & Conditions
                                    </Button>{" "}
                                    and{" "}
                                    <Button variant="link" className="h-auto p-0 text-orange-600 hover:text-orange-700 underline text-sm" theme="light">
                                        Privacy Policy
                                    </Button>
                                    .
                                </Label>
                                {errors.agreeToTerms && <p className="text-xs text-red-600">{errors.agreeToTerms}</p>}
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="marketingOptOut"
                                checked={formData.marketingOptOut}
                                onCheckedChange={(checked) => updateFormData("marketingOptOut", checked === true)}
                                theme="light"
                            />
                            <Label htmlFor="marketingOptOut" className="text-sm font-normal leading-normal" theme="light">
                                I do not wish to receive marketing communications that include special offers, promotions, or educational content.
                            </Label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{submitError}</p>
                </div>
            )}

            {/* Submit Button */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full h-12 text-base bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    theme="light"
                >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
            </div>
        </form>
    )
}
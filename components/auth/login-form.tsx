"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface FormData {
    email: string
    password: string
}

const formSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

type ValidationErrors = Partial<Record<keyof FormData, string>>

interface LoginFormProps {
    onComplete?: (result: any) => void
}

export function LoginForm({ onComplete }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [errors, setErrors] = useState<ValidationErrors>({})

    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
    })

    const updateFormData = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setSubmitError(null)
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const processLogin = async () => {
        const response = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Login failed')
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
            const result = await processLogin()

            if (result.success) {
                if (onComplete) {
                    onComplete(result)
                } else {
                    window.location.href = '/dashboard'
                }
            } else {
                throw new Error('Login failed')
            }

        } catch (error) {
            console.error('Login error:', error)
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
            {/* Login Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
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
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                        <Link href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700 underline">
                            Forgot your password?
                        </Link>
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
                    className="w-full h-12 text-base bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    theme="light"
                >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
                
                <div className="text-center">
                    <span className="text-sm text-neutral-600">Don't have an account? </span>
                    <Link href="/signup" className="text-sm text-orange-600 hover:text-orange-700 underline font-medium">
                        Create one here
                    </Link>
                </div>
            </div>
        </form>
    )
}
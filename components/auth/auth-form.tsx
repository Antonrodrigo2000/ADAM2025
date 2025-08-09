"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Lock, Mail, Eye, EyeOff } from "lucide-react"
import { cn } from "@/utils/style/utils"
import { useAuth } from "@/contexts"

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M21.35 11.1h-9.2v2.7h5.3c-.2 1.1-.8 2-1.7 2.7v2.1h2.7c1.6-1.5 2.5-3.7 2.5-6.2 0-.6-.1-1.1-.2-1.6z"
      />
      <path
        fill="#34A853"
        d="M12.15 22c2.4 0 4.5-.8 6-2.2l-2.7-2.1c-.8.5-1.8.8-3.3.8-2.5 0-4.6-1.7-5.4-4H3.9v2.1c1.2 2.4 3.5 4.1 6.25 4.1z"
      />
      <path
        fill="#FBBC05"
        d="M6.75 13.4c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V7.9H3.9c-.7 1.4-1.1 3-1.1 4.8s.4 3.4 1.1 4.8l2.85-2.1z"
      />
      <path
        fill="#EA4335"
        d="M12.15 6.2c1.3 0 2.5.5 3.4 1.4l2.4-2.4C16.6 3.2 14.5 2 12.15 2 9.4 2 7.1 3.7 5.9 6.1l2.8 2.1c.8-2.3 2.9-4 5.45-4z"
      />
    </svg>
  )
}

export function AuthForm() {
  const { state, actions } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSignUp) {
      await actions.signUp(formData)
    } else {
      await actions.signIn(formData.email, formData.password)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Main container with neomorphic styling */}
      <div className="neomorphic-container p-8 md:p-12">
        {/* Header section */}
        <div className="text-center mb-10">
          <div className="mb-4">
            <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-neutral-800">
              {isSignUp ? "Join Adam" : "Welcome Back"}
            </h1>
          </div>
          <p className="text-neutral-600 text-lg">
            {isSignUp ? "Take control of your health journey" : "Continue your path to excellence"}
          </p>
        </div>

        {/* Toggle buttons with neomorphic styling */}
        <div className="neomorphic-toggle-container mb-8">
          <div className="neomorphic-toggle-track">
            <button
              onClick={() => setIsSignUp(false)}
              className={cn("neomorphic-toggle-button", !isSignUp && "neomorphic-toggle-active")}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={cn("neomorphic-toggle-button", isSignUp && "neomorphic-toggle-active")}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name fields for sign up */}
          {isSignUp && (
            <>
              <div className="neomorphic-input-container">
                <div className="neomorphic-input-wrapper">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First name"
                    required
                    className="neomorphic-input"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="neomorphic-input-container">
                <div className="neomorphic-input-wrapper">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last name"
                    required
                    className="neomorphic-input"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email input */}
          <div className="neomorphic-input-container">
            <div className="neomorphic-input-wrapper">
              <Mail className="neomorphic-input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email address"
                required
                className="neomorphic-input"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Password input */}
          <div className="neomorphic-input-container">
            <div className="neomorphic-input-wrapper">
              <Lock className="neomorphic-input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="neomorphic-input"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="neomorphic-eye-button">
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-neutral-500" />
                ) : (
                  <Eye className="w-5 h-5 text-neutral-500" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot password link */}
          {!isSignUp && (
            <div className="text-right">
              <Link href="#" className="neomorphic-link">
                Forgot password?
              </Link>
            </div>
          )}

          {/* Error message */}
          {state.error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}

          {/* Submit button */}
          <div className="neomorphic-button-container">
            <button 
              type="submit" 
              disabled={state.isLoading}
              className="neomorphic-primary-button group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center">
                {state.isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </>
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="neomorphic-divider">
          <div className="neomorphic-divider-line" />
          <span className="px-4 text-sm font-medium text-neutral-500 bg-neutral-100 rounded-full py-2">
            Or continue with
          </span>
          <div className="neomorphic-divider-line" />
        </div>

        {/* Social login */}
        <div className="neomorphic-button-container">
          <button className="neomorphic-social-button group">
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Terms */}
        {isSignUp && (
          <p className="mt-8 text-xs text-center text-neutral-500 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="neomorphic-link">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="neomorphic-link">
              Privacy Policy
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}

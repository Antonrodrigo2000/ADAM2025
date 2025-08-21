'use client'

import { useState } from 'react'
import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export default function SignupPage() {
  const [signupCompleted, setSignupCompleted] = useState(false)

  const handleSignupComplete = (result: any) => {
    if (result.success) {
      setSignupCompleted(true)
      // Redirect to dashboard after successful signup
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    }
  }

  if (signupCompleted) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">Account Created!</h2>
              <p className="text-neutral-600">
                Your account has been successfully created. Redirecting to your dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="p-4 md:p-6">
        <Link href="/" className="text-2xl font-extrabold font-logo tracking-tighter uppercase text-black">
          ADAM
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left side - Signup Form */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">Create Your Account</h1>
              <p className="text-neutral-600">
                Join Adam to take control of your health journey. Already have an account?{" "}
                <Link href="/login" className="text-teal-600 hover:text-teal-700 underline">
                  Sign in here
                </Link>
              </p>
            </div>
            
            <SignupForm onComplete={handleSignupComplete} />
          </div>

          {/* Right side - Benefits */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Why Choose Adam?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800">Convenient Healthcare</h4>
                    <p className="text-sm text-neutral-600">Get prescriptions and treatments delivered to your door</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800">Licensed Clinicians</h4>
                    <p className="text-sm text-neutral-600">Get expert medical advice from qualified professionals</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800">Secure & Private</h4>
                    <p className="text-sm text-neutral-600">Your health data is protected with enterprise-grade security</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800">Fast Delivery</h4>
                    <p className="text-sm text-neutral-600">Quick turnaround times for prescriptions and orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
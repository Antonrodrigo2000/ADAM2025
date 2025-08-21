'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  const [loginCompleted, setLoginCompleted] = useState(false)

  const handleLoginComplete = (result: any) => {
    if (result.success) {
      setLoginCompleted(true)
      // Redirect to dashboard after successful login
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    }
  }

  if (loginCompleted) {
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
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">Welcome Back!</h2>
              <p className="text-neutral-600">
                Successfully logged in. Redirecting to your dashboard...
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Login Form */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">Welcome Back</h1>
              <p className="text-neutral-600">
                Sign in to your Adam account. Don't have an account?{" "}
                <Link href="/signup" className="text-teal-600 hover:text-teal-700 underline">
                  Create one here
                </Link>
              </p>
            </div>
            
            <LoginForm onComplete={handleLoginComplete} />
          </div>

          {/* Right side - Image/Illustration */}
          <div className="lg:block hidden">
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8 text-center">
              <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-3">Your Health Journey Continues</h3>
              <p className="text-neutral-600">
                Access your personalized health dashboard, track your treatments, and manage your prescriptions all in one place.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
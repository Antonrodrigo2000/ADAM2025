"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
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
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="w-full max-w-md mx-auto bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-orange-500/10">
      <div className="p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display tracking-tight text-white">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSignUp ? "Join the movement. Take control." : "Continue your journey to excellence."}
          </p>
        </div>

        <div className="flex bg-neutral-900/50 p-1 rounded-lg mb-8">
          <button
            onClick={() => setIsSignUp(false)}
            className={cn(
              "w-1/2 py-2.5 text-sm font-medium rounded-md transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              !isSignUp ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white",
            )}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={cn(
              "w-1/2 py-2.5 text-sm font-medium rounded-md transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isSignUp ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white",
            )}
          >
            Sign Up
          </button>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email address"
                required
                className="pl-12 h-14 bg-neutral-900/50 border-neutral-700 focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                required
                className="pl-12 h-14 bg-neutral-900/50 border-neutral-700 focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          {!isSignUp && (
            <div className="text-right">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Forgot password?
              </Link>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-14 text-lg font-bold group bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSignUp ? "Create Account" : "Sign In"}
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-800 px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="outline"
            className="h-14 border-neutral-700 hover:bg-neutral-800 hover:border-primary bg-transparent"
          >
            <GoogleIcon className="mr-2" />
            Sign in with Google
          </Button>
        </div>

        {isSignUp && (
          <p className="mt-8 text-xs text-center text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-white">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}

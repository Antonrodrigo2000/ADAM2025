"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Header } from "@/components/layout/header"

type ProductPageProps = {}

export function ProductPage({}: ProductPageProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [showFloatingCta, setShowFloatingCta] = useState(false)
  const [purchaseType, setPurchaseType] = useState<"onetime" | "subscription">("subscription")

  useEffect(() => {
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = "smooth"

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in")
        }
      })
    }, observerOptions)

    // Observe all sections
    const sections = document.querySelectorAll(".scroll-animate")
    sections.forEach((section) => observer.observe(section))

    // Show floating CTA after scrolling past hero section
    const handleScroll = () => {
      const heroSection = document.querySelector(".hero-section")
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom
        setShowFloatingCta(heroBottom < 0)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", handleScroll)
      document.documentElement.style.scrollBehavior = "auto"
    }
  }, [])

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const handleStartAssessment = () => {
    // Navigate to assessment or open modal
    console.log("Starting assessment...")
  }

  const faqItems = [
    {
      question: "Does topical finasteride work?",
      answer: "Yes, it helps reduce hair loss and promotes regrowth.",
    },
    {
      question: "Why buy topical finasteride?",
      answer: "It's a convenient, mess-free option for hair loss treatment.",
    },
    {
      question: "How long does it take to see results?",
      answer: "Results can typically be seen in 3-6 months with consistent use.",
    },
  ]

  const pricing = {
    onetime: {
      price: 89,
      description: "One-time purchase",
    },
    subscription: {
      price: 69,
      description: "Monthly delivery",
    },
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header from Landing Page */}
      <Header />

      {/* Floating CTA with Glass Morphism */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out ${
          showFloatingCta ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
        }`}
      >
        <button
          onClick={handleStartAssessment}
          className="group relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300"
        >
          <div className="relative rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 shadow-2xl hover:shadow-3xl transition-all duration-300 group-hover:bg-white/15">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold text-sm whitespace-nowrap">Start Hair Assessment</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <svg
                  className="w-3 h-3 text-white transform group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Glass morphism overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400/30 rounded-full animate-ping"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse delay-1000"></div>
            </div>
          </div>
        </button>
      </div>

      {/* Hero Section */}
      <section className="hero-section relative min-h-screen flex items-center justify-center text-center overflow-hidden py-20 mt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gray-100" />
          <div
            className="absolute inset-0 techno-grid"
            style={
              {
                "--grid-color": "rgba(255, 165, 0, 0.07)",
                "--grid-size": "60px",
              } as React.CSSProperties
            }
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_0%,_rgba(229,231,235,1)_80%)]" />
          <div className="absolute inset-0 flex items-center justify-center animate-subtle-pan">
            {/* Light Orange Sun for Product Page */}
            <div
              className="w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full absolute animate-fade-in"
              style={{
                background: `radial-gradient(
                  ellipse at center,
                  rgba(251, 146, 60, 0.8) 0%,
                  rgba(249, 115, 22, 0.6) 40%,
                  rgba(254, 215, 170, 0.3) 75%,
                  transparent 100%
                )`,
                filter: "blur(10px)",
                animation: "sun-glow 8s ease-in-out infinite, fade-in 3s ease-out forwards",
              }}
            />
            <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent" />
          </div>
        </div>

        <div className="container mx-auto relative z-10 h-full flex flex-col justify-center">
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="order-2 lg:order-1 p-6 lg:p-12 flex items-center justify-center">
                {/* Mobile Light Orange Halo Effect */}
                <div className="absolute inset-0 flex items-center justify-center md:hidden">
                  <div
                    className="w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl animate-mobile-halo"
                    style={{
                      background: `radial-gradient(
                        circle,
                        rgba(251, 146, 60, 0.4) 0%,
                        rgba(249, 115, 22, 0.25) 40%,
                        rgba(254, 215, 170, 0.15) 70%,
                        transparent 100%
                      )`,
                    }}
                  />
                </div>

                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Hand holding spray bottle"
                  width={400}
                  height={400}
                  className="w-full max-w-md mx-auto relative z-10"
                />
              </div>
              <div className="order-1 lg:order-2 p-6 lg:p-12 flex flex-col justify-center">
                <div className="relative z-10">
                  <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tighter text-black mb-4">
                    Topical Finasteride & Minoxidil Spray
                  </h1>
                  <p className="text-lg text-gray-600 mb-8">A 2-in-1 daily treatment for hair loss & regrowth</p>

                  {/* Purchase Type Selector */}
                  <div className="mb-8">
                    <div className="relative bg-gray-100 rounded-full p-1 mb-6 border border-gray-200">
                      <div
                        className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-full shadow-sm transition-transform duration-300 ease-out ${
                          purchaseType === "subscription" ? "translate-x-0" : "translate-x-full"
                        }`}
                      ></div>
                      <div className="relative flex">
                        <button
                          onClick={() => setPurchaseType("subscription")}
                          className={`flex-1 py-3 px-6 text-sm font-medium rounded-full transition-colors duration-200 ${
                            purchaseType === "subscription" ? "text-black" : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          Subscription
                        </button>
                        <button
                          onClick={() => setPurchaseType("onetime")}
                          className={`flex-1 py-3 px-6 text-sm font-medium rounded-full transition-colors duration-200 ${
                            purchaseType === "onetime" ? "text-black" : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          One-time
                        </button>
                      </div>
                    </div>

                    {/* Pricing Display */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-black">${pricing[purchaseType].price}</span>
                        <span className="text-sm text-gray-500">{pricing[purchaseType].description}</span>
                      </div>
                    </div>
                  </div>

                  <button className="bg-black text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md">
                    Get started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why the spray section */}
      <section className="flex flex-col items-center py-10 px-5 bg-white scroll-animate opacity-0">
        <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tighter text-black mb-6 text-center">
          Why the spray?
        </h2>
        <p className="text-base text-gray-700 text-center max-w-2xl mb-8">
          No pills, no mess—just ingredients that work. A spray that's clinically proven to help with hair regrowth.
        </p>
        <Image
          src="/placeholder.svg?height=300&width=400"
          alt="Spray bottle"
          width={400}
          height={300}
          className="mt-5"
        />
      </section>

      {/* How it works section */}
      <section
        id="how-it-works"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 py-10 px-5 bg-white scroll-animate opacity-0"
      >
        <div className="order-2 lg:order-1">
          <Image
            src="/placeholder.svg?height=300&width=400"
            alt="Hair growth stages"
            width={400}
            height={300}
            className="w-full"
          />
        </div>
        <div className="order-1 lg:order-2 flex flex-col justify-center">
          <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tighter text-black mb-6">
            How topical finasteride & minoxidil spray works
          </h2>
          <p className="text-base text-gray-700">
            Finasteride blocks an enzyme that shrinks hair follicles. Minoxidil increases blood flow to help regrow
            hair. Better together.
          </p>
        </div>
      </section>

      {/* What's different section */}
      <section className="flex flex-col items-center py-10 px-5 bg-white scroll-animate opacity-0">
        <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tighter text-black mb-6 text-center">
          What's different about this spray?
        </h2>
        <p className="text-base text-gray-700 text-center max-w-2xl">
          For years, options for hair loss were pills or messy topicals. This prescription spray combines the
          ingredients of both into one.
        </p>
      </section>

      {/* How to use section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 py-10 px-5 bg-white scroll-animate opacity-0">
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tighter text-black mb-6">
            How to use the spray
          </h2>
          <p className="text-base text-gray-700">
            Apply the spray to the affected areas of the scalp and massage it in. Use twice daily for best results.
          </p>
        </div>
        <div>
          <Image
            src="/placeholder.svg?height=300&width=400"
            alt="Spray on wood"
            width={400}
            height={300}
            className="w-full"
          />
        </div>
      </section>

      {/* How to get section */}
      <section className="py-10 px-5 bg-white scroll-animate opacity-0">
        <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tighter text-black mb-8 text-center">
          How to get topical finasteride & minoxidil spray
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          <div className="p-4 bg-gray-200 rounded-lg border border-gray-300 text-center">
            <div className="w-12 h-12 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl">💬</span>
            </div>
            <p className="text-sm text-black">Quick consult about symptoms and health history</p>
          </div>
          <div className="p-4 bg-gray-200 rounded-lg border border-gray-300 text-center">
            <div className="w-12 h-12 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl">🔗</span>
            </div>
            <p className="text-sm text-black">Connect with a provider to determine if it's right for you</p>
          </div>
          <div className="p-4 bg-gray-200 rounded-lg border border-gray-300 text-center">
            <div className="w-12 h-12 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl">📦</span>
            </div>
            <p className="text-sm text-black">Free delivery with discreet packaging</p>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section id="faq" className="flex flex-col py-10 px-5 bg-white scroll-animate opacity-0">
        <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tighter text-black mb-8 text-center">
          Frequently asked questions about topical finasteride & minoxidil spray
        </h2>
        <div className="max-w-3xl mx-auto w-full">
          {faqItems.map((item, index) => (
            <div key={index} className="border-b border-gray-200 py-4">
              <button onClick={() => toggleFaq(index)} className="w-full text-left flex justify-between items-center">
                <span className="text-base font-bold text-black">{item.question}</span>
                <span className="text-2xl text-gray-400">{expandedFaq === index ? "−" : "+"}</span>
              </button>
              {expandedFaq === index && (
                <div className="mt-3">
                  <p className="text-sm text-gray-700">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Safety section */}
      <section id="safety" className="flex flex-col items-center py-10 px-5 bg-gray-100 scroll-animate opacity-0">
        <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tighter text-black mb-6 text-center">
          Important safety information
        </h2>
        <p className="text-sm text-gray-600 text-center max-w-2xl">
          Consult a healthcare provider before use. Side effects may include scalp irritation.
        </p>
      </section>

      {/* More treatments section */}
      <section id="treatments" className="py-10 px-5 bg-white scroll-animate opacity-0">
        <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tighter text-black mb-8 text-center">
          Explore more hair treatments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          <div className="p-4 bg-gray-200 rounded-lg border border-gray-300">
            <Image
              src="/placeholder.svg?height=200&width=300"
              alt="Hair Power Pack"
              width={300}
              height={200}
              className="w-full mb-4 rounded"
            />
            <p className="text-sm text-black">Hair Power Pack - Tackle hair loss with complete growth support</p>
          </div>
          <div className="p-4 bg-gray-200 rounded-lg border border-gray-300">
            <Image
              src="/placeholder.svg?height=200&width=300"
              alt="Minoxidil Foam"
              width={300}
              height={200}
              className="w-full mb-4 rounded"
            />
            <p className="text-sm text-black">Minoxidil Foam - No mess designed for thicker hair</p>
          </div>
          <div className="p-4 bg-gray-200 rounded-lg border border-gray-300">
            <Image
              src="/placeholder.svg?height=200&width=300"
              alt="Thickening Shampoo"
              width={300}
              height={200}
              className="w-full mb-4 rounded"
            />
            <p className="text-sm text-black">Thickening Shampoo - Enhances volume with gentle cleansing</p>
          </div>
        </div>
      </section>

      {/* More info section */}
      <section className="py-10 px-5 bg-white scroll-animate opacity-0">
        <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tighter text-black mb-8 text-center">
          More info on finasteride
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl mx-auto">
          <div className="p-4 bg-gray-200 rounded-lg border border-gray-300">
            <Image
              src="/placeholder.svg?height=200&width=300"
              alt="Finasteride for men"
              width={300}
              height={200}
              className="w-full mb-4 rounded"
            />
            <p className="text-sm text-black mb-2">Finasteride for men</p>
            <button className="text-sm font-bold text-black hover:underline">Learn more</button>
          </div>
          <div className="p-4 bg-gray-200 rounded-lg border border-gray-300">
            <Image
              src="/placeholder.svg?height=200&width=300"
              alt="Finasteride vs Dutasteride"
              width={300}
              height={200}
              className="w-full mb-4 rounded"
            />
            <p className="text-sm text-black mb-2">Finasteride vs. Dutasteride</p>
            <button className="text-sm font-bold text-black hover:underline">Learn more</button>
          </div>
        </div>
      </section>

      {/* Footer - Using Landing Page Footer */}
      <footer className="bg-secondary">
        <div className="container mx-auto py-12 px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold font-display mb-4">Adam</h3>
              <p className="text-sm text-muted-foreground">
                © 2025 BASKR Health (Private) Limited. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Treatments</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#hair" className="hover:text-primary">
                    Hair Loss
                  </a>
                </li>
                <li>
                  <a href="#skin" className="hover:text-primary">
                    Skincare
                  </a>
                </li>
                <li>
                  <a href="#sexual-health" className="hover:text-primary">
                    Sexual Health
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

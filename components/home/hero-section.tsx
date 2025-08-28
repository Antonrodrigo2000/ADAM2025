"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden md:m-4 mt-16 md:mt-20">
      {/* White border frame - hidden on mobile */}
      <div className="absolute inset-4 border-4 border-white rounded-3xl z-30 pointer-events-none hidden md:block" />
      
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 md:inset-4 w-full md:w-[calc(100%-2rem)] h-full md:h-[calc(100%-2rem)] object-cover z-0 md:rounded-3xl will-change-transform"
        onLoadedData={() => setVideoLoaded(true)}
        onError={() => console.error('Video failed to load')}
        style={{ transform: 'translateZ(0)' }}
      >
        <source src="/1109501763-preview.mp4" type="video/mp4" />
      </video>
      
      {/* Video Overlay */}
      <div className="absolute inset-0 md:inset-4 bg-black/50 z-10 md:rounded-3xl" />

      <div className="container mx-auto relative z-20 px-4 md:px-8 py-20">
        <div className="max-w-4xl mx-auto text-left md:text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8 animate-fade-in-up backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Doctor-Supervised Treatments</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-logo tracking-wide mb-6 leading-tight animate-fade-in-up animation-delay-200">
            <span className="text-white drop-shadow-2xl">
              Men's Health,
            </span>
            <br />
            <span className="text-white drop-shadow-2xl">
              Redefined.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up animation-delay-400">
            Discreet, convenient, and personalized care delivered to your door.
            <span className="block mt-2 text-lg text-white/80">Start your transformation today.</span>
          </p>

          {/* Scroll to Verticals Button */}
          <div className="flex justify-start md:justify-center items-center animate-fade-in-up animation-delay-600 mb-16">
            <Button 
              onClick={() => {
                document.getElementById('health-verticals')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                })
              }}
              size="lg" 
              className="rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Explore Treatments
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-start md:justify-center items-center gap-8 text-sm text-white/80 animate-fade-in-up animation-delay-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Licensed Doctors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Clinically Proven</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>100% Discreet</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"

export function DoctorReviewSection() {
  const steps = [
    {
      number: "1",
      title: "Complete Assessment",
      description: "Answer questions about your health in our secure 5-minute questionnaire.",
      icon: CheckCircle,
      duration: "5 min"
    },
    {
      number: "2", 
      title: "Doctor Review",
      description: "Licensed physician reviews your case and creates your treatment plan.",
      icon: Shield,
      duration: "24-48h"
    },
    {
      number: "3",
      title: "Discreet Delivery",
      description: "Prescription filled and shipped directly to your door.",
      icon: Clock,
      duration: "2-3 days"
    }
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-gray-900">
              Simple, Professional Care
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Get doctor-supervised treatment in three easy steps.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <Card key={index} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5 mb-3">
                        {step.duration}
                      </Badge>
                    </div>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-2xl p-8 md:p-12 text-center shadow-sm border border-gray-200">
            <h3 className="text-3xl font-bold tracking-tight mb-4 text-gray-900">
              Ready to Get Started?
            </h3>
            <p className="text-xl mb-8 text-gray-600 max-w-xl mx-auto">
              Join thousands who've transformed their confidence with professional care.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => {
                document.getElementById('health-verticals')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                })
              }}
            >
              <Link href="#health-verticals">
                Choose Your Treatment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
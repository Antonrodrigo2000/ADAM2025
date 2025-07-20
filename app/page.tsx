import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, Zap, Shield, Heart, TrendingUp } from "lucide-react"
import { Header } from "@/components/layout/header"
import { CategoryCards } from "@/components/category-cards"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden py-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black animate-fade-in" />
        <div
          className="absolute inset-0 techno-grid"
          style={
            {
              "--grid-color": "rgba(255, 165, 0, 0.07)",
              "--grid-size": "60px",
            } as React.CSSProperties
          }
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_0%,_rgba(0,0,0,1)_80%)]" />
        <div className="absolute inset-0 flex items-center justify-center animate-subtle-pan">
          <div className="sun" />
          <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-black via-black to-transparent" />
        </div>
      </div>

      <div className="container mx-auto relative z-10 h-full flex flex-col justify-between py-20">
        <div className="flex-1 flex flex-col justify-center">
          <div className="animate-content-in opacity-0 relative" style={{ animationFillMode: "forwards" }}>
            {/* Mobile Orange Halo Effect */}
            <div className="absolute inset-0 flex items-center justify-center md:hidden">
              <div className="w-80 h-80 sm:w-96 sm:h-96 bg-gradient-radial from-orange-500/20 via-orange-600/10 to-transparent rounded-full blur-3xl animate-mobile-halo" />
            </div>

            <div className="relative z-10">
              <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tighter mb-6">
                Men's Health, Redefined.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                Discreet, convenient, and personalized care for hair loss, skincare, and sexual health. Delivered to
                your door.
              </p>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <CategoryCards />
        </div>
      </div>
    </section>
  )
}

const services = [
  {
    id: "hair",
    icon: Zap,
    title: "Hair Loss",
    description: "Clinically-proven treatments to help you keep and regrow your hair. Get your confidence back.",
    cta: "Find Your Solution",
  },
  {
    id: "skin",
    icon: Shield,
    title: "Skincare",
    description: "Custom-formulated skincare to combat aging, acne, and other common skin concerns.",
    cta: "Build Your Routine",
  },
  {
    id: "sexual-health",
    icon: Heart,
    title: "Sexual Health",
    description: "Discreet and effective solutions for erectile dysfunction and premature ejaculation.",
    cta: "Improve Performance",
  },
  {
    id: "testosterone",
    icon: TrendingUp,
    title: "Testosterone",
    description: "Optimize your energy, drive, and overall well-being with TRT, prescribed by licensed doctors.",
    cta: "Explore TRT",
  },
]

function ServicesSection() {
  return (
    <section id="services" className="relative py-20 md:py-28 bg-black">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-boxing-ring" />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="container mx-auto relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold font-display text-center tracking-tighter mb-12 text-white drop-shadow-lg">
          Focus On What Matters
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Link href={`#${service.id}`} key={service.id} className="group block h-full">
              <div className="relative flex flex-col justify-between p-6 overflow-hidden rounded-xl h-full bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 group-hover:border-primary/60 group-hover:bg-white/10 group-hover:-translate-y-2">
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-white">{service.title}</h3>
                  <p className="text-neutral-300 mt-2 text-sm leading-relaxed">{service.description}</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-medium text-neutral-400 transition-colors duration-300 group-hover:text-primary">
                  <span>{service.cta}</span>
                  <ArrowRight className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tighter mb-4">How It Works</h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-16">
          Simple, fast, and confidential care in three easy steps.
        </p>
        <div className="grid md:grid-cols-3 gap-8 text-left relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-800 -translate-y-1/2 hidden md:block"></div>
          <div
            className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-orange-400 animated-gradient hidden md:block"
            style={{ width: "66%" }}
          ></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center font-bold text-xl font-display mr-4">
                1
              </div>
              <h3 className="text-xl font-bold font-display">Online Visit</h3>
            </div>
            <p className="text-muted-foreground">
              Answer a few questions about your health and lifestyle. It's quick, easy, and secure.
            </p>
          </div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center font-bold text-xl font-display mr-4">
                2
              </div>
              <h3 className="text-xl font-bold font-display">Doctor Review</h3>
            </div>
            <p className="text-muted-foreground">
              A licensed physician reviews your information and prescribes a personalized treatment plan.
            </p>
          </div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-xl font-display mr-4">
                3
              </div>
              <h3 className="text-xl font-bold font-display">Discreet Delivery</h3>
            </div>
            <p className="text-muted-foreground">
              Your treatment is shipped directly to your door in discreet packaging by a licensed pharmacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const commitments = [
    {
      title: "Uncompromising Quality.",
      description:
        "We partner with leading physicians and pharmacies to provide only clinically-proven, effective treatments. No snake oil, no shortcuts.",
    },
    {
      title: "Radical Discretion.",
      description:
        "Your health is your business. Our platform ensures complete privacy with discreet packaging and secure, HIPAA-compliant communication.",
    },
    {
      title: "Effortless Experience.",
      description:
        "From online consultation to at-home delivery, we've streamlined every step. Care that fits your life, not the other way around.",
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-black">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tighter mb-6">
              Engineered for Excellence.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We're building the future of men's health on a foundation of trust, quality, and discretion. This is our
              promise to you.
            </p>
            <Button
              size="lg"
              className="rounded-full group text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="space-y-8">
            {commitments.map((commitment, index) => (
              <div
                key={index}
                className="border-l-2 border-primary pl-6 py-4 transition-all duration-300 hover:bg-neutral-900/50"
              >
                <h3 className="text-xl font-bold font-display text-white">{commitment.title}</h3>
                <p className="mt-2 text-neutral-400">{commitment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const faqs = [
  {
    question: "Is this legit?",
    answer:
      "Absolutely. All of our treatments are prescribed by licensed medical professionals and are FDA-approved. We adhere to the highest standards of medical care and patient privacy.",
  },
  {
    question: "How does the online visit work?",
    answer:
      "Our online visit consists of a dynamic questionnaire that covers your medical history and symptoms. Your answers are securely transmitted to a doctor who will review them and determine the best course of treatment for you.",
  },
  {
    question: "Is my information private?",
    answer:
      "Yes, your privacy is our top priority. We use bank-level encryption and are fully HIPAA compliant. Your information is confidential and will never be shared without your consent.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Our pricing is transparent and affordable. Treatment plans start at just $20/month. There are no hidden fees, and shipping is always free.",
  },
]

function FaqSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-bold font-display text-center tracking-tighter mb-12">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-lg font-semibold text-left hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold font-display mb-4">Adam</h3>
            <p className="text-sm text-muted-foreground">© 2025 BASKR Health (Private) Limited. All rights reserved.</p>
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
  )
}

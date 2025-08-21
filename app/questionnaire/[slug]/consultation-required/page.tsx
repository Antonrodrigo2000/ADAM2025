import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface ConsultationRequiredPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ConsultationRequiredPage({ params }: ConsultationRequiredPageProps) {
  const { slug } = await params
  
  // Validate that the slug is supported
  const supportedVerticals = ['hair-loss', 'sexual-health', 'erectile-dysfunction']
  
  if (!supportedVerticals.includes(slug)) {
    notFound()
  }

  const getVerticalContent = (vertical: string) => {
    switch (vertical) {
      case 'hair-loss':
        return {
          title: "Hair Loss Consultation Required",
          subtitle: "Let's find the right treatment for you",
          description: "Based on your responses, we recommend a consultation with our medical team to determine the most appropriate hair loss treatment for your specific case.",
          cta: "Book Hair Loss Consultation"
        }
      case 'erectile-dysfunction':
        return {
          title: "ED Consultation Required", 
          subtitle: "Personalized treatment approach",
          description: "Based on your responses, we recommend a consultation with our medical team to ensure the safest and most effective treatment for your specific situation.",
          cta: "Book ED Consultation"
        }
      case 'sexual-health':
        return {
          title: "Sexual Health Consultation Required",
          subtitle: "Expert guidance for your health",
          description: "Based on your responses, we recommend a consultation with our medical team to provide personalized guidance for your sexual health concerns.",
          cta: "Book Sexual Health Consultation"
        }
      default:
        return {
          title: "Consultation Required",
          subtitle: "Expert medical guidance",
          description: "Based on your responses, we recommend a consultation with our medical team to determine the best treatment approach.",
          cta: "Book Consultation"
        }
    }
  }

  const content = getVerticalContent(slug)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Content */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-neutral-300/20 via-neutral-100/30 to-neutral-300/20 backdrop-blur-md border border-white/30 rounded-full shadow-lg">
              <span className="text-sm font-medium text-white drop-shadow-sm">Next Steps</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tighter">
                {content.title}
              </h1>
              <p className="text-xl text-neutral-400">{content.subtitle}</p>
              <p className="text-neutral-500 leading-relaxed max-w-lg mx-auto">
                {content.description}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Link href="/consultation" className="group relative block w-full max-w-md mx-auto p-px overflow-hidden rounded-full">
              <div
                className="pointer-events-none absolute -inset-px rounded-full opacity-100 transition-opacity duration-500 group-hover:opacity-100 animate-spin-slow"
                style={{
                  background: `conic-gradient(from 0deg, #000000, #404040, #ffffff, #808080, #000000)`,
                  animationDuration: "3s",
                }}
              />
              <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 hover:from-neutral-800 hover:via-neutral-600 hover:to-neutral-800 text-white font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center border border-neutral-600">
                {content.cta}
                <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            
            <Link href="/" className="text-neutral-400 hover:text-neutral-300 text-sm transition-colors">
              ← Return to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  // Generate static params for known health verticals
  return [
    { slug: 'hair-loss' },
    { slug: 'sexual-health' },
    { slug: 'erectile-dysfunction' }
  ]
}
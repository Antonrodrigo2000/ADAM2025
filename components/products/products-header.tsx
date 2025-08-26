"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface ProductsHeaderProps {
  category?: string
  isRecommended?: boolean
  fromQuiz?: boolean
}

const categoryDisplayNames: Record<string, string> = {
  'erectile-dysfunction': 'Erectile Dysfunction',
  'premature-ejaculation': 'Premature Ejaculation',
  'hair-loss': 'Hair Loss',
}

const categoryDescriptions: Record<string, string> = {
  'erectile-dysfunction': 'Clinically proven treatments for erectile dysfunction, prescribed by licensed physicians.',
  'premature-ejaculation': 'Effective solutions for premature ejaculation, backed by medical research.',
  'hair-loss': 'Clinically proven hair loss treatments prescribed by licensed physicians.',
}

export function ProductsHeader({ category, isRecommended, fromQuiz }: ProductsHeaderProps) {
  const router = useRouter()
  
  const categoryName = category ? categoryDisplayNames[category] : null
  const categoryDescription = category ? categoryDescriptions[category] : null

  return (
    <div className="bg-gradient-to-b from-primary/5 to-background border-b">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back button for quiz flow */}
        {fromQuiz && (
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quiz Results
          </Button>
        )}

        <div className="max-w-4xl">
          {/* Recommended badge */}
          {isRecommended && (
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Recommended for You
              </Badge>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {categoryName ? (
              <>
                {categoryName} <span className="text-muted-foreground">Treatments</span>
              </>
            ) : (
              'All Products'
            )}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            {categoryDescription || 'Explore our full range of clinically proven treatments, all prescribed by licensed physicians and delivered discreetly to your door.'}
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Licensed Physicians</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Discreet Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Clinically Proven</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
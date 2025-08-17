import { createClient } from '@/lib/supabase/client'

export interface ConsultationValidationResult {
  isValid: boolean
  missingHealthVerticals: string[]
  requiresConsultation: boolean
}

export interface CartItemWithHealthVertical {
  product_id: string
  quantity: number
  price: number
  productName?: string
  variantName?: string
  image?: string
  monthlyPrice?: number
  months?: number
  prescriptionRequired?: boolean
  consultationFee?: number
  health_vertical_slug?: string
}

export class ConsultationValidationService {
  static async validateConsultationRequirements(
    cartItems: CartItemWithHealthVertical[],
    userId?: string
  ): Promise<ConsultationValidationResult> {
    try {
      // Filter items that require consultation
      const consultationItems = cartItems.filter(item => item.prescriptionRequired)
      
      if (consultationItems.length === 0) {
        return {
          isValid: true,
          missingHealthVerticals: [],
          requiresConsultation: false
        }
      }

      // If no user, all consultation items are missing responses
      if (!userId) {
        const healthVerticals = consultationItems
          .map(item => item.health_vertical_slug)
          .filter((slug, index, array) => slug && array.indexOf(slug) === index) as string[]
        
        return {
          isValid: false,
          missingHealthVerticals: healthVerticals,
          requiresConsultation: true
        }
      }

      // Get unique health verticals from consultation items
      const requiredHealthVerticals = consultationItems
        .map(item => item.health_vertical_slug)
        .filter((slug, index, array) => slug && array.indexOf(slug) === index) as string[]

      if (requiredHealthVerticals.length === 0) {
        // If no health verticals specified, can't validate - assume valid
        return {
          isValid: true,
          missingHealthVerticals: [],
          requiresConsultation: true
        }
      }

      const supabase = createClient()
      
      // Check which health verticals the user has completed questionnaires for
      const { data: userResponses, error } = await supabase
        .from('user_responses')
        .select(`
          questionnaire_id,
          questionnaires!inner(
            health_vertical_id,
            health_verticals!inner(slug)
          )
        `)
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching user responses:', error)
        // If we can't fetch responses, assume all are missing for safety
        return {
          isValid: false,
          missingHealthVerticals: requiredHealthVerticals,
          requiresConsultation: true
        }
      }

      // Get health verticals that user has completed
      const completedHealthVerticals = userResponses
        ?.map(response => (response as any).questionnaires?.health_verticals?.slug)
        .filter(Boolean) as string[] || []

      // Find missing health verticals
      const missingHealthVerticals = requiredHealthVerticals.filter(
        vertical => !completedHealthVerticals.includes(vertical)
      )

      return {
        isValid: missingHealthVerticals.length === 0,
        missingHealthVerticals,
        requiresConsultation: true
      }

    } catch (error) {
      console.error('Error validating consultation requirements:', error)
      // On error, assume validation failed for safety
      const healthVerticals = cartItems
        .filter(item => item.prescriptionRequired)
        .map(item => item.health_vertical_slug)
        .filter((slug, index, array) => slug && array.indexOf(slug) === index) as string[]
      
      return {
        isValid: false,
        missingHealthVerticals: healthVerticals,
        requiresConsultation: cartItems.some(item => item.prescriptionRequired)
      }
    }
  }

  static getHealthVerticalDisplayName(slug: string): string {
    const displayNames: Record<string, string> = {
      'hair-loss': 'Hair Loss',
      'erectile-dysfunction': 'Erectile Dysfunction',
      'premature-ejaculation': 'Premature Ejaculation',
      'skincare': 'Skincare',
      'weight-loss': 'Weight Loss'
    }
    
    return displayNames[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}
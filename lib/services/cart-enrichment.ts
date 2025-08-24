import { createClient } from '@/lib/supabase/client'

export interface EnrichedCartItem {
  product_id: string
  quantity: number
  price: number
  productName?: string
  variantName?: string
  image?: string
  monthlyPrice?: number
  months?: number
  consultationRequired?: boolean
  consultationFee?: number
  health_vertical_slug?: string
}

export class CartEnrichmentService {
  static async enrichCartItemsWithHealthVerticals(
    cartItems: Array<{
      product_id: string
      quantity: number
      price: number
      productName?: string
      variantName?: string
      image?: string
      monthlyPrice?: number
      months?: number
      consultationRequired?: boolean
      consultationFee?: number
    }>
  ): Promise<EnrichedCartItem[]> {
    try {
      const supabase = createClient()
      
      // Get unique product IDs
      const productIds = [...new Set(cartItems.map(item => item.product_id))]
      
      // Fetch health vertical information for products
      const { data: productMetadata, error } = await supabase
        .from('product_metadata')
        .select(`
          genie_product_id,
          health_vertical_id,
          health_verticals!inner(slug)
        `)
        .in('genie_product_id', productIds)

      if (error) {
        console.error('Error fetching product metadata:', error)
        // Return items without health vertical info if fetch fails
        return cartItems as EnrichedCartItem[]
      }

      // Create a map of product_id to health_vertical_slug
      const healthVerticalMap = new Map<string, string>()
      productMetadata?.forEach(metadata => {
        if (metadata.genie_product_id && (metadata as any).health_verticals?.slug) {
          healthVerticalMap.set(metadata.genie_product_id, (metadata as any).health_verticals.slug)
        }
      })

      // Enrich cart items with health vertical information
      return cartItems.map(item => ({
        ...item,
        health_vertical_slug: healthVerticalMap.get(item.product_id)
      }))

    } catch (error) {
      console.error('Error enriching cart items:', error)
      // Return items without health vertical info if enrichment fails
      return cartItems as EnrichedCartItem[]
    }
  }
}
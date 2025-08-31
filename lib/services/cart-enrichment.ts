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
  product_type?: 'normal' | 'consultation_required' | 'consultation_adhoc'
  is_adhoc_quantity?: boolean
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
      
      // Fetch health vertical and product type information for products
      const { data: productMetadata, error } = await supabase
        .from('product_metadata')
        .select(`
          genie_product_id,
          health_vertical_id,
          product_type,
          is_adhoc_quantity,
          health_verticals!inner(slug)
        `)
        .in('genie_product_id', productIds)

      if (error) {
        console.error('Error fetching product metadata:', error)
        // Return items without health vertical info if fetch fails
        return cartItems as EnrichedCartItem[]
      }

      // Create maps for product metadata
      const healthVerticalMap = new Map<string, string>()
      const productTypeMap = new Map<string, 'normal' | 'consultation_required' | 'consultation_adhoc'>()
      const adhocQuantityMap = new Map<string, boolean>()
      
      productMetadata?.forEach(metadata => {
        if (metadata.genie_product_id) {
          if ((metadata as any).health_verticals?.slug) {
            healthVerticalMap.set(metadata.genie_product_id, (metadata as any).health_verticals.slug)
          }
          if (metadata.product_type) {
            productTypeMap.set(metadata.genie_product_id, metadata.product_type)
          }
          if (metadata.is_adhoc_quantity !== null) {
            adhocQuantityMap.set(metadata.genie_product_id, metadata.is_adhoc_quantity)
          }
        }
      })

      // Enrich cart items with all metadata
      return cartItems.map(item => ({
        ...item,
        health_vertical_slug: healthVerticalMap.get(item.product_id),
        product_type: productTypeMap.get(item.product_id),
        is_adhoc_quantity: adhocQuantityMap.get(item.product_id)
      }))

    } catch (error) {
      console.error('Error enriching cart items:', error)
      // Return items without health vertical info if enrichment fails
      return cartItems as EnrichedCartItem[]
    }
  }
}
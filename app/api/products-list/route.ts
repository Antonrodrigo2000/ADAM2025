import { NextRequest, NextResponse } from 'next/server'
import { getEnvironmentImageUrl } from '@/lib/image-utils'
import { createClient } from '@/lib/supabase/server'

interface GenieProduct {
    id: string
    created: string
    updated: string
    name: string
    image: string[]
    categoryId: string
    description: string
    price: number
    locationId: string
    companyId: string
    currency: string
    taxes: Array<{
        id: string
        name: string
        code: string
        percentage: number
        applyOn: string
    }>
    stockLevel: number
    showDetailView: boolean
    detailViewContent: string
    productUrl: string
    sku: string
    productSlug: string
    deductFromStockLevel: boolean
    category: {
        id: string
        created: string
        updated: string
        name: string
        locationId: string
        companyId: string
        canDelete: boolean
        default: boolean
        productOrder: string[]
        description: string
        productCount: number
    }
}

interface GenieListResponse {
    items: GenieProduct[]
    count: number
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const categoryId = searchParams.get('categoryId')
        const name = searchParams.get('name')
        const sku = searchParams.get('sku')

        const shopId = process.env.GENIE_BUSINESS_SHOP_ID
        const apiUrl = process.env.GENIE_API_URL
        const apiKey = process.env.GENIE_BUSINESS_API_KEY

        if (!shopId || !apiUrl || !apiKey) {
            return NextResponse.json(
                { error: 'Missing API configuration' },
                { status: 500 }
            )
        }

        // Map category slugs to actual Genie category IDs from environment
        const categoryIdMapping: Record<string, string | undefined> = {
            'hair-loss': process.env.GENIE_HAIR_LOSS_CATEGORY_ID,
            'erectile-dysfunction': process.env.GENIE_ERECTILE_DYSFUNCTION_CATEGORY_ID,
            'premature-ejaculation': process.env.GENIE_PREMATURE_EJACULATION_CATEGORY_ID,
        }

        // Build query parameters for Genie API
        const params = new URLSearchParams()
        
        // Handle category filtering - support both direct categoryId and category slug mapping
        if (categoryId) {
            // Check if it's a category slug that needs mapping
            const mappedCategoryId = categoryIdMapping[categoryId]
            if (mappedCategoryId) {
                params.set('categoryId', mappedCategoryId)
                console.log(`🏷️ Mapped category slug '${categoryId}' to Genie category ID: ${mappedCategoryId}`)
            } else {
                // Use direct category ID (for backward compatibility)
                params.set('categoryId', categoryId)
            }
        }
        
        if (name) params.set('name', name)
        if (sku) params.set('sku', sku)

        const queryString = params.toString()
        const url = `${apiUrl}/public/shops/${shopId}/products${queryString ? '?' + queryString : ''}`

        console.log('🛒 Fetching products from Genie:', url)

        // Fetch products from Genie API
        const response = await fetch(url, {
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            console.error(`Genie API error: ${response.status} ${response.statusText}`)
            const errorText = await response.text()
            console.error('Error response:', errorText)
            throw new Error(`Genie API responded with status: ${response.status}`)
        }

        const genieResponse: GenieListResponse = await response.json()
        const supabase = await createClient()

        // Filter out consultation product
        const consultationProductId = process.env.NEXT_PUBLIC_GENIE_CONSULTATION_PRODUCT_ID
        const filteredProducts = consultationProductId 
            ? genieResponse.items.filter(product => product.id !== consultationProductId)
            : genieResponse.items

        console.log(`🚫 Filtered out consultation product (${consultationProductId}). Products: ${genieResponse.items.length} → ${filteredProducts.length}`)

        // Get product IDs for Supabase metadata lookup
        const productIds = filteredProducts.map(product => product.id)

        // Fetch Supabase metadata for all products
        const { data: metadata } = await supabase
            .from('product_metadata')
            .select(`
                *,
                health_verticals(name, slug)
            `)
            .in('genie_product_id', productIds)

        // Create a map of product ID to metadata for quick lookup
        const metadataMap = new Map(metadata?.map((m: any) => [m.genie_product_id, m]) || [])

        // Transform filtered Genie products with Supabase metadata
        const products = filteredProducts.map(genieProduct => {
            const productMetadata: any = metadataMap.get(genieProduct.id)

            return {
                // From Genie API
                id: genieProduct.id,
                name: genieProduct.name,
                slug: genieProduct.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-'),
                description: genieProduct.description || genieProduct.detailViewContent || '',
                price: genieProduct.price / 100, // Convert from cents
                originalPrice: genieProduct.price / 100, // For now, same as price
                images: genieProduct.image.map((imageUrl, index) => ({
                    id: `${genieProduct.id}-${index}`,
                    url: getEnvironmentImageUrl(imageUrl),
                    alt_text: `${genieProduct.name} - Image ${index + 1}`,
                    is_primary: index === 0,
                })),
                category: genieProduct.category,
                stock_level: genieProduct.stockLevel,
                currency: genieProduct.currency,
                taxes: genieProduct.taxes,
                sku: genieProduct.sku,

                // From Supabase metadata (with fallbacks)
                active_ingredient: productMetadata?.active_ingredient || '',
                dosage: productMetadata?.dosage || '',
                consultation_fee: productMetadata?.consultation_fee || 2000,
                consultation_required: productMetadata?.consultation_required || false,
                product_type: productMetadata?.product_type || 'normal',
                is_adhoc_quantity: productMetadata?.is_adhoc_quantity || false,
                health_vertical_id: productMetadata?.health_vertical_id || '',
                health_vertical: productMetadata?.health_verticals ? {
                    name: productMetadata.health_verticals.name,
                    slug: productMetadata.health_verticals.slug
                } : null,
                rating: productMetadata?.rating || 4.6,
                review_count: productMetadata?.review_count || 0,
                benefits: productMetadata?.benefits || [],
                how_it_works: productMetadata?.how_it_works || '',
                expected_timeline: productMetadata?.expected_timeline || '',
                side_effects: productMetadata?.side_effects || [],
                contraindications: productMetadata?.contraindications || [],
                warnings: productMetadata?.warnings || [],

                // Additional fields for listing view
                in_stock: genieProduct.stockLevel > 0,
                primary_image: genieProduct.image[0] ? getEnvironmentImageUrl(genieProduct.image[0]) : null,
            }
        })

        return NextResponse.json({
            products,
            count: filteredProducts.length,
            filters: {
                categoryId,
                name,
                sku
            }
        })

    } catch (error) {
        console.error('Error fetching products list from Genie:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}
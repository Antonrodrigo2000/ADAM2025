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

interface GenieResponse {
    items: GenieProduct[]
    count: number
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('id') // Genie product ID (required)

        if (!productId) {
            return NextResponse.json(
                { error: 'Product id or name is required' },
                { status: 400 }
            )
        }

        const shopId = process.env.GENIE_BUSINESS_SHOP_ID
        const apiUrl = process.env.GENIE_API_URL
        const apiKey = process.env.GENIE_BUSINESS_API_KEY
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!shopId || !apiUrl || !apiKey || !supabaseUrl || !supabaseKey) {
            return NextResponse.json(
                { error: 'Missing API configuration' },
                { status: 500 }
            )
        }

        const supabase = createClient()

        let genieProduct: GenieProduct

        if (productId) {
            // Fetch single product by ID (more efficient)
            const response = await fetch(`${apiUrl}/public/shops/${shopId}/products/${productId}`, {
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

            genieProduct = await response.json()

            // Fetch Supabase metadata for the single product
            const [metadataResult, ingredientsResult, clinicalStudiesResult, faqsResult] = await Promise.all([
                (await supabase)
                    .from('product_metadata')
                    .select(`
                *,
                    health_verticals(name, slug)
                `)
                    .eq('genie_product_id', genieProduct.id)
                    .single(),

                (await supabase)
                    .from('product_ingredients')
                    .select('*')
                    .eq('genie_product_id', genieProduct.id)
                    .order('display_order'),

                (await supabase)
                    .from('product_clinical_studies')
                    .select('*')
                    .eq('genie_product_id', genieProduct.id)
                    .order('display_order'),

                (await supabase)
                    .from('product_faqs')
                    .select('*')
                    .eq('genie_product_id', genieProduct.id)
                    .eq('is_active', true)
                    .order('display_order')
            ])


            const metadata = metadataResult.data
            const ingredients = ingredientsResult.data || []
            const clinicalStudies = clinicalStudiesResult.data || []
            const faqs = faqsResult.data || []

            // Merge Genie data with Supabase metadata
            const product = {
                // From Genie API
                id: genieProduct.id,
                name: genieProduct.name,
                slug: genieProduct.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-'),
                description: genieProduct.description || genieProduct.detailViewContent || '',
                price: genieProduct.price / 100, // Convert from cents
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

                // From Supabase metadata (with fallbacks)
                active_ingredient: metadata?.active_ingredient || '',
                dosage: metadata?.dosage || '',
                consultation_fee: metadata?.consultation_fee || 2000,
                prescription_required: metadata?.consultation_required || false, // Use renamed field
                health_vertical_id: metadata?.health_vertical_id || '',
                health_vertical: metadata?.health_verticals ? {
                    name: metadata.health_verticals.name,
                    slug: metadata.health_verticals.slug
                } : { name: 'Hair Loss', slug: 'hair-loss' },
                rating: metadata?.rating || 4.6,
                review_count: metadata?.review_count || 0,
                benefits: metadata?.benefits || [],
                how_it_works: metadata?.how_it_works || '',
                expected_timeline: metadata?.expected_timeline || '',
                side_effects: metadata?.side_effects || [],
                contraindications: metadata?.contraindications || [],
                warnings: metadata?.warnings || [],

                // From related tables
                ingredients: ingredients.map(ing => ({
                    name: ing.name,
                    dosage: ing.dosage,
                    description: ing.description
                })),
                clinical_studies: clinicalStudies.map(study => ({
                    title: study.title,
                    description: study.description,
                    efficacy_rate: study.efficacy_rate,
                    study_url: study.study_url
                })),
                faqs: faqs.map(faq => ({
                    question: faq.question,
                    answer: faq.answer
                }))
            }

            return NextResponse.json({
                product: product, // Return single product
                // Legacy format for backward compatibility
                products: [product],
                count: 1,
            })
        }

    } catch (error) {
        console.error('Error fetching products from Genie:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}


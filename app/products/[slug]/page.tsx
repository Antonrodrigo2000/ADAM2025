import type { Metadata } from "next"
import { ProductDetailPage } from "@/components/products/product-details-page"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: {
    slug: string
  }
  searchParams: Promise<{
    recommended?: string
    from?: string
  }>
}

async function fetchProductBySlug(slug: string) {
  try {
    // Check if slug is a Genie product ID (longer alphanumeric string)
    const isGenieId = slug.length > 10 && /^[a-zA-Z0-9]+$/.test(slug)
    
    let apiUrl: string
    if (isGenieId) {
      // Direct fetch by Genie product ID (more efficient)
      console.log(`Fetching product with ID: ${slug}`)
      apiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products?id=${encodeURIComponent(slug)}`
    } else {
      // Legacy: Extract product name from slug for API query
      const productName = slug.replace(/-/g, ' ')
      console.log(`Fetching product with name: ${productName}`)
      apiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products?name=${encodeURIComponent(productName)}`
    }
    
    const response = await fetch(apiUrl, { 
      cache: 'no-store' // Always fetch fresh data
    })

    console.log(`Fetching product with slug: ${slug}`, response)

    if (!response.ok) {
      throw new Error('Failed to fetch product')
    }

    const data = await response.json()
    
    if (isGenieId) {
      // Return the single product directly
      return data.product || null
    } else {
      // Legacy: Find the product that matches the slug exactly
      const product = data.products?.find((p: any) => 
        p.slug === slug || p.name.toLowerCase().replace(/\s+/g, '-') === slug
      )
      return product || null
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug)
  
  if (!product) {
    return {
      title: 'Product Not Found - ADAM Telehealth',
      description: 'The requested product could not be found.',
    }
  }

  return {
    title: `${product.name} - ADAM Telehealth`,
    description: product.description,
  }
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const product = await fetchProductBySlug(params.slug)

  if (!product) {
    console.error(`Product not found for slug: ${params.slug}`)
    notFound()
  }

  const resolvedSearchParams = await searchParams
  const isRecommended = resolvedSearchParams.recommended === 'true' && resolvedSearchParams.from === 'quiz'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="dark" />
      <ProductDetailPage product={product} isRecommended={isRecommended} />
      <Footer />
    </div>
  )
}

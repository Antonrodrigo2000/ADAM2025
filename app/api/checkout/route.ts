import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerAuth, createServerProfile } from '@/lib/contexts/auth-server'
import type { CartItem } from '@/lib/contexts/types'

interface CheckoutRequest {
  email: string
  password: string
  legalFirstName: string
  legalSurname: string
  dateOfBirth: string
  phoneNumber: string
  sex: string
  postcode: string
  city: string
  address: string
  agreeToTerms: boolean
  marketingOptOut: boolean
  cartItems: CartItem[]
  cartTotal: number
  quizResponses?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()
    
    // Validate required fields
    if (!body.email || !body.password || !body.legalFirstName || !body.legalSurname ||
        !body.dateOfBirth || !body.phoneNumber || !body.sex || !body.postcode ||
        !body.city || !body.address || !body.cartItems || body.cartTotal === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!body.agreeToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the terms and conditions' },
        { status: 400 }
      )
    }

    if (body.cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Step 1: Check if user already exists and is authenticated
    const { user: existingUser, isAuthenticated } = await getServerAuth()
    
    let userId: string
    let isNewUser = false

    if (isAuthenticated && existingUser) {
      // User is already authenticated
      userId = existingUser.id
    } else {
      // Step 2: Create new user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
          data: {
            first_name: body.legalFirstName,
            last_name: body.legalSurname,
          }
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        return NextResponse.json(
          { error: `Failed to create account: ${authError.message}` },
          { status: 400 }
        )
      }

      if (!authData.user) {
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        )
      }

      userId = authData.user.id
      isNewUser = true

      // Step 3: Create user profile using auth-server function
      // Use actual schema fields from migration 006
      const profileData = {
        first_name: body.legalFirstName,
        last_name: body.legalSurname,
        date_of_birth: body.dateOfBirth,
        phone: body.phoneNumber,
        address: {
          street: body.address,
          city: body.city,
          postcode: body.postcode,
          country: 'Sri Lanka'
        },
        sex: body.sex,
        agreed_to_terms: body.agreeToTerms,
        agreed_to_terms_at: body.agreeToTerms ? new Date().toISOString() : null,
        agreed_to_marketing: !body.marketingOptOut,
        agreed_to_marketing_at: !body.marketingOptOut ? new Date().toISOString() : null,
        marketing_preferences: {
          email: !body.marketingOptOut,
          sms: !body.marketingOptOut,
          newsletter: !body.marketingOptOut,
          productUpdates: !body.marketingOptOut
        },
        account_status: 'active',
        email_verified: false,
        phone_verified: false,
        verification_status: 'pending'
      }

      console.log('Creating profile with data:', profileData)
      const profile = await createServerProfile(userId, profileData)
      if (!profile) {
        console.error('Failed to create user profile')
        // Don't fail the entire request for profile creation
      } else {
        console.log('Profile created successfully:', profile)
      }
    }

    // Step 4: Save quiz responses if available
    if (body.quizResponses && Object.keys(body.quizResponses).length > 0) {
      // Get the hair-loss questionnaire ID
      const { data: questionnaire } = await supabase
        .from('questionnaires')
        .select('id')
        .eq('name', 'Hair Loss Assessment Questionnaire')
        .single()

      if (questionnaire) {
        const { error: quizError } = await supabase
          .from('user_responses')
          .insert({
            user_id: userId,
            questionnaire_id: questionnaire.id,
            responses: body.quizResponses,
            completed_at: new Date().toISOString()
          })

        if (quizError) {
          console.error('Failed to save quiz responses:', quizError)
          // Don't fail the entire request for quiz save
        }
      } else {
        console.error('Hair Loss Assessment Questionnaire not found')
      }
    }

    // Step 5: Get hair-loss health vertical ID
    const { data: healthVertical } = await supabase
      .from('health_verticals')
      .select('id')
      .eq('slug', 'hair-loss')
      .single()

    // Step 6: Create order record
    const orderData = {
      user_id: userId,
      health_vertical_id: healthVertical?.id || null,
      total_amount: body.cartTotal,
      status: 'pending',
      delivery_address: {
        street: body.address,
        city: body.city,
        postcode: body.postcode,
        country: 'Sri Lanka'
      },
      metadata: {
        userDetails: {
          email: body.email,
          firstName: body.legalFirstName,
          lastName: body.legalSurname,
          phone: body.phoneNumber,
          dateOfBirth: body.dateOfBirth,
          sex: body.sex
        }
      }
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Step 7: Create order items (store Genie product ID directly in product_id field)
    const orderItemsData = body.cartItems.map(item => ({
      order_id: order.id,
      product_id: item.productId, // Store Genie product ID directly as string
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.totalPrice,
      metadata: {
        productName: item.productName,
        variantId: item.variantId,
        variantName: item.variantName,
        months: item.months,
        monthlyPrice: item.monthlyPrice,
        consultationFee: item.consultationFee,
        prescriptionRequired: item.prescriptionRequired,
        selectedOptions: item.selectedOptions
      }
    }))

    console.log('Creating order items:', orderItemsData)
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData)

    if (itemsError) {
      console.error('Order items creation error:', itemsError)
      return NextResponse.json(
        { error: 'Failed to save order items' },
        { status: 500 }
      )
    }

    // Step 8: Prepare redirect response
    const redirectUrl = `/dashboard?order=${order.id}`

    // Step 9: Return success response
    return NextResponse.json({
      success: true,
      orderId: order.id,
      userId: userId,
      isNewUser,
      redirectUrl,
      message: isNewUser 
        ? 'Account created and order placed successfully' 
        : 'Order placed successfully'
    })

  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred during checkout'
      },
      { status: 500 }
    )
  }
}
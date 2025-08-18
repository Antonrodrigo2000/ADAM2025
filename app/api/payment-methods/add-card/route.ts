import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/contexts/auth-server'
import { GeniePaymentService } from '@/lib/services/genie-payment-service'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Get user profile with genie_customer_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, genie_customer_id, address')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    let genieCustomerId = userProfile.genie_customer_id

    // If user doesn't have a Genie customer ID, create one
    if (!genieCustomerId) {
      console.log('User does not have Genie customer ID, creating new customer')
      
      // Get user's email from auth
      const { data: authUser } = await supabase.auth.admin.getUserById(user.id)
      
      if (!authUser.user?.email) {
        return NextResponse.json(
          { error: 'User email not found' },
          { status: 400 }
        )
      }

      // Create Genie customer
      const customerData = {
        name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Customer',
        email: authUser.user.email,
        billingEmail: authUser.user.email,
        billingAddress1: userProfile.address?.street || '123 Main Street',
        billingCity: userProfile.address?.city || 'Colombo',
        billingCountry: userProfile.address?.country || 'LK',
        billingPostCode: userProfile.address?.postcode || '00100'
      }

      const customerResult = await GeniePaymentService.createCustomer(customerData)
      
      if (!customerResult.success || !customerResult.customerId) {
        return NextResponse.json(
          { error: customerResult.error || 'Failed to create customer' },
          { status: 500 }
        )
      }

      genieCustomerId = customerResult.customerId

      // Update user profile with genie_customer_id
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          genie_customer_id: genieCustomerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Failed to update user profile with genie_customer_id:', updateError)
        // Continue anyway as the customer was created successfully
      }
      
      console.log('Successfully created Genie customer:', genieCustomerId)
    } else {
      console.log('Using existing Genie customer ID:', genieCustomerId)
    }

    // Create add card transaction  
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    
    // Get the referring checkout session ID if available (from request headers or query params)
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    // Redirect back to the checkout payment page where user was adding the card
    const redirectUrl = sessionId 
      ? `${baseUrl}/checkout/${sessionId}/payment?cardAdded=true`
      : `${baseUrl}/checkout/payment?cardAdded=true`
    
    const webhookUrl = `${baseUrl}/api/webhooks/genie-payments`

    const transactionResult = await GeniePaymentService.createAddCardTransaction(
      genieCustomerId,
      redirectUrl,
      webhookUrl
    )

    if (!transactionResult.success || !transactionResult.transaction) {
      return NextResponse.json(
        { error: transactionResult.error || 'Failed to create add card transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      redirectUrl: transactionResult.transaction.url,
      transactionId: transactionResult.transaction.id
    })

  } catch (error) {
    console.error('Error in add card flow:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
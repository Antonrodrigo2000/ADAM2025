import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/contexts/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    const { data: paymentMethods, error } = await supabase
      .from('user_payment_methods')
      .select(`
        id,
        card_last_four,
        card_brand,
        card_type,
        cardholder_name,
        expiry_month,
        expiry_year,
        is_default,
        created_at,
        last_used_at
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payment methods:', error)
      return NextResponse.json(
        { error: 'Failed to fetch payment methods' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentMethods: paymentMethods || []
    })

  } catch (error) {
    console.error('Error in payment methods GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const paymentMethodId = searchParams.get('id')

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('user_payment_methods')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentMethodId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting payment method:', error)
      return NextResponse.json(
        { error: 'Failed to delete payment method' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in payment methods DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { paymentMethodId, isDefault } = await request.json()

    if (!paymentMethodId || typeof isDefault !== 'boolean') {
      return NextResponse.json(
        { error: 'Payment method ID and isDefault are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update the payment method
    const { error } = await supabase
      .from('user_payment_methods')
      .update({ 
        is_default: isDefault,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentMethodId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating payment method:', error)
      return NextResponse.json(
        { error: 'Failed to update payment method' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in payment methods PATCH:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
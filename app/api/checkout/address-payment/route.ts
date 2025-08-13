import { NextRequest, NextResponse } from 'next/server'
import { getServerAuth } from '@/contexts/auth-server'
import { getUserAddressPaymentData } from '../services/address-payment'

export async function GET(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getServerAuth()
    
    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const addressPaymentData = await getUserAddressPaymentData(user.id)
    
    if (!addressPaymentData) {
      return NextResponse.json(
        { error: 'Failed to fetch address and payment data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: addressPaymentData
    })

  } catch (error) {
    console.error('Address/Payment API error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getServerAuth()
    
    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { deliveryAddress, paymentMethod } = body

    // Here you would update the user's address and process payment
    // This is a placeholder for the actual implementation
    
    return NextResponse.json({
      success: true,
      message: 'Address and payment updated successfully',
      orderId: 'generated-order-id' // Replace with actual order creation
    })

  } catch (error) {
    console.error('Address/Payment update error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}
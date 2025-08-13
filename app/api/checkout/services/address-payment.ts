import { createClient } from '@/lib/supabase/server'
import type { AddressPaymentData, PaymentCard } from './flow-types'

export async function getUserAddressPaymentData(userId: string): Promise<AddressPaymentData | null> {
  try {
    const supabase = await createClient()
    
    // Get user profile for address
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('address')
      .eq('id', userId)
      .single()
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return null
    }
    
    // Get user payment cards from the actual user_payment_methods table
    const paymentCards = await getUserPaymentCards(userId)
    
    return {
      deliveryAddress: profile.address || {
        street: '',
        city: '',
        postcode: '',
        country: 'Sri Lanka'
      },
      paymentCards: paymentCards || []
    }
  } catch (error) {
    console.error('Error fetching address/payment data:', error)
    return null
  }
}

async function getUserPaymentCards(userId: string): Promise<PaymentCard[]> {
  try {
    const supabase = await createClient()
    
    const { data: paymentMethods, error } = await supabase
      .from('user_payment_methods')
      .select(`
        id,
        card_last_four,
        card_brand,
        expiry_month,
        expiry_year,
        is_default
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching payment methods:', error)
      return []
    }
    
    return paymentMethods.map(method => ({
      id: method.id,
      last4: method.card_last_four,
      brand: method.card_brand || 'unknown',
      expiryMonth: method.expiry_month,
      expiryYear: method.expiry_year,
      isDefault: method.is_default
    }))
  } catch (error) {
    console.error('Error fetching payment cards:', error)
    return []
  }
}
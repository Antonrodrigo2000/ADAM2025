import { createClient } from "@/lib/supabase/server"

export interface GenieCustomerData {
  name: string
  email: string
  billingEmail: string
  billingAddress1: string
  billingCity: string
  billingCountry: string
  billingPostCode: string
  currency: string
  externalId: string
}

export interface GenieCustomerResponse {
  success: boolean
  customerId?: string
  error?: string
}

export async function createGenieCustomer(customerData: GenieCustomerData): Promise<GenieCustomerResponse> {
  try {
    const genieApiUrl = process.env.GENIE_API_URL
    const genieApiKey = process.env.GENIE_BUSINESS_API_KEY

    if (!genieApiUrl || !genieApiKey) {
      console.error('Missing Genie API configuration')
      return {
        success: false,
        error: 'Genie API configuration missing'
      }
    }

    const response = await fetch(`${genieApiUrl}/public-customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': genieApiKey
      },
      body: JSON.stringify(customerData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Genie API error:', response.status, errorText)
      return {
        success: false,
        error: `Genie API error: ${response.status}`
      }
    }

    const result = await response.json()
    const customerId = result.id || result._id || result.customerId
    
    if (customerId) {
      // Update user profile with Genie customer ID
      await updateUserProfileWithGenieId(customerData.externalId, customerId)
    }
    
    return {
      success: true,
      customerId
    }

  } catch (error) {
    console.error('Error creating Genie customer:', error)
    return {
      success: false,
      error: 'Failed to create Genie customer'
    }
  }
}

async function updateUserProfileWithGenieId(userId: string, genieCustomerId: string): Promise<void> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        genie_customer_id: genieCustomerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update user profile with Genie customer ID:', error)
    } else {
      console.log('Successfully updated user profile with Genie customer ID:', genieCustomerId)
    }
  } catch (error) {
    console.error('Error updating user profile with Genie customer ID:', error)
  }
}

export function buildGenieCustomerData(signupData: any, userId: string): GenieCustomerData {
  return {
    name: `${signupData.legalFirstName} ${signupData.legalSurname}`,
    email: signupData.email,
    billingEmail: signupData.email,
    billingAddress1: signupData.address || 'Default Address',
    billingCity: signupData.city || 'Colombo',
    billingCountry: 'Sri Lanka',
    billingPostCode: signupData.postcode || '00000',
    currency: 'LKR',
    externalId: userId
  }
}
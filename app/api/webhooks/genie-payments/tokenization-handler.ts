import { createServiceRoleClient } from '@/lib/supabase/server'
import { GeniePaymentService } from '@/lib/services/genie-payment-service'
import { GenieTokenizationWebhook } from './types'

export async function handleTokenizationWebhook(data: GenieTokenizationWebhook): Promise<void> {
    if (data.tokenisationStatus !== 'TOKENISATION_SUCCESS') {
        console.log('Tokenization failed for customer:', data.customerId)
        return
    }

    try {
        const supabase = createServiceRoleClient()

        const { data: userProfile, error: userError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('genie_customer_id', data.customerId)
            .single()

        if (userError || !userProfile) {
            console.error('User not found for genie customer ID:', data.customerId, userError)
            return
        }

        const tokensResult = await GeniePaymentService.getCustomerTokens(data.customerId)

        if (!tokensResult.success || !tokensResult.tokens) {
            console.error('Failed to fetch customer tokens:', tokensResult.error)
            return
        }

        for (const token of tokensResult.tokens) {
            const { data: existingPaymentMethod } = await supabase
                .from('user_payment_methods')
                .select('id')
                .eq('payment_token', token.token)
                .eq('user_id', userProfile.id)
                .single()

            if (!existingPaymentMethod) {
                const last4 = token.paddedCardNumber.slice(-4)

                const twoDigitYear = parseInt(token.tokenExpiryYear)
                const currentYear = new Date().getFullYear()
                const currentCentury = Math.floor(currentYear / 100) * 100

                let fullYear = currentCentury + twoDigitYear
                if (twoDigitYear < (currentYear % 100)) {
                    fullYear += 100
                }

                console.log('Converting expiry year:', {
                    tokenExpiryYear: token.tokenExpiryYear,
                    twoDigitYear,
                    fullYear,
                    currentYear
                })

                const { error: insertError } = await supabase
                    .from('user_payment_methods')
                    .insert({
                        user_id: userProfile.id,
                        payment_token: token.token,
                        gateway_provider: 'genie_business',
                        card_last_four: last4,
                        card_brand: token.brand.toLowerCase(),
                        expiry_month: parseInt(token.tokenExpiryMonth),
                        expiry_year: fullYear,
                        is_default: token.defaultToken,
                        is_active: true,
                        gateway_metadata: {
                            genie_token_id: token.id,
                            genie_customer_id: data.customerId,
                            token_type: token.tokenType,
                            provider: token.provider,
                            created_at: token.createdAt,
                            updated_at: token.updatedAt
                        }
                    })

                if (insertError) {
                    console.error('Error inserting payment method:', insertError)
                } else {
                    console.log('Successfully stored payment method for user:', userProfile.id)
                }
            }
        }
    } catch (error) {
        console.error('Error handling tokenization webhook:', error)
    }
}
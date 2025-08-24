import * as crypto from 'crypto'

export function verifyWebhookSignature(headers: Headers, body: string): boolean {
    try {
        const nonce = headers.get('X-Signature-Nonce')
        const timestamp = headers.get('X-Signature-Timestamp')
        const signature = headers.get('X-Signature')
        const apiKey = process.env.GENIE_BUSINESS_API_KEY

        if (!nonce || !timestamp || !signature || !apiKey) {
            console.log('Missing signature headers or API key')
            return false
        }

        const signString = `${nonce}${timestamp}${apiKey}`
        const generatedSignature = crypto.createHash('sha256').update(signString).digest('hex')

        return signature === generatedSignature
    } catch (error) {
        console.error('Error verifying webhook signature:', error)
        return false
    }
}
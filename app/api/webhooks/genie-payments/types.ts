export interface GenieWebhookData {
    eventType: 'NOTIFY_TOKENISATION_STATUS' | 'NOTIFY_TRANSACTION_CHANGE'
    customerId?: string
    transactionId?: string
    tokenisationStatus?: 'TOKENISATION_SUCCESS' | 'TOKENISATION_FAILED'
    state?: 'INITIATED' | 'QR_CODE_GENERATED' | 'CONFIRMED' | 'VOIDED' | 'FAILED' | 'CANCELLED'
    amount?: number
    currency?: string
    provider?: string
    created?: string
    updated?: string
}

export interface GenieTokenizationWebhook extends GenieWebhookData {
    eventType: 'NOTIFY_TOKENISATION_STATUS'
    customerId: string
    transactionId: string
    tokenisationStatus: 'TOKENISATION_SUCCESS' | 'TOKENISATION_FAILED'
}

export interface GenieTransactionWebhook extends GenieWebhookData {
    eventType: 'NOTIFY_TRANSACTION_CHANGE'
    transactionId: string
    state: 'INITIATED' | 'QR_CODE_GENERATED' | 'CONFIRMED' | 'VOIDED' | 'FAILED' | 'CANCELLED'
    localId?: string
}

export interface ConsultationOrderData {
    userId: string
    cartItems: any[]
    paymentMethodId: string
    deliveryAddress: any
    consultationTransactionId: string
    paymentMetadata: any
    sessionId: string
}
interface GenieCustomer {
  name: string
  email: string
  billingEmail: string
  billingAddress1: string
  billingAddress2?: string
  billingCity: string
  billingCountry: string
  billingPostCode: string
}

interface GenieTransaction {
  amount: number
  currency: string
  customerId?: string
  customer?: GenieCustomer
  tokenizationDetails?: {
    tokenize: boolean
    paymentType: 'UNSCHEDULED' | 'RECURRING'
    recurringFrequency?: 'UNSCHEDULED' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  }
  addCardToVault?: boolean
  provider?: string
  paymentPortalExperience?: {
    externalWebsiteTermsAccepted?: boolean
    externalWebsiteTermsUrl?: string
    skipCustomerForm?: boolean
    skipProviderSelection?: boolean
    hideTermsAndConditions?: boolean
  }
  webhook?: string
  redirectUrl?: string
}

interface GenieTransactionResponse {
  id: string
  url: string
  customerId?: string
  state: 'INITIATED' | 'QR_CODE_GENERATED' | 'CONFIRMED' | 'VOIDED' | 'FAILED' | 'CANCELLED'
  amount: number
  currency: string
  shortUrl: string
}

interface GenieCustomerToken {
  id: string
  token: string
  defaultToken: boolean
  tokenType: 'CARD'
  provider: string
  brand: string
  paddedCardNumber: string
  tokenExpiryMonth: string
  tokenExpiryYear: string
  customerId: string
  createdAt: string
  updatedAt: string
}

interface GenieTokenListResponse {
  items: GenieCustomerToken[]
  count: number
}

export class GeniePaymentService {
  private static readonly BASE_URL = process.env.GENIE_API_URL || 'https://api.geniebiz.lk'
  private static readonly API_KEY = process.env.GENIE_BUSINESS_API_KEY

  private static getHeaders() {
    if (!this.API_KEY) {
      throw new Error('GENIE_BUSINESS_API_KEY environment variable is required')
    }
    
    // Try different auth header formats based on Genie documentation
    return {
      'Authorization': this.API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Create a Genie customer
   */
  static async createCustomer(customerData: GenieCustomer): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/public/customers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Genie customer creation failed:', response.status, errorText)
        return { success: false, error: `Failed to create customer: ${response.status}` }
      }

      const result = await response.json()
      return { success: true, customerId: result.id }
    } catch (error) {
      console.error('Error creating Genie customer:', error)
      return { success: false, error: 'Network error creating customer' }
    }
  }

  /**
   * Create a transaction for adding a card to vault (without charging)
   */
  static async createAddCardTransaction(
    customerId: string,
    redirectUrl?: string,
    webhookUrl?: string
  ): Promise<{ success: boolean; transaction?: GenieTransactionResponse; error?: string }> {
    try {
      const transactionData: GenieTransaction = {
        amount: 30, // Minimal amount for card validation (as per docs)
        currency: 'LKR',
        customerId,
        addCardToVault: true,
        provider: 'card_payments',
        tokenizationDetails: {
          tokenize: true,
          paymentType: 'UNSCHEDULED',
          recurringFrequency: 'UNSCHEDULED'
        },
        paymentPortalExperience: {
          externalWebsiteTermsAccepted: true,
          externalWebsiteTermsUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/terms`,
          skipCustomerForm: true,
          skipProviderSelection: true,
          hideTermsAndConditions: true,
        },
        webhook: webhookUrl,
        redirectUrl: redirectUrl
      }

      const response = await fetch(`${this.BASE_URL}/public/v2/transactions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Genie transaction creation failed:', response.status, errorText)
        console.error('Request payload was:', JSON.stringify(transactionData, null, 2))
        return { success: false, error: `Failed to create transaction: ${response.status} - ${errorText}` }
      }

      const result = await response.json()
      return { success: true, transaction: result }
    } catch (error) {
      console.error('Error creating add card transaction:', error)
      return { success: false, error: 'Network error creating transaction' }
    }
  }

  /**
   * Create a transaction for tokenizing a card during payment
   */
  static async createTokenizedPaymentTransaction(
    customerId: string,
    amount: number,
    redirectUrl: string,
    webhookUrl: string,
    isNewCustomer: boolean = false,
    customerData?: GenieCustomer
  ): Promise<{ success: boolean; transaction?: GenieTransactionResponse; error?: string }> {
    try {
      const transactionData: GenieTransaction = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'LKR',
        tokenizationDetails: {
          tokenize: true,
          paymentType: 'UNSCHEDULED',
          recurringFrequency: 'UNSCHEDULED',
        },
        webhook: webhookUrl,
        redirectUrl,
      }

      // Add customer data if creating new customer
      if (isNewCustomer && customerData) {
        transactionData.customer = customerData
      } else {
        transactionData.customerId = customerId
      }

      const response = await fetch(`${this.BASE_URL}/public/v2/transactions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Genie payment transaction creation failed:', response.status, errorText)
        return { success: false, error: `Failed to create payment transaction: ${response.status}` }
      }

      const result = await response.json()
      return { success: true, transaction: result }
    } catch (error) {
      console.error('Error creating payment transaction:', error)
      return { success: false, error: 'Network error creating payment transaction' }
    }
  }

  /**
   * Get stored payment methods for a customer
   */
  static async getCustomerTokens(customerId: string): Promise<{ success: boolean; tokens?: GenieCustomerToken[]; error?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/public-customers/${customerId}/tokens`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch customer tokens:', response.status, errorText)
        return { success: false, error: `Failed to fetch tokens: ${response.status}` }
      }

      const result: GenieTokenListResponse = await response.json()
      return { success: true, tokens: result.items }
    } catch (error) {
      console.error('Error fetching customer tokens:', error)
      return { success: false, error: 'Network error fetching tokens' }
    }
  }

  /**
   * Charge a stored token
   */
  static async chargeStoredToken(
    customerId: string,
    transactionId: string,
    tokenId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const chargeData: any = {
        customerId,
        transactionId,
      }

      // Add tokenId if specified, otherwise default token will be used
      if (tokenId) {
        chargeData.tokenId = tokenId
      }

      const response = await fetch(`${this.BASE_URL}/public/stored-token/charge`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(chargeData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to charge stored token:', response.status, errorText)
        return { success: false, error: `Failed to charge token: ${response.status}` }
      }

      return { success: true }
    } catch (error) {
      console.error('Error charging stored token:', error)
      return { success: false, error: 'Network error charging token' }
    }
  }

  /**
   * Create a transaction for charging existing token
   */
  static async createStoredTokenPaymentTransaction(
    customerId: string,
    amount: number,
    webhookUrl: string
  ): Promise<{ success: boolean; transaction?: GenieTransactionResponse; error?: string }> {
    try {
      const transactionData: GenieTransaction = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'LKR',
        customerId,
        tokenizationDetails: {
          tokenize: false,
          paymentType: 'UNSCHEDULED',
        },
        webhook: webhookUrl,
      }

      const response = await fetch(`${this.BASE_URL}/public/v2/transactions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Genie stored token transaction creation failed:', response.status, errorText)
        return { success: false, error: `Failed to create stored token transaction: ${response.status}` }
      }

      const result = await response.json()
      return { success: true, transaction: result }
    } catch (error) {
      console.error('Error creating stored token transaction:', error)
      return { success: false, error: 'Network error creating stored token transaction' }
    }
  }

  /**
   * Get transaction details
   */
  static async getTransaction(transactionId: string): Promise<{ success: boolean; transaction?: any; error?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/public/v2/transactions/${transactionId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch transaction:', response.status, errorText)
        return { success: false, error: `Failed to fetch transaction: ${response.status}` }
      }

      const result = await response.json()
      return { success: true, transaction: result }
    } catch (error) {
      console.error('Error fetching transaction:', error)
      return { success: false, error: 'Network error fetching transaction' }
    }
  }
}
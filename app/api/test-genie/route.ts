import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const apiUrl = process.env.GENIE_API_URL
    const apiKey = process.env.GENIE_BUSINESS_API_KEY
    
    if (!apiUrl) {
      return NextResponse.json({ error: 'GENIE_API_URL not set' }, { status: 500 })
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: 'GENIE_BUSINESS_API_KEY not set' }, { status: 500 })
    }

    // Test a simple API call to check connectivity and auth
    const headers = {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    }

    console.log('Testing Genie API with URL:', apiUrl)
    console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...')

    // Try to create a minimal test transaction to see what error we get
    const testData = {
      amount: 100,
      currency: 'LKR'
    }

    const response = await fetch(`${apiUrl}/public/v2/transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testData),
    })

    const responseText = await response.text()
    
    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText,
      requestHeaders: headers,
      requestBody: testData,
      url: `${apiUrl}/public/v2/transactions`
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      error: 'Network error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
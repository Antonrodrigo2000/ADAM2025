'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function TestAuthPage() {
  const [result, setResult] = useState<string>('')
  
  const testSignIn = async () => {
    const supabase = createClient()
    
    try {
      console.log('Testing sign in...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      })
      
      console.log('Sign in result:', { data, error })
      setResult(`Success: ${data.user?.email}, Error: ${error?.message}`)
    } catch (err) {
      console.error('Sign in error:', err)
      setResult(`Exception: ${err}`)
    }
  }
  
  const testSession = async () => {
    const supabase = createClient()
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('Session result:', { session, error })
      setResult(`Session: ${session?.user?.email}, Error: ${error?.message}`)
    } catch (err) {
      console.error('Session error:', err)
      setResult(`Exception: ${err}`)
    }
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Auth Test</h1>
      <div className="space-y-4">
        <button 
          onClick={testSignIn}
          className="bg-blue-500 text-white p-2 rounded mr-4"
        >
          Test Sign In
        </button>
        <button 
          onClick={testSession}
          className="bg-green-500 text-white p-2 rounded"
        >
          Test Session
        </button>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <strong>Result:</strong> {result}
        </div>
      </div>
    </div>
  )
}
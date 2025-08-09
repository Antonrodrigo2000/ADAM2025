import { NextResponse } from 'next/server'
import { signOutServer } from '@/contexts/auth-server'

export async function POST() {
  const result = await signOutServer()
  
  if (result.success) {
    return NextResponse.json({
      success: true,
      message: 'Signed out successfully'
    })
  } else {
    return NextResponse.json(
      { error: result.error || 'Failed to sign out' },
      { status: 500 }
    )
  }
}
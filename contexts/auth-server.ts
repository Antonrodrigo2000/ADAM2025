import { createClient } from '@/lib/supabase/server'
import { User } from './types'

export async function getServerUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const { data: { user: authUser }, error } = await supabase.auth.getUser()
    
    if (error || !authUser) {
      return null
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (profileError) {
      console.error('Failed to load profile:', profileError)
    }

    const user: User = {
      id: authUser.id,
      email: authUser.email || '',
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      profile: profile || undefined
    }

    return user
  } catch (error) {
    console.error('Failed to get server user:', error)
    return null
  }
}

export async function getServerAuth() {
  try {
    const supabase = await createClient()
    const { data: { user: authUser }, error } = await supabase.auth.getUser()
    
    if (error) {
      return { user: null, isAuthenticated: false, error: error.message }
    }

    if (!authUser) {
      return { user: null, isAuthenticated: false, error: null }
    }

    const user = await getServerUser()
    return { user, isAuthenticated: !!user, error: null }
  } catch (error) {
    return { 
      user: null, 
      isAuthenticated: false, 
      error: error instanceof Error ? error.message : 'Failed to get auth state' 
    }
  }
}

export async function createServerProfile(userId: string, profileData: any): Promise<any | null> {
  try {
    const supabase = await createClient()
    const { data: newProfile, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        ...profileData
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create server profile:', error)
      return null
    }

    return newProfile
  } catch (error) {
    console.error('Failed to create server profile:', error)
    return null
  }
}

export async function signOutServer() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Server sign out error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Server sign out error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sign out' 
    }
  }
}
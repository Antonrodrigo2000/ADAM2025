// 'use client'

// import React, { createContext, useContext, useReducer, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
// import { AuthState, AuthActions, User, UserProfile, MarketingPreferences } from './types'

// // Initial state
// const initialAuthState: AuthState = {
//     user: null,
//     isAuthenticated: false,
//     isLoading: true,
//     error: null,
// }

// // Action types
// type AuthActionType =
//     | { type: 'SIGN_IN_START' }
//     | { type: 'SIGN_IN_SUCCESS'; user: User }
//     | { type: 'SIGN_IN_ERROR'; error: string }
//     | { type: 'SIGN_UP_START' }
//     | { type: 'SIGN_UP_SUCCESS'; user: User }
//     | { type: 'SIGN_UP_ERROR'; error: string }
//     | { type: 'SIGN_OUT' }
//     | { type: 'UPDATE_PROFILE_START' }
//     | { type: 'UPDATE_PROFILE_SUCCESS'; profile: UserProfile }
//     | { type: 'UPDATE_PROFILE_ERROR'; error: string }
//     | { type: 'CLEAR_ERROR' }
//     | { type: 'SET_LOADING'; loading: boolean }
//     | { type: 'LOAD_USER'; user: User }

// // Reducer
// function authReducer(state: AuthState, action: AuthActionType): AuthState {
//     switch (action.type) {
//         case 'SIGN_IN_START':
//         case 'SIGN_UP_START':
//         case 'UPDATE_PROFILE_START':
//             return {
//                 ...state,
//                 isLoading: true,
//                 error: null,
//             }

//         case 'SIGN_IN_SUCCESS':
//         case 'SIGN_UP_SUCCESS':
//             return {
//                 ...state,
//                 user: action.user,
//                 isAuthenticated: true,
//                 isLoading: false,
//                 error: null,
//             }

//         case 'SIGN_IN_ERROR':
//         case 'SIGN_UP_ERROR':
//         case 'UPDATE_PROFILE_ERROR':
//             return {
//                 ...state,
//                 isLoading: false,
//                 error: action.error,
//             }

//         case 'SIGN_OUT':
//             return {
//                 ...initialAuthState,
//                 isLoading: false,
//             }

//         case 'UPDATE_PROFILE_SUCCESS':
//             return {
//                 ...state,
//                 user: state.user ? { ...state.user, profile: action.profile } : null,
//                 isLoading: false,
//                 error: null,
//             }

//         case 'CLEAR_ERROR':
//             return {
//                 ...state,
//                 error: null,
//             }

//         case 'SET_LOADING':
//             return {
//                 ...state,
//                 isLoading: action.loading,
//             }

//         case 'LOAD_USER':
//             return {
//                 ...state,
//                 user: action.user,
//                 isAuthenticated: true,
//                 isLoading: false,
//             }

//         default:
//             return state
//     }
// }

// // Context
// interface AuthContextType {
//     state: AuthState
//     actions: AuthActions
// }

// const AuthContext = createContext<AuthContextType | null>(null)

// // Provider
// export function AuthProvider({ children }: { children: React.ReactNode }) {
//     const [state, dispatch] = useReducer(authReducer, initialAuthState)
//     const router = useRouter()
//     const supabase = createClient()

//     // Check for existing session on mount
//     useEffect(() => {
//         let mounted = true

//         const checkExistingSession = async () => {
//             try {
//                 const { data: { session }, error } = await supabase.auth.getSession()

//                 if (!mounted) return

//                 if (error) {
//                     console.error('Error getting session:', error)
//                     dispatch({ type: 'SET_LOADING', loading: false })
//                     return
//                 }

//                 if (session?.user) {
//                     // Get user profile from database (use maybeSingle to handle no rows)
//                     const { data: profile, error: profileError } = await supabase
//                         .from('user_profiles')
//                         .select('*')
//                         .eq('id', session.user.id)
//                         .maybeSingle()

//                     if (profileError) {
//                         console.error('Failed to load existing profile:', profileError)
//                     }

//                     // If no profile exists, create a basic one
//                     let userProfile = profile
//                     if (!profile && !profileError) {
//                         const { data: newProfile, error: createError } = await supabase
//                             .from('user_profiles')
//                             .insert({
//                                 id: session.user.id,
//                                 first_name: '',
//                                 last_name: '',
//                                 account_status: 'active',
//                                 verification_status: 'pending'
//                             })
//                             .select()
//                             .single()

//                         if (createError) {
//                             console.error('Failed to create basic profile:', createError)
//                         } else {
//                             userProfile = newProfile
//                         }
//                     }

//                     if (!mounted) return

//                     const user: User = {
//                         id: session.user.id,
//                         email: session.user.email || '',
//                         firstName: userProfile?.first_name || '',
//                         lastName: userProfile?.last_name || '',
//                         profile: userProfile || undefined
//                     }

//                     dispatch({ type: 'LOAD_USER', user })
//                 } else {
//                     dispatch({ type: 'SET_LOADING', loading: false })
//                 }
//             } catch (error) {
//                 console.error('Failed to load user session:', error)
//                 if (mounted) {
//                     dispatch({ type: 'SET_LOADING', loading: false })
//                 }
//             }
//         }

//         checkExistingSession()

//         // Listen for auth changes
//         const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
//             if (!mounted) return

//             if (event === 'SIGNED_IN' && session?.user) {
//                 // Get user profile from database (use maybeSingle to handle no rows)
//                 const { data: profile, error: profileError } = await supabase
//                     .from('user_profiles')
//                     .select('*')
//                     .eq('id', session.user.id)
//                     .maybeSingle()

//                 if (profileError) {
//                     console.error('Failed to load profile:', profileError)
//                 }

//                 // If no profile exists, create a basic one
//                 let userProfile = profile
//                 if (!profile && !profileError) {
//                     const { data: newProfile, error: createError } = await supabase
//                         .from('user_profiles')
//                         .insert({
//                             id: session.user.id,
//                             first_name: '',
//                             last_name: '',
//                             account_status: 'active',
//                             verification_status: 'pending'
//                         })
//                         .select()
//                         .single()

//                     if (createError) {
//                         console.error('Failed to create basic profile:', createError)
//                     } else {
//                         userProfile = newProfile
//                     }
//                 }

//                 if (!mounted) return

//                 const user: User = {
//                     id: session.user.id,
//                     email: session.user.email || '',
//                     firstName: userProfile?.first_name || '',
//                     lastName: userProfile?.last_name || '',
//                     profile: userProfile || undefined
//                 }

//                 dispatch({ type: 'SIGN_IN_SUCCESS', user })
//             } else if (event === 'SIGNED_OUT') {
//                 dispatch({ type: 'SIGN_OUT' })
//             }
//         })

//         return () => {
//             mounted = false
//             subscription.unsubscribe()
//         }
//     }, [])

//     // Handle redirects on auth state changes
//     useEffect(() => {
//         if (state.isAuthenticated && state.user && !state.isLoading) {
//             // Redirect to dashboard from auth pages (auth page or checkout)
//             if (typeof window !== 'undefined') {
//                 const currentPath = window.location.pathname
//                 if (currentPath === '/auth' || currentPath === '/checkout') {
//                     router.push('/dashboard')
//                 }
//             }
//         }
//     }, [state.isAuthenticated, state.user, state.isLoading, router])

//     // Actions
//     const actions: AuthActions = {
//         signIn: async (email: string, password: string) => {
//             dispatch({ type: 'SIGN_IN_START' })

//             try {
//                 const { data, error } = await supabase.auth.signInWithPassword({
//                     email,
//                     password,
//                 })

//                 if (error) {
//                     throw new Error(error.message)
//                 }

//                 if (data.user) {
//                     // Get user profile from database immediately (use maybeSingle to handle no rows)
//                     const { data: profile, error: profileError } = await supabase
//                         .from('user_profiles')
//                         .select('*')
//                         .eq('id', data.user.id)
//                         .maybeSingle()

//                     if (profileError) {
//                         console.error('Failed to load profile on sign in:', profileError)
//                     }

//                     // If no profile exists, create a basic one
//                     let userProfile = profile
//                     if (!profile && !profileError) {
//                         const { data: newProfile, error: createError } = await supabase
//                             .from('user_profiles')
//                             .insert({
//                                 id: data.user.id,
//                                 first_name: '',
//                                 last_name: '',
//                                 account_status: 'active',
//                                 verification_status: 'pending'
//                             })
//                             .select()
//                             .single()

//                         if (createError) {
//                             console.error('Failed to create basic profile:', createError)
//                         } else {
//                             userProfile = newProfile
//                         }
//                     }

//                     const user: User = {
//                         id: data.user.id,
//                         email: data.user.email || '',
//                         firstName: userProfile?.first_name || '',
//                         lastName: userProfile?.last_name || '',
//                         profile: userProfile || undefined
//                     }

//                     dispatch({ type: 'SIGN_IN_SUCCESS', user })
//                 }
//             } catch (error) {
//                 dispatch({ type: 'SIGN_IN_ERROR', error: error instanceof Error ? error.message : 'Sign in failed' })
//             }
//         },

//         signUp: async (userData: any) => {
//             dispatch({ type: 'SIGN_UP_START' })

//             try {
//                 const { data, error } = await supabase.auth.signUp({
//                     email: userData.email,
//                     password: userData.password,
//                 })

//                 if (error) {
//                     throw new Error(error.message)
//                 }

//                 // With email confirmation disabled, the user is immediately signed in
//                 if (data.user && data.session) {

//                     // Create user profile with all available data
//                     const profileData: any = {
//                         id: data.user.id,
//                         first_name: userData.firstName,
//                         last_name: userData.lastName,
//                         account_status: 'active',
//                         verification_status: 'pending'
//                     }

//                     // Add checkout-specific fields if available
//                     if (userData.dateOfBirth) profileData.date_of_birth = userData.dateOfBirth
//                     if (userData.phone) profileData.phone = userData.phone
//                     if (userData.sex) profileData.sex = userData.sex
//                     if (userData.address) profileData.address = userData.address
//                     if (userData.agreeToTerms !== undefined) {
//                         profileData.agreed_to_terms = userData.agreeToTerms
//                         profileData.agreed_to_terms_at = userData.agreeToTerms ? new Date().toISOString() : null
//                     }
//                     if (userData.marketingOptOut !== undefined) {
//                         profileData.agreed_to_marketing = !userData.marketingOptOut
//                         profileData.agreed_to_marketing_at = !userData.marketingOptOut ? new Date().toISOString() : null
//                     }

//                     const { data: insertedProfile, error: profileError } = await supabase
//                         .from('user_profiles')
//                         .insert(profileData)
//                         .select()
//                         .single()

//                     if (profileError) {
//                         console.error('Failed to create profile:', profileError)
//                         throw new Error(`Failed to create profile: ${profileError.message}`)
//                     }

//                     const user: User = {
//                         id: data.user.id,
//                         email: data.user.email || '',
//                         firstName: userData.firstName,
//                         lastName: userData.lastName,
//                         profile: insertedProfile
//                     }

//                     dispatch({ type: 'SIGN_UP_SUCCESS', user })
//                 }
//             } catch (error) {
//                 dispatch({ type: 'SIGN_UP_ERROR', error: error instanceof Error ? error.message : 'Sign up failed' })
//             }
//         },

//         signOut: async () => {
//             await supabase.auth.signOut()
//             dispatch({ type: 'SIGN_OUT' })
//             router.push('/')
//         },

//         updateProfile: async (profile: Partial<UserProfile>) => {
//             dispatch({ type: 'UPDATE_PROFILE_START' })

//             try {
//                 if (!state.user) {
//                     throw new Error('No user logged in')
//                 }

//                 const { error } = await supabase
//                     .from('user_profiles')
//                     .update(profile)
//                     .eq('id', state.user.id)

//                 if (error) {
//                     throw new Error(error.message)
//                 }

//                 const updatedProfile = {
//                     ...state.user?.profile,
//                     ...profile,
//                     id: state.user?.id || (state.user?.profile && state.user.profile.id) || ''
//                 }
//                 dispatch({ type: 'UPDATE_PROFILE_SUCCESS', profile: updatedProfile as UserProfile })
//             } catch (error) {
//                 dispatch({ type: 'UPDATE_PROFILE_ERROR', error: error instanceof Error ? error.message : 'Profile update failed' })
//             }
//         },

//         clearError: () => {
//             dispatch({ type: 'CLEAR_ERROR' })
//         },
//         updateConsent: function (termsConsent?: boolean, marketingConsent?: boolean, marketingPrefs?: MarketingPreferences): Promise<void> {
//             throw new Error('Function not implemented.')
//         },
//         verifyEmail: function (): Promise<void> {
//             throw new Error('Function not implemented.')
//         },
//         verifyPhone: function (code: string): Promise<void> {
//             throw new Error('Function not implemented.')
//         }
//     }

//     return (
//         <AuthContext.Provider value={{ state, actions }}>
//             {children}
//         </AuthContext.Provider>
//     )
// }

// // Hook
// export function useAuth() {
//     const context = useContext(AuthContext)
//     if (!context) {
//         throw new Error('useAuth must be used within an AuthProvider')
//     }
//     return context
// }
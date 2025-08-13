import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// import { createBrowserClient } from '@supabase/ssr'

// export function createClient() {
//   return createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           if (typeof document === 'undefined') {
//             return []
//           }
//           return document.cookie
//             .split('; ')
//             .filter(x => x.length > 0)
//             .map(cookie => {
//               const [name, ...rest] = cookie.split('=')
//               return { name, value: rest.join('=') }
//             })
//         },
//         setAll(cookiesToSet) {
//           if (typeof document === 'undefined') {
//             return
//           }
//           cookiesToSet.forEach(({ name, value, options }) => {
//             document.cookie = `${name}=${value}; path=/; ${
//               options?.maxAge ? `max-age=${options.maxAge};` : ''
//             } ${options?.sameSite ? `samesite=${options.sameSite};` : ''} ${
//               options?.secure ? 'secure;' : ''
//             }`
//           })
//         },
//       },
//     }
//   )
// }
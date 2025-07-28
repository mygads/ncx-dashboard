import type { User } from "@supabase/supabase-js"

/**
 * Get the display name for a user from various possible fields in Supabase Auth
 * @param user - The Supabase user object
 * @returns The display name or 'User' as fallback
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'User'
  
  // Check various possible fields where the name might be stored
  const possibleNames = [
    user.user_metadata?.full_name,
    user.user_metadata?.display_name,
    user.user_metadata?.name,
    user.identities?.[0]?.identity_data?.full_name,
    user.identities?.[0]?.identity_data?.name,
    user.identities?.[0]?.identity_data?.display_name,
    user.app_metadata?.full_name,
    user.app_metadata?.name
  ]
  
  // Return the first non-empty name found
  for (const name of possibleNames) {
    if (name && typeof name === 'string' && name.trim().length > 0) {
      return name.trim()
    }
  }
  
  return 'User'
}

/**
 * Get the user's email address
 * @param user - The Supabase user object
 * @returns The email address or empty string
 */
export function getUserEmail(user: User | null): string {
  return user?.email || ''
}

/**
 * Debug function to log all user metadata fields
 * @param user - The Supabase user object
 */
export function debugUserData(user: User | null): void {
  if (!user) {
    console.log('No user data available')
    return
  }
  
//   console.group('User Data Debug')
//   console.log('Email:', user.email)
//   console.log('ID:', user.id)
//   console.log('User Metadata:', user.user_metadata)
//   console.log('App Metadata:', user.app_metadata)
//   console.log('Identities:', user.identities)
//   console.log('Calculated Display Name:', getUserDisplayName(user))
//   console.groupEnd()
}

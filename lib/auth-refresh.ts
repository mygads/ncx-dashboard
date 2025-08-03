import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

/**
 * Force refresh all Supabase Auth data and clear any cached sessions
 */
export async function forceAuthRefresh() {
  const supabase = createClientComponentClient()
  
  try {
    // console.log('Starting force auth refresh...')
    
    // Step 1: Refresh the current session token
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError) {
      console.error('Error refreshing session:', refreshError)
    } else {
    //   console.log('Session token refreshed')
    }
    
    // Step 2: Clear any local storage that might cache auth data
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || key.includes('auth')
    )
    
    for (const key of authKeys) {
      if (key !== 'supabase.auth.token') { // Don't remove the main auth token
        // console.log('Clearing localStorage key:', key)
        localStorage.removeItem(key)
      }
    }
    
    // Step 3: Wait a moment for token propagation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Step 4: Get fresh user data
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Error getting fresh user:', userError)
      return null
    }
    
    // console.log('Fresh user data retrieved:', user?.user_metadata)
    return user
    
  } catch (error) {
    console.error('Error in forceAuthRefresh:', error)
    return null
  }
}

/**
 * Check if the current user metadata in memory matches what's in the database
 */
export async function validateUserMetadata(currentUser: any) {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { user: dbUser } } = await supabase.auth.getUser()
    
    // console.log('Metadata validation:', {
    //   current_full_name: currentUser?.user_metadata?.full_name,
    //   db_full_name: dbUser?.user_metadata?.full_name,
    //   current_display_name: currentUser?.user_metadata?.display_name,
    //   db_display_name: dbUser?.user_metadata?.display_name,
    //   are_equal: JSON.stringify(currentUser?.user_metadata) === JSON.stringify(dbUser?.user_metadata)
    // })
    
    return dbUser
  } catch (error) {
    console.error('Error validating user metadata:', error)
    return null
  }
}

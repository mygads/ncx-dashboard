import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getUserDisplayName } from './user-utils'
import type { User } from '@supabase/supabase-js'

/**
 * Custom hook to manage user display name with automatic refresh
 */
export function useUserDisplayName(user: User | null) {
  const [displayName, setDisplayName] = useState('User')
  const [lastUpdated, setLastUpdated] = useState(Date.now())
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user) {
      const name = getUserDisplayName(user)
    //   console.log("useUserDisplayName hook - user updated:", {
    //     user_id: user.id,
    //     metadata: user.user_metadata,
    //     calculated_name: name
    //   })
      setDisplayName(name)
    }
  }, [user, lastUpdated])

  // Function to force refresh the display name
  const refreshDisplayName = async () => {
    try {
      // First refresh the session
      await supabase.auth.refreshSession()
      
      // Then get fresh user data
      const { data: { user: freshUser } } = await supabase.auth.getUser()
      if (freshUser) {
        const name = getUserDisplayName(freshUser)
        setDisplayName(name)
        setLastUpdated(Date.now())
        // console.log('Display name refreshed from DB:', name)
      }
    } catch (error) {
      console.error('Error refreshing display name:', error)
    }
  }

  return { displayName, refreshDisplayName }
}

/**
 * Custom hook to listen for storage events (for cross-tab communication)
 */
export function useUserDataSync() {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_updated') {
        // console.log('User data updated in another tab, refreshing...')
        window.location.reload()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
}

/**
 * Function to trigger user data refresh across all tabs
 */
export function triggerUserDataSync() {
  localStorage.setItem('user_updated', Date.now().toString())
  localStorage.removeItem('user_updated')
}

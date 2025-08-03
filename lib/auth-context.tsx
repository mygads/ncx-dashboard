"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import type { User, Session } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error)
        }
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Error in getSession:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log("Auth state changed:", event, session?.user?.user_metadata)
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
      
      // If user is updated, ensure we have the latest data
      if (event === 'USER_UPDATED' && session?.user) {
        // console.log('User updated event detected, refreshing data')
        // Small delay to ensure data propagation
        setTimeout(async () => {
          const { data: { user: freshUser } } = await supabase.auth.getUser()
          if (freshUser) {
            setUser(freshUser)
            // console.log('Fresh user data loaded:', freshUser.user_metadata)
          }
        }, 1000)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router])

  // Update the signIn function to ensure proper redirection
  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Wait for the session to be established
      // await new Promise((resolve) => setTimeout(resolve, 500))

      router.push("/dashboard")
      // router.refresh()
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        throw error
      }

      router.push("/login?message=Check your email to confirm your account")
    } catch (error) {
      console.error("Error in signUp:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.refresh()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      // console.log("Starting user refresh...")
      
      // Force refresh the auth token first
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) {
        console.error("Error refreshing session:", refreshError)
      } else {
        // console.log("Session refreshed successfully")
      }
      
      // Get fresh user data
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      if (error) {
        console.error("Error refreshing user:", error)
        return
      }
      
      // Also get fresh session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error("Error refreshing session:", sessionError)
      }
      
      // Update both user and session state
      setUser(currentUser)
      if (currentSession) {
        setSession(currentSession)
      }
      
      // console.log("User data refreshed:", {
      //   old_metadata: user?.user_metadata,
      //   new_metadata: currentUser?.user_metadata
      // })
    } catch (error) {
      console.error("Error in refreshUser:", error)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

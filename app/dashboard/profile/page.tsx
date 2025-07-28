"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getUserDisplayName, getUserEmail, debugUserData } from "@/lib/user-utils"
import { triggerUserDataSync } from "@/lib/user-hooks"
import { forceAuthRefresh, validateUserMetadata } from "@/lib/auth-refresh"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Loading from "@/components/ui/loading"

export default function ProfilePage() {
    const { user, refreshUser } = useAuth()
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [activeTab, setActiveTab] = useState("profile")
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClientComponentClient()

    useEffect(() => {
        const loadUserData = async () => {
            setIsLoading(true)
            try {
                // Get fresh user data from Supabase
                const { data: { user: currentUser }, error } = await supabase.auth.getUser()
                
                if (error) {
                    console.error("Error getting user:", error)
                    return
                }

                if (currentUser) {
                    debugUserData(currentUser)
                    setEmail(getUserEmail(currentUser))
                    setFullName(getUserDisplayName(currentUser))
                } else {
                    console.log("No user found")
                }
            } catch (error) {
                console.error("Error loading user data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (user) {
            loadUserData()
        } else {
            console.log("No user in auth context")
            setIsLoading(false)
        }
    }, [user, supabase.auth])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            // Update user metadata in Supabase Auth - save to multiple fields for compatibility
            const { error } = await supabase.auth.updateUser({
                data: { 
                    full_name: fullName,
                    display_name: fullName  // Also save as display_name for compatibility
                }
            })

            if (error) throw error

            setMessage({ type: "success", text: "Profile updated successfully! Refreshing data..." })

            // Force complete auth refresh
            const freshUser = await forceAuthRefresh()
            
            if (freshUser) {
                console.log("Profile update successful, fresh user data:", freshUser.user_metadata)
                
                // Update local state
                setFullName(getUserDisplayName(freshUser))
                setEmail(getUserEmail(freshUser))
                
                // Refresh auth context
                await refreshUser()
                
                // Trigger sync across tabs
                triggerUserDataSync()
                
                setMessage({ type: "success", text: "Profile updated and data refreshed successfully!" })
            } else {
                setMessage({ type: "success", text: "Profile updated! Please refresh the page to see changes." })
                // Fallback: force page reload
                setTimeout(() => {
                    window.location.reload()
                }, 2000)
            }
        } catch (error: any) {
            console.error("Error updating profile:", error)
            setMessage({ type: "error", text: error.message || "Failed to update profile" })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "New passwords don't match" })
            setLoading(false)
            return
        }

        if (newPassword.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters long" })
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword })

            if (error) throw error

            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setMessage({ type: "success", text: "Password updated successfully!" })
        } catch (error: any) {
            console.error("Error updating password:", error)
            setMessage({ type: "error", text: error.message || "Failed to update password" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
                </div>
            </div>

            {isLoading ? (
                <Loading />
            ) : (
                <>
                    {message && (
                        <Alert
                            variant={message.type === "success" ? "default" : "destructive"}
                            className={`mb-6 ${message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : ""} animate-fadeIn`}
                        >
                            {message.type === "success" ? (
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                            ) : (
                                <AlertCircle className="h-4 w-4 mr-2" />
                            )}
                            <AlertDescription>{message.text}</AlertDescription>
                        </Alert>
                    )}

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="profile" className="text-base">
                                Profile Information
                            </TabsTrigger>
                            <TabsTrigger value="security" className="text-base">
                                Security
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <Card className="border-0 shadow-md">
                                <form onSubmit={handleUpdateProfile}>
                                    <CardHeader>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>Update your personal information</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                <Input
                                                    id="fullName"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="pl-10"
                                                    placeholder="Your full name"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                <Input id="email" value={email} className="pl-10 bg-gray-50" disabled />
                                            </div>
                                            <p className="text-xs text-gray-500">Email address cannot be changed</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t pt-6">
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            onClick={async () => {
                                                setLoading(true)
                                                try {
                                                    setMessage({ type: "success", text: "Refreshing data from database..." })
                                                    
                                                    // Validate current metadata
                                                    await validateUserMetadata(user)
                                                    
                                                    // Force complete refresh
                                                    const freshUser = await forceAuthRefresh()
                                                    
                                                    if (freshUser) {
                                                        console.log("Manual refresh - fresh user data:", freshUser.user_metadata)
                                                        setFullName(getUserDisplayName(freshUser))
                                                        setEmail(getUserEmail(freshUser))
                                                        
                                                        // Also refresh auth context
                                                        await refreshUser()
                                                        
                                                        setMessage({ type: "success", text: "Data refreshed successfully from database!" })
                                                    } else {
                                                        setMessage({ type: "error", text: "Could not refresh data from database!" })
                                                    }
                                                } catch (error) {
                                                    console.error("Error refreshing:", error)
                                                    setMessage({ type: "error", text: "Error refreshing data!" })
                                                } finally {
                                                    setLoading(false)
                                                }
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? "Refreshing..." : "Force Refresh from DB"}
                                        </Button>
                                        <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
                                            {loading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security">
                            <Card className="border-0 shadow-md">
                                <form onSubmit={handleUpdatePassword}>
                                    <CardHeader>
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>Update your password</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="pl-10"
                                                    placeholder="••••••••"
                                                    required
                                                    minLength={6}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">Minimum 6 characters</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="pl-10"
                                                    placeholder="••••••••"
                                                    required
                                                    minLength={6}
                                                />
                                            </div>
                                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                                <p className="text-xs text-red-500">Passwords don't match</p>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end border-t pt-6">
                                        <Button
                                            type="submit"
                                            disabled={loading || (newPassword !== confirmPassword && newPassword !== "") || newPassword.length < 6}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            {loading ? "Updating..." : "Update Password"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    )
}

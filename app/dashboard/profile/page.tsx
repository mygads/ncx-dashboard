"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
    const { user } = useAuth()
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [activeTab, setActiveTab] = useState("profile")
    const supabase = createClientComponentClient()

    useEffect(() => {
        async function fetchUserInfo() {
            if (user) {
                setEmail(user.email || "")

                const { data, error } = await supabase.from("users").select("full_name").eq("id", user.id).single()

                if (!error && data) {
                setFullName(data.full_name || "")
                }
            }
        }

        fetchUserInfo()
    }, [user, supabase])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.from("users").update({ full_name: fullName }).eq("id", user?.id)

            if (error) throw error

            setMessage({ type: "success", text: "Profile updated successfully!" })
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

    const getInitials = (name: string) => {
        return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-red-600 text-white text-xl">
                        {fullName ? getInitials(fullName) : "U"}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>

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
                            <CardFooter className="flex justify-end border-t pt-6">
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
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="pl-10"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <Separator />

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
                                        />
                                    </div>
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
                                    disabled={loading || (newPassword !== confirmPassword && newPassword !== "")}
                                    className="bg-red-600 hover:bg-red-700"
                                    >
                                    {loading ? "Updating..." : "Update Password"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

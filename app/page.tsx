"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wifi, Signal, Phone, Globe, Network } from 'lucide-react'

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { signIn, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await signIn(email, password)
      // Add a direct navigation as a fallback
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "An error occurred during sign in")
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Decorative area with Telkom branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-700 to-red-500 p-8 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10">
            <Wifi size={80} className="text-white" />
          </div>
          <div className="absolute top-40 right-20">
            <Signal size={60} className="text-white" />
          </div>
          <div className="absolute bottom-40 left-20">
            <Phone size={70} className="text-white" />
          </div>
          <div className="absolute bottom-20 right-10">
            <Globe size={80} className="text-white" />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Network size={120} className="text-white" />
          </div>
        </div>
        
        <div className="z-10">
          <div className="flex items-center mb-6">
            <TelkomLogo className="h-12 w-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">NCX-PRO Dashboard</h1>
          <p className="text-white/80 text-xl">
            Manage and monitor your Telkom Indonesia services with our comprehensive dashboard.
          </p>
        </div>
        
        <div className="z-10 text-white/70 text-sm">
          <p>© 2025 PT Telkom Indonesia (Persero) Tbk</p>
          <p>All rights reserved</p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
            <div className="flex justify-center mb-8">
            <Image 
              src="/telkom-logo.png"
              alt="Telkom Logo"
              width={180}
              height={90}
              className="mb-4 w-40 h-auto sm:w-52"
              priority
            />
            </div>

          {message && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="border-red-100 shadow-lg">
            <form onSubmit={handleSubmit}>
              <CardHeader className="border-b border-red-100 bg-red-50/50">
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access the dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@telkom.co.id"
                    required
                    className="border-red-200 focus-visible:ring-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="border-red-200 focus-visible:ring-red-500"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 border-t border-red-100 bg-red-50/50">
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Need help? Contact <a href="https://telkom.co.id" target="_blank" className="text-red-600 hover:underline">IT Support</a>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Telkom Indonesia Logo Component
function TelkomLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 300 80" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#FFFFFF">
        <path d="M0,0 H80 V80 H0 Z" fill="#E4002B"/>
        <path d="M20,20 H60 V60 H20 Z" fill="#FFFFFF"/>
        <path d="M30,30 H50 V50 H30 Z" fill="#E4002B"/>
        <path d="M100,25 H140 V35 H100 Z" fill="#FFFFFF"/>
        <path d="M100,45 H140 V55 H100 Z" fill="#FFFFFF"/>
        <path d="M160,25 H200 V55 H160 Z M170,35 H190 V45 H170 Z" fill="#FFFFFF"/>
        <path d="M220,25 H260 V55 H220 Z" fill="#FFFFFF"/>
        <path d="M230,35 H250 V55 H230 Z" fill="#E4002B"/>
        <path d="M280,25 H300 V55 H280 Z" fill="#FFFFFF"/>
      </g>
    </svg>
  );
}

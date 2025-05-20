import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TELKOM SULBAGTENG NCX-PRO Dashboard",
  description: "Dashboard NCX data visualization TELKOM INDONESIA SULBAGTENG",
  authors: [{ name: "TELKOM SULBAGTENG NCX" }],
  keywords: ["TELKOM SULBAGTENG NCX", "dashboard", "data visualization", "NCX-PRO", "SULBAGTENG", "TELKOM INDONESIA", "SULAWESI", "TELKOM SULBAGTENG", "NCX", "PRO"],
  publisher: "TELKOM SULBAGTENG",
  applicationName: "TELKOM SULBAGTENG NCX-PRO Dashboard",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  creator: "TELKOM SULBAGTENG",
  openGraph: {
    title: "TELKOM SULBAGTENG NCX-PRO Dashboard",
    description: "Dashboard NCX data visualization TELKOM INDONESIA SULBAGTENG",
    siteName: "TELKOM SULBAGTENG NCX-PRO Dashboard",
    locale: "id_ID",
    type: "website",
  },
  icons: {
    icon: "/icon-telkom.png",
    shortcut: "/icon-telkom.png",
    apple: "/icon-telkom.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import {
  Home,
  LineChart,
  BarChart3,
  Store,
  LayoutDashboard,
  Calendar,
  User,
  Target,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react"

// Define the route groups
const topRoutes = [
  {
    label: "Home",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Revenue",
    icon: LineChart,
    href: "/dashboard/revenue",
  },
  {
    label: "Sales Operation",
    icon: BarChart3,
    href: "/dashboard/sales",
  },
  {
    label: "Digital Product",
    icon: Store,
    href: "/dashboard/products",
  },
]

const middleRoutes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard/analytics",
  },
  {
    label: "Unit Segment",
    icon: Calendar,
    href: "/dashboard/segments",
  },
  {
    label: "Inputer Performance",
    icon: Calendar,
    href: "/dashboard/inputer",
  },
  {
    label: "AM Performance",
    icon: Calendar,
    href: "/dashboard/am-performance",
  },
  {
    label: "Tipe Order Detail",
    icon: Calendar,
    href: "/dashboard/order-types",
  },
  {
    label: "Branch Detail",
    icon: Calendar,
    href: "/dashboard/branches",
  },
  {
    label: "Umur Order Detail",
    icon: Calendar,
    href: "/dashboard/order-age",
  },
]

const targetAMItems = [
  { label: "MOHAMAD INDRA PRAMONO RAUF", href: "/dashboard/target-am/mohamad-indra" },
  { label: "AGUNG NUGROHO", href: "/dashboard/target-am/agung-nugroho" },
  { label: "RIVO NOVEM ABRAHAM", href: "/dashboard/target-am/rivo-novem" },
  { label: "MOH MARWAN FAJAR", href: "/dashboard/target-am/moh-marwan" },
]

const targetDATELItems = [{ label: "AGUSTINUS KOMBER", href: "/dashboard/target-datel/agustinus-komber" }]

interface SidebarProps {
  onItemClick?: () => void
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname() || ""
  const { signOut } = useAuth()
  const [targetAMExpanded, setTargetAMExpanded] = useState(true)
  const [targetDATELExpanded, setTargetDATELExpanded] = useState(false)

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 border-r">
      <div className="flex-1 overflow-y-auto">
        {/* Top Routes */}
        <div className="py-2">
          {topRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium",
                pathname === route.href ? "text-black" : "text-gray-600 hover:bg-gray-100",
              )}
              onClick={onItemClick}
            >
              <route.icon className="h-5 w-5 mr-3" />
              {route.label}
            </Link>
          ))}
        </div>

        {/* Divider with text */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-xs text-gray-500">Update NCX-PRO Sulbagteng</span>
          </div>
        </div>

        {/* Middle Routes */}
        <div className="py-2">
          {middleRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium",
                pathname === route.href || (route.href === "/dashboard/analytics" && pathname === "/dashboard")
                  ? "bg-gray-300 text-black rounded-r-full"
                  : "text-gray-600 hover:bg-gray-100",
              )}
              onClick={onItemClick}
            >
              <route.icon className="h-5 w-5 mr-3" />
              {route.label}
            </Link>
          ))}
        </div>

        {/* Target AM Section */}
        <div className="py-2">
          <button
            onClick={() => setTargetAMExpanded(!targetAMExpanded)}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            {targetAMExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
            <User className="h-5 w-5 mr-3" />
            Target AM
          </button>

          {targetAMExpanded && (
            <div className="pl-12">
              {targetAMItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-sm text-gray-600 hover:text-gray-900"
                  onClick={onItemClick}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Target DATEL Section */}
        <div className="py-2">
          <button
            onClick={() => setTargetDATELExpanded(!targetDATELExpanded)}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            {targetDATELExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
            <Target className="h-5 w-5 mr-3" />
            Target DATEL
          </button>

          {targetDATELExpanded && (
            <div className="pl-12">
              {targetDATELItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-sm text-gray-600 hover:text-gray-900"
                  onClick={onItemClick}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => {
            signOut()
            if (onItemClick) onItemClick()
          }}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  )
}

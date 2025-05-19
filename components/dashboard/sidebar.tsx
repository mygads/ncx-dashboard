"use client"

import { useState, useEffect } from "react"
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
  ChevronLeft,
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

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

const iconColorMap: Record<string, string> = {
  Home: "text-gray-500",
  Revenue: "text-green-500",
  "Sales Operation": "text-blue-500",
  "Digital Product": "text-purple-500",
  Dashboard: "text-red-500",
  "Unit Segment": "text-orange-500",
  "Inputer Performance": "text-yellow-500",
  "AM Performance": "text-indigo-500",
  "Tipe Order Detail": "text-pink-500",
  "Branch Detail": "text-teal-500",
  "Umur Order Detail": "text-cyan-500",
  "Target AM": "text-amber-500",
  "Target DATEL": "text-lime-500",
  Settings: "text-gray-500",
}

interface SidebarProps {
  onItemClick?: () => void
  collapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
}

export function Sidebar({ onItemClick, collapsed: collapsedProp, onCollapseChange }: SidebarProps) {
  const pathname = usePathname() || ""
  const { signOut, user } = useAuth()
  const [targetAMExpanded, setTargetAMExpanded] = useState(true)
  const [targetDATELExpanded, setTargetDATELExpanded] = useState(false)
  const [collapsed, setCollapsed] = useState(collapsedProp ?? false)
  const [fullName, setFullName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Sync local state with prop
  useEffect(() => {
    if (typeof collapsedProp === "boolean") setCollapsed(collapsedProp)
  }, [collapsedProp])

  useEffect(() => {
    const storedCollapsed = localStorage.getItem("sidebar-collapsed")
    if (storedCollapsed && typeof collapsedProp !== "boolean") {
      setCollapsed(storedCollapsed === "true")
    }
  }, [collapsedProp])

  // Fetch user full name and email from DB
  useEffect(() => {
    async function fetchUserInfo() {
      if (user) {
        const supabase = createClientComponentClient()
        const { data, error } = await supabase
          .from("users")
          .select("full_name, email")
          .eq("id", user.id)
          .single()
        if (!error && data) {
          setFullName(data.full_name)
          setUserEmail(data.email)
        }
      }
    }
    fetchUserInfo()
  }, [user])

  const toggleCollapse = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    localStorage.setItem("sidebar-collapsed", String(newCollapsed))
    if (onCollapseChange) onCollapseChange(newCollapsed)
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white text-gray-800 border-r relative transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Collapse button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-0 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md z-99999"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* User Info */}
      <div className="flex items-center px-4 py-4 border-b">
        <span className="flex items-center justify-center w-10 bg-red-100 rounded-full">
          <User className="w-6 h-6 text-red-600" />
        </span>
        {!collapsed && (
          <div className="ml-3">
            <div className="font-semibold text-sm">{fullName || user?.user_metadata?.full_name || user?.email}</div>
            <div className="text-xs text-gray-500">{userEmail || user?.email}</div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Top Routes */}
        <div className="py-2">
          {topRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition",
                pathname === route.href ? "bg-gray-100 text-black" : "text-gray-600 hover:bg-gray-100",
              )}
              onClick={onItemClick}
            >
              <route.icon className={cn("h-5 w-5 min-w-5", iconColorMap[route.label])} />
              {!collapsed && <span className="ml-3">{route.label}</span>}
            </Link>
          ))}
        </div>

        {/* Divider with text */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          {!collapsed && (
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs text-gray-500">Update NCX-PRO Sulbagteng</span>
            </div>
          )}
        </div>

        {/* Middle Routes */}
        <div className="py-2">
          {middleRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition",
                pathname === route.href || (route.href === "/dashboard/analytics" && pathname === "/dashboard")
                  ? "bg-gray-100 text-black" : "text-gray-600 hover:bg-gray-100",
              )}
              onClick={onItemClick}
            >
              <route.icon className={cn("h-5 w-5 min-w-5", iconColorMap[route.label])} />
              {!collapsed && <span className="ml-3">{route.label}</span>}
            </Link>
          ))}
        </div>

        {/* Target AM Section */}
        <div className="py-2">
          <button
            onClick={() => setTargetAMExpanded(!targetAMExpanded)}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            {!collapsed &&
              (targetAMExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />)}
            <Target className={cn("h-5 w-5 min-w-5", iconColorMap["Target AM"])} />
            {!collapsed && <span className="ml-3">Target AM</span>}
          </button>

          {!collapsed && targetAMExpanded && (
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
            {!collapsed &&
              (targetDATELExpanded ? (
                <ChevronDown className="h-4 w-4 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1" />
              ))}
            <Target className={cn("h-5 w-5 min-w-5", iconColorMap["Target DATEL"])} />
            {!collapsed && <span className="ml-3">Target DATEL</span>}
          </button>

          {!collapsed && targetDATELExpanded && (
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
          className={cn(
            "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
            collapsed ? "px-2" : "",
          )}
          onClick={() => {
            signOut()
            if (onItemClick) onItemClick()
          }}
        >
          <LogOut className="h-5 w-5 min-w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  )
}

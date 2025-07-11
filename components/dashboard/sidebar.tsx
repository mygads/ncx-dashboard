"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
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
    href: "/dashboard/home",
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
  const [targetAMItems, setTargetAMItems] = useState<{ label: string; href: string }[]>([]);
  const router = useRouter()

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
        const { data, error } = await supabase.from("users").select("full_name, email").eq("id", user.id).single()
        if (!error && data) {
          setFullName(data.full_name)
          setUserEmail(data.email)
        }
      }
    }
    fetchUserInfo()
  }, [user])

  // Fetch Target AM data from spreadsheet
  useEffect(() => {
    async function fetchTargetAMData() {
      try {
        const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
        const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
        const sheetName = 'DataAutoGSlide';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();
        if (!json.values || json.values.length < 2) return;
        const headers = json.values[0];
        const bagianSlideIndex = headers.findIndex((h: string) => h === "Bagian Slide");
        if (bagianSlideIndex === -1) return;
        const targetAMRows = json.values.slice(1).filter((row: any[]) => {
          const bagianSlide = row[bagianSlideIndex] || "";
          return bagianSlide.includes("TARGET AM WBS SULBAGTENG");
        });
        const uniqueAMs = new Map<string, { label: string; href: string }>();
        targetAMRows.forEach((row: any[]) => {
          const bagianSlide = row[bagianSlideIndex] || "";
          const match = bagianSlide.match(/TARGET AM WBS SULBAGTENG\s*(.*?)\s*\/\s*(\d+)/i);
          if (match && match.length >= 3) {
            const name = match[1].trim();
            const slug = name.toLowerCase().replace(/\s+/g, '-');
            if (!uniqueAMs.has(name)) {
              uniqueAMs.set(name, { label: name, href: `/dashboard/target-am/${slug}` });
            }
          }
        });
        setTargetAMItems(Array.from(uniqueAMs.values()));
      } catch (error) {
        // Optional: handle error
      }
    }
    fetchTargetAMData();
  }, []);

  const toggleCollapse = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    localStorage.setItem("sidebar-collapsed", String(newCollapsed))
    if (onCollapseChange) onCollapseChange(newCollapsed)
  }

  const handleProfileClick = () => {
    router.push("/dashboard/profile")
    if (onItemClick) onItemClick()
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white text-gray-800 border-r relative transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo Telkom di kiri atas */}
      <div
        className={cn(
          "flex items-center justify-center py-4 border-b bg-white",
          collapsed ? "px-0" : "px-0"
        )}
      >
        <Image
          src={collapsed ? "/icon-telkom.png" : "/telkom-logo.png"}
          alt="Telkom Logo"
          width={collapsed ? 40 : 180}
          height={40}
          className={cn(
        "object-contain transition-all duration-300",
        collapsed ? "w-10 h-10" : "w-44 h-10",
        "max-w-full"
          )}
          priority
          sizes={collapsed ? "40px" : "(max-width: 640px) 120px, 180px"}
        />
      </div>

      {/* Collapse button (hide on mobile) */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-0 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md z-99999 hidden sm:block"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Bagian utama sidebar (routes, dll) */}
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
                  ? "bg-gray-100 text-black"
                  : "text-gray-600 hover:bg-gray-100",
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
            <div className="pl-12 mt-1 flex flex-col gap-1 border-l-2 border-amber-200">
              {targetAMItems.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">Loading...</div>
              ) : (
                targetAMItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 py-1.5 px-3 rounded-md transition text-sm",
                        isActive
                          ? "bg-gray-100  shadow-sm"
                          : "text-gray-700 hover:bg-red-50 hover:text-red-900"
                      )}
                      onClick={onItemClick}
                    >
                      {isActive && <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />}
                      <span>{item.label}</span>
                    </Link>
                  );
                })
              )}
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

      {/* User Info di bawah, di atas logout */}
      <div
        className="flex items-center px-2 py-2 border-t border-b cursor-pointer hover:bg-gray-100 bg-white transition-colors"
        onClick={handleProfileClick}
      >
        <span className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
          {/* <Image 
            src="/icon-telkom.png"
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-full"
            style={{ objectFit: "cover" }}
          /> */}
          <User className="rounded-full object-cover text-gray-500" />
        </span>
        {!collapsed && (
          <div className="ml-2">
            <div className="font-semibold text-sm">{fullName || user?.user_metadata?.full_name || user?.email}</div>
            <div className="text-xs text-gray-500">{userEmail || user?.email}</div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="p-2 border-t">
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

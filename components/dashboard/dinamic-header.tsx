"use client"

import { usePathname } from "next/navigation"
import Image from "next/image"

export function DynamicHeader() {
  const pathname = usePathname() || ""

  // Determine the subtitle based on the current path
  const getSubtitle = () => {
    if (pathname.includes("/dashboard/analytics") || pathname === "/dashboard") {
      return "Dashboard"
    } else if (pathname.includes("/segments")) {
      return "Overview by Unit"
    } else if (pathname.includes("/inputer")) {
      return "Inputer Performance"
    } else if (pathname.includes("/am-performance")) {
      return "AM Performance"
    } else if (pathname.includes("/order-types")) {
      return "Tipe Order Detail"
    } else if (pathname.includes("/branches")) {
      return "Branch Detail"
    } else if (pathname.includes("/order-age")) {
      return "Umur Order Detail"
    } else if (pathname.includes("/target-am")) {
      return "Target AM"
    } else if (pathname.includes("/target-datel")) {
      return "Target DATEL"
    } else if (pathname.includes("/revenue")) {
      return "Revenue"
    } else if (pathname.includes("/sales")) {
      return "Sales Operation"
    } else if (pathname.includes("/products")) {
      return "Digital Product"
    }
    return "Dashboard"
  }

  return (
    <div className="bg-red-600 text-white p-4 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
      {/* Decorative ornament: Telkom Indonesia wave pattern */}
      <svg
      className="absolute left-0 bottom-0 w-full h-8 md:h-12 opacity-30 pointer-events-none"
      viewBox="0 0 1440 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      >
      <path
        d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z"
        fill="#fff"
      />
      </svg>
      {/* Decorative ornament: Telkom Indonesia dots */}
      <svg
      className="absolute right-4 top-2 w-10 h-10 md:w-16 md:h-16 opacity-40 pointer-events-none"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      >
      <circle cx="32" cy="32" r="8" fill="#fff" />
      <circle cx="48" cy="16" r="4" fill="#fff" />
      <circle cx="16" cy="48" r="4" fill="#fff" />
      <circle cx="52" cy="44" r="2" fill="#fff" />
      <circle cx="12" cy="20" r="2" fill="#fff" />
      </svg>
      <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-2">
        <h1 className="text-lg md:text-xl font-bold text-center md:text-left leading-tight">
          Insight Dashboard <span className="text-yellow-300">TELKOM SULBAGTENG {new Date().getFullYear()} |</span>
        </h1>
        <span className="block text-sm md:text-base font-medium text-white text-center md:text-left">
          {getSubtitle()}
        </span>
      </div>
      <div className="flex items-center">
        <div className="bg-white rounded-2xl py-1 px-2 flex items-center">
          <div className="relative w-20 h-8 md:w-24 md:h-10">
            <Image
              src="/telkom-logo.png"
              alt="Telkom Logo"
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 768px) 80px, 96px"
              priority
            />
          </div>
          <div className="relative w-32 h-8 md:w-48 md:h-10">
            <Image
              src="/ncs-logo.png"
              alt="NCX Logo"
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 768px) 128px, 192px"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}

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
    <div className="bg-red-600 text-white p-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 className="text-lg md:text-xl font-bold text-center md:text-left">
      Insight Dashboard NCX-PRO SULBAGTENG 2025 | {getSubtitle()}
      </h1>
      <div className="flex items-center">
        <div className="bg-white rounded-xl p-2 flex items-center">
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

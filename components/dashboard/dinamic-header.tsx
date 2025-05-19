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
    <div className="bg-red-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Insight Dashboard NCX-PRO SULBAGTENG 2025 | {getSubtitle()}</h1>
      <div className="flex items-center">
        <div className="bg-white rounded-xl p-1 flex items-center space-x-2">
          <Image
            src="/placeholder.svg?height=30&width=40"
            alt="Logo 1"
            width={40}
            height={30}
            className="object-contain"
          />
          <Image
            src="/placeholder.svg?height=30&width=40"
            alt="Logo 2"
            width={40}
            height={30}
            className="object-contain"
          />
          <Image
            src="/placeholder.svg?height=30&width=40"
            alt="Logo 3"
            width={40}
            height={30}
            className="object-contain"
          />
          <Image
            src="/placeholder.svg?height=30&width=40"
            alt="Logo 4"
            width={40}
            height={30}
            className="object-contain"
          />
          <Image
            src="/placeholder.svg?height=30&width=40"
            alt="Logo 5"
            width={40}
            height={30}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  )
}

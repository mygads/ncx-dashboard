"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter, useParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LastUpdatedFooter } from "@/components/dashboard/last-updated"
import { DynamicHeader } from "@/components/dashboard/dinamic-header"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { fetchDataFromSource } from "@/lib/data-source"

// Tipe data untuk target AM
interface TargetAMData {
  name: string
  nik: string
  revenue: {
    total: string
    sustain: string
    ngtma: string
  }
  salesOperasional: {
    indibizWifi: string
    indibizAstinet: string
    sowan: string
  }
  targetMytens: {
    visiting: string
    accountProfile: string
  }
  salesDigital: {
    oca: string
    netmonk: string
    eazy: string
    pijar: string
  }
}

// Fungsi untuk fetch data dari sumber data yang dipilih user
async function fetchTargetAMData(userId: string, slug?: string): Promise<TargetAMData[]> {
  try {
    // console.log("Fetching Target AM data for user:", userId, "slug:", slug)
    const dataResult = await fetchDataFromSource(userId, "DataAutoGSlide")
    
    // console.log("Data result:", dataResult)
    
    if (!dataResult.success || !dataResult.data || dataResult.data.length < 2) {
      console.error("No data found in data source:", dataResult)
      throw new Error("No data found in data source")
    }

    // Mengambil header dan data
    const headers = dataResult.data[0]
    const rows = dataResult.data.slice(1)

    // Mencari indeks kolom yang dibutuhkan
    const bagianSlideIndex = headers.findIndex((h: string) => h === "Bagian Slide")
    const labelIndex = headers.findIndex((h: string) => h === "Label")
    const dataCleanIndex = headers.findIndex((h: string) => h === "Data Clean")

    // console.log("Column indices:", { bagianSlideIndex, labelIndex, dataCleanIndex })

    if (bagianSlideIndex === -1 || labelIndex === -1 || dataCleanIndex === -1) {
      console.error("Required columns not found. Headers:", headers)
      throw new Error("Required columns not found in data source")
    }

    // Mengelompokkan data berdasarkan AM
    const amDataMap = new Map<string, Map<string, string>>()
    const amNameMap = new Map<string, string>() // Map to store original name by slug

    rows.forEach((row: any[]) => {
      const bagianSlide = row[bagianSlideIndex] || ""

      // Filter hanya untuk TARGET AM WBS SULBAGTENG
      if (bagianSlide.includes("TARGET AM WBS SULBAGTENG")) {
        const amName = bagianSlide.split("\n")[1] || ""
        const label = row[labelIndex] || ""
        const value = row[dataCleanIndex] || ""

        // console.log("Processing AM data:", { amName, label, value, bagianSlide: bagianSlide.substring(0, 50) })

        // Create slug from name for comparison
        const amSlug = amName.toLowerCase().replace(/\s+/g, "-")

        // Store original name by slug
        if (!amNameMap.has(amSlug)) {
          amNameMap.set(amSlug, amName)
        }

        if (!amDataMap.has(amName)) {
          amDataMap.set(amName, new Map<string, string>())
        }

        const amData = amDataMap.get(amName)!
        amData.set(label, value)
      }
    })

    // Mengubah data ke format yang dibutuhkan
    const targetAMResult: TargetAMData[] = []

    // console.log("AM data map size:", amDataMap.size)
    // console.log("Available AM names:", Array.from(amDataMap.keys()))

    amDataMap.forEach((dataMap, amName) => {
      const nikMatch = amName.match(/\/\s*(\d+)/)
      const nik = nikMatch ? nikMatch[1] : ""
      const name = amName.split("/")[0].trim()
      const amSlug = name.toLowerCase().replace(/\s+/g, "-")

      // console.log("Processing AM:", { name, nik, amSlug, slug, shouldInclude: !slug || amSlug === slug })

      // If slug is provided, only include the matching AM
      if (slug && amSlug !== slug) {
        return
      }

      targetAMResult.push({
        name,
        nik,
        revenue: {
          total: dataMap.get("TOTAL") || "Rp 0,-",
          sustain: dataMap.get("SUSTAIN") || dataMap.get("SCALING") || "Rp 0,-",
          ngtma: dataMap.get("NGTMA") || "Rp 0,-",
        },
        salesOperasional: {
          indibizWifi: dataMap.get("INDIBIZ HSI/WMS") || "0",
          indibizAstinet: dataMap.get("INDIBIZ ASTINET") || "0",
          sowan: dataMap.get("SDWAN") || "0",
        },
        targetMytens: {
          visiting: "200 Kali",
          accountProfile: "200 Kali",
        },
        salesDigital: {
          oca: dataMap.get("Sales OCA") || "0",
          netmonk: dataMap.get("Sales NETMONK") || "0",
          eazy: dataMap.get("Sales ANTAREZ EAZY") || "0",
          pijar: dataMap.get("Sales PIJAR") || "0",
        },
      })
    })

    // console.log("Final target AM result:", targetAMResult)
    return targetAMResult
  } catch (error) {
    console.error("Error fetching target AM data:", error)
    return []
  }
}

// Helper to get AM photo URL from Supabase bucket
function getAMPhotoUrl(name: string) {
  if (!name) return "/placeholder.svg?height=300&width=250";
  // Nama file di bucket: nama AM persis, dengan ekstensi .png
  // Perlu encodeURIComponent untuk handle spasi dan karakter khusus
  const url = process.env.NEXT_PUBLIC_PROFILE_SUPABASE_URL;
  const encodedName = encodeURIComponent(name);
  return `${url}${encodedName}.png`;
}

export default function TargetAMDetailPage() {
  const [loading, setLoading] = useState(true)
  const [amList, setAmList] = useState<TargetAMData[]>([])
  const [selectedAM, setSelectedAM] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // console.log("Loading Target AM data for slug:", slug)
        
        // Get user ID first
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error("User not authenticated")
          return
        }

        // console.log("User authenticated:", user.id)

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Request timeout after 30 seconds")), 30000)
        )

        // First fetch all AMs to populate the dropdown
        const allDataPromise = fetchTargetAMData(user.id)
        const allData = await Promise.race([allDataPromise, timeoutPromise]) as TargetAMData[]
        
        // console.log("All AM data loaded:", allData.length, "items")
        setAmList(allData)

        // Then fetch specific AM data if slug is provided
        if (slug) {
          const slugDataPromise = fetchTargetAMData(user.id, slug)
          const slugData = await Promise.race([slugDataPromise, timeoutPromise]) as TargetAMData[]
          
          // console.log("Slug data loaded:", slugData.length, "items for slug:", slug)
          if (slugData.length > 0) {
            setSelectedAM(slugData[0].name)
          } else if (allData.length > 0) {
            // If no matching AM found for slug, select the first one
            // console.log("No matching AM found for slug, selecting first:", allData[0].name)
            setSelectedAM(allData[0].name)
          }
        } else if (allData.length > 0) {
          // If no slug provided, select the first AM
          // console.log("No slug provided, selecting first:", allData[0].name)
          setSelectedAM(allData[0].name)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        if (error instanceof Error && error.message.includes("timeout")) {
          // Handle timeout - still show UI but with error message
          setAmList([])
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug, supabase])

  const handleAmChange = (value: string) => {
    const selectedAmData = amList.find((am) => am.name === value)
    if (selectedAmData) {
      const newSlug = selectedAmData.name.toLowerCase().replace(/\s+/g, "-")
      router.push(`/dashboard/target-am/${newSlug}`)
    }
  }

  // Get current AM data
  const currentAM = amList.find((am) => am.name === selectedAM) || amList[0]

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!currentAM) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
          <h2 className="text-lg font-semibold">Data tidak ditemukan</h2>
          <p>Tidak dapat menemukan data target AM. Silakan periksa koneksi ke spreadsheet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <DynamicHeader />
      <div className="p-6 space-y-2 flex-1">
        <div className="flex justify-between items-start">
          {/* Hidden dropdown for AM selection - only visible on mobile */}
          <div className=" w-1/4 mb-4">
            <Select value={selectedAM || ""} onValueChange={handleAmChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Account Manager" />
              </SelectTrigger>
              <SelectContent>
                {amList.map((am) => (
                  <SelectItem key={am.nik} value={am.name}>
                    {am.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="bg-red-600 text-white p-4 rounded-lg w-[40%]">
            <h1 className="text-md font-normal">TARGET AM WBS SULBAGTENG 2025</h1>
            <p className="text-lg font-bold">
              {currentAM.name} / {currentAM.nik}
            </p>
          </div>

          {/* Main Content Grid - with padding top to account for the header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-16">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Revenue Section */}
              <div>
                <div className="bg-red-600 text-white p-2 text-center rounded-3xl mb-4">
                  <h2 className="text-2xl font-bold">REVENUE</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 w-3/4 mx-auto">
                  <div className="bg-red-400 rounded-lg px-4 py-1 text-center text-white">
                    <h3 className="font-bold text-lg">TOTAL</h3>
                    <p className="font-semibold">{currentAM.revenue.total}</p>
                  </div>
                  <div className="bg-red-400 rounded-lg px-4 py-1 text-center text-white">
                    <h3 className="font-bold text-lg">SUSTAIN</h3>
                    <p className="font-semibold">{currentAM.revenue.sustain}</p>
                  </div>
                </div>
                <div className="w-2/5 mx-auto">
                  <div className="bg-red-400 rounded-lg px-4 py-1 text-center text-white">
                    <h3 className="font-bold text-lg">NGTMA</h3>
                    <p className="font-semibold">{currentAM.revenue.ngtma}</p>
                  </div>
                </div>
              </div>

              {/* Target Mytens Section */}
              <div>
                <div className="bg-red-600 text-white p-2 text-center rounded-3xl mb-4">
                  <h2 className="text-2xl font-bold">TARGET MYTENS</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 w-3/4 mx-auto">
                  <div className="flex flex-col items-center justify-center bg-red-400 rounded-lg px-4 py-1 text-center text-white h-full">
                    <div className=" flex flex-col items-center justify-center">
                      <h3 className="font-bold text-lg">VISITING</h3>
                      <p className="font-semibold">{currentAM.targetMytens.visiting}</p>
                    </div>
                  </div>
                  <div className="bg-red-400 rounded-lg px-4 py-1 text-center text-white">
                    <h3 className="font-bold text-lg ">
                      ACCOUNT PROFILE
                    </h3>
                    <p className="font-semibold">{currentAM.targetMytens.accountProfile}</p>
                  </div>
                </div>
              </div>

              {/* Sales Digital Product Section */}
              <div>
                <div className="bg-red-600 text-white p-2 text-center rounded-3xl mb-4">
                  <h2 className="text-2xl font-bold">SALES DIGITAL PRODUCT</h2>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-red-400 rounded-lg px-4 py-3 text-center text-white">
                    <div className="flex justify-center">
                      <Image src="/oca.png" alt="OCA" width={80} height={40} />
                    </div>
                    <p className="font-semibold text-2xl">
                      {currentAM.salesDigital.oca.replace(/unit/gi, "").trim()}
                    </p>
                  </div>
                  <div className="bg-red-400 rounded-lg px-4 py-2 text-center text-white">
                    <div className="flex justify-center">
                      <Image src="/netmonk.png" alt="NETMONK" width={100} height={40} />
                    </div>
                    <p className="font-semibold text-2xl">{currentAM.salesDigital.netmonk.replace(/unit/gi, "").trim()}</p>
                  </div>
                  <div className="bg-red-400 rounded-lg px-4 py-3 text-center text-white">
                    <div className="flex justify-center">
                      <Image src="/eazy.png" alt="EAZY" width={70} height={40} />
                    </div>
                    <p className="font-semibold text-2xl">{currentAM.salesDigital.eazy.replace(/unit/gi, "").trim()}</p>
                  </div>
                  <div className="bg-red-400 rounded-lg px-4 py-2 text-center text-white">
                    <div className="flex justify-center">
                      <Image src="/pijar.png" alt="PIJAR" width={70} height={40} />
                    </div>
                    <p className="font-semibold text-2xl">{currentAM.salesDigital.pijar.replace(/unit/gi, "").trim()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Sales Operasional Section */}
              <div className="mb-20">
                <div className="bg-red-600 text-white p-2 text-center rounded-3xl mb-4">
                  <h2 className="text-2xl font-bold">SALES OPERASIONAL</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-400 rounded-lg px-4 py-1 text-center text-white">
                    <div className="flex justify-center">
                      <Image src="/@wifi.png" alt="@WIFI" width={40} height={40} />
                      <Image src="/indibiz.webp" alt="INDIBIZ WIFI" width={100} height={50} />
                    </div>
                    <p className="font-semibold text-lg">{currentAM.salesOperasional.indibizWifi}</p>
                  </div>
                  <div className="bg-red-400 rounded-lg px-4 py-1 text-center text-white">
                    <div className="flex justify-center">
                      <Image src="/indibiz.webp" alt="INDIBIZ ASTINET" width={100} height={50} />
                    </div>
                    <p className="font-semibold text-lg">{currentAM.salesOperasional.indibizAstinet}</p>
                  </div>
                  <div className="bg-red-400 rounded-lg px-4 py-1 text-center text-white">
                    <div className="flex justify-center">
                      <Image src="/sdwan.png" alt="SOWAN" width={80} height={40} />
                    </div>
                    <p className="font-semibold text-lg">{currentAM.salesOperasional.sowan}</p>
                  </div>
                </div>
              </div>

              {/* AM Photo - Positioned to match the image */}
              <div className="flex flex-col items-end justify-end">
                <div className="w-[250px] h-[350px] rounded-lg overflow-hidden shadow relative flex flex-col">
                  <div className="w-full h-[250px] relative">
                    <Image
                      src={getAMPhotoUrl(currentAM.name)}
                      alt={currentAM.name}
                      width={250}
                      height={250}
                      className="object-cover object-top w-full h-full"
                      style={{ objectFit: "cover", objectPosition: "top" }}
                      onError={(e: any) => { e.target.src = "/users.png?height=300&width=250"; }}
                    />
                  </div>
                  <div className="bg-red-600 text-white p-2 text-center shadow-lg flex-1 flex flex-col justify-center">
                    <h3 className="font-bold">{currentAM.name}</h3>
                    <p>NIK: {currentAM.nik}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

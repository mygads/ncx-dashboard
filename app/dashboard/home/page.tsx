"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  FileSpreadsheet, 
  Upload, 
  Link2, 
  Trash2, 
  Check, 
  AlertCircle,
  Calendar,
  FileText,
  Home,
  User
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"

interface DataSource {
  id: string
  type: 'spreadsheet' | 'file'
  name: string
  url?: string
  filename?: string
  uploadedAt: string
  userId: string
}

export default function DashboardHome() {
  const [activeTab, setActiveTab] = useState("select")
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [currentDataSource, setCurrentDataSource] = useState<DataSource | null>(null)
  const [isLoadingDataSource, setIsLoadingDataSource] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  // Load current data source on component mount
  useEffect(() => {
    loadCurrentDataSource()
  }, [user])

  const loadCurrentDataSource = async () => {
    if (!user) return

    setIsLoadingDataSource(true)
    try {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single()

      if (data && !error) {
        setCurrentDataSource({
          id: data.id,
          type: data.type,
          name: data.name,
          url: data.url,
          filename: data.filename,
          uploadedAt: data.uploaded_at,
          userId: data.user_id
        })
        setActiveTab("manage")
      }
    } catch (error) {
      // No data source found, which is fine
    } finally {
      setIsLoadingDataSource(false)
    }
  }

  const extractSpreadsheetId = (url: string): string | null => {
    // Extract ID from various Google Sheets URL formats
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /^([a-zA-Z0-9-_]+)$/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return null
  }

  const handleSpreadsheetSubmit = async () => {
    if (!spreadsheetUrl.trim()) {
      toast({
        title: "Error",
        description: "Masukkan URL Google Spreadsheet",
        variant: "destructive"
      })
      return
    }

    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl)
    if (!spreadsheetId) {
      toast({
        title: "Error",
        description: "URL Google Spreadsheet tidak valid",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setUploadProgress(0)
    setLoadingMessage("Memverifikasi akses spreadsheet...")

    try {
      // Simulate progress steps
      setUploadProgress(25)
      
      // Verify spreadsheet access
      const response = await fetch(`/api/verify-spreadsheet?id=${spreadsheetId}`)
      if (!response.ok) {
        throw new Error("Spreadsheet tidak dapat diakses atau tidak ditemukan")
      }

      setUploadProgress(50)
      setLoadingMessage("Menghapus data source lama...")

      const supabase = createClientComponentClient()
      
      // Delete existing data source
      await supabase
        .from('data_sources')
        .delete()
        .eq('user_id', user?.id)

      setUploadProgress(75)
      setLoadingMessage("Menyimpan konfigurasi baru...")

      // Save new data source
      const { data, error } = await supabase
        .from('data_sources')
        .insert({
          user_id: user?.id,
          type: 'spreadsheet',
          name: `Google Spreadsheet`,
          url: spreadsheetId,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setUploadProgress(100)
      setLoadingMessage("Berhasil terhubung!")

      setCurrentDataSource(data)
      setActiveTab("manage")
      setSpreadsheetUrl("")

      toast({
        title: "Berhasil",
        description: "Google Spreadsheet berhasil dihubungkan"
      })

      // Trigger a page refresh to update sidebar state after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)

    } catch (error) {
      console.error("Error connecting spreadsheet:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menghubungkan spreadsheet",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
      setLoadingMessage("")
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast({
        title: "Error",
        description: "Pilih file Excel atau CSV",
        variant: "destructive"
      })
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]

    if (!allowedTypes.includes(uploadFile.type)) {
      toast({
        title: "Error",
        description: "Format file tidak didukung. Gunakan Excel (.xlsx, .xls) atau CSV",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setUploadProgress(0)
    setLoadingMessage("Mempersiapkan upload...")

    try {
      setUploadProgress(20)
      setLoadingMessage("Mengupload file...")

      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('userId', user?.id || '')

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval)
            return 80
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(90)
      setLoadingMessage("Memproses file...")

      if (!response.ok) {
        throw new Error('Gagal mengupload file')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Gagal mengupload file')
      }

      setUploadProgress(100)
      setLoadingMessage("Upload berhasil!")

      // Update current data source from API response
      setCurrentDataSource(result.dataSource)
      setActiveTab("manage")
      setUploadFile(null)

      toast({
        title: "Berhasil",
        description: "File berhasil diupload"
      })

      // Trigger a page refresh to update sidebar state after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)

    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengupload file",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
      setLoadingMessage("")
    }
  }

  const handleDeleteDataSource = async () => {
    if (!currentDataSource) return

    setIsLoading(true)
    setUploadProgress(0)
    setLoadingMessage("Menghapus data source...")

    try {
      setUploadProgress(25)
      const supabase = createClientComponentClient()

      // Delete from database
      const { error } = await supabase
        .from('data_sources')
        .delete()
        .eq('id', currentDataSource.id)

      if (error) throw error

      setUploadProgress(60)
      setLoadingMessage("Menghapus file fisik...")

      // If it's a file, delete the physical file
      if (currentDataSource.type === 'file' && currentDataSource.filename) {
        await fetch('/api/delete-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: currentDataSource.filename })
        })
      }

      setUploadProgress(100)
      setLoadingMessage("Berhasil dihapus!")

      setCurrentDataSource(null)
      setActiveTab("select")

      toast({
        title: "Berhasil",
        description: "Sumber data berhasil dihapus"
      })

      // Refresh page to update sidebar
      setTimeout(() => {
        window.location.reload()
      }, 1000)

    } catch (error) {
      console.error("Error deleting data source:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus sumber data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
      setLoadingMessage("")
    }
  }

  // Welcome Header Component
  const WelcomeHeader = () => (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
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
      {/* Decorative ornament: Welcome pattern */}
      <svg
        className="absolute right-4 top-2 w-12 h-12 md:w-20 md:h-20 opacity-40 pointer-events-none"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <Home className="w-full h-full" />
      </svg>
      
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              Selamat Datang, {user?.user_metadata?.full_name || user?.email || 'User'}
            </h1>
            <p className="text-red-100 text-sm md:text-base">
              Kelola sumber data dashboard Anda di sini
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="bg-white rounded-2xl py-2 px-3 flex items-center gap-2">
          <div className="relative w-16 h-6 md:w-20 md:h-8">
            <Image
              src="/telkom-logo.png"
              alt="Telkom Logo"
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 768px) 64px, 80px"
              priority
            />
          </div>
          <div className="relative w-24 h-6 md:w-32 md:h-8">
            <Image
              src="/ncs-logo.png"
              alt="NCX Logo"
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 768px) 96px, 128px"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Akses Ditolak</h2>
          <p className="text-muted-foreground">Silakan login untuk mengakses dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomeHeader />
      
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Loading state for initial data source check */}
        {isLoadingDataSource ? (
          <div className="space-y-6">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-80" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select" disabled={currentDataSource !== null}>
                Pilih Sumber Data
              </TabsTrigger>
              <TabsTrigger value="manage" disabled={currentDataSource === null}>
                Kelola Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    Pilih Sumber Data
                  </CardTitle>
                  <CardDescription>
                    Pilih sumber data yang akan digunakan untuk dashboard analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="spreadsheet" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="spreadsheet" className="flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Google Spreadsheet
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload File
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="spreadsheet" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="spreadsheet-url">URL Google Spreadsheet</Label>
                        <Input
                          id="spreadsheet-url"
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          value={spreadsheetUrl}
                          onChange={(e) => setSpreadsheetUrl(e.target.value)}
                          disabled={isLoading}
                        />
                        <p className="text-sm text-muted-foreground">
                          Masukkan URL lengkap atau ID dari Google Spreadsheet
                        </p>
                      </div>
                      
                      {/* Progress indicator for spreadsheet connection */}
                      {isLoading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{loadingMessage}</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="w-full" />
                        </div>
                      )}
                      
                      <Button 
                        onClick={handleSpreadsheetSubmit} 
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? `${loadingMessage}...` : "Hubungkan Spreadsheet"}
                      </Button>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="file-upload">Upload File Excel atau CSV</Label>
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          disabled={isLoading}
                        />
                        <p className="text-sm text-muted-foreground">
                          Mendukung format: Excel (.xlsx, .xls) dan CSV (.csv)
                        </p>
                      </div>
                      {uploadFile && (
                        <Alert>
                          <FileText className="h-4 w-4" />
                          <AlertDescription>
                            File dipilih: <strong>{uploadFile.name}</strong> ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {/* Progress indicator for file upload */}
                      {isLoading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{loadingMessage}</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="w-full" />
                        </div>
                      )}
                      
                      <Button 
                        onClick={handleFileUpload} 
                        disabled={isLoading || !uploadFile}
                        className="w-full"
                      >
                        {isLoading ? `${loadingMessage}...` : "Upload File"}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage" className="space-y-6">
              {currentDataSource && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {currentDataSource.type === 'spreadsheet' ? (
                        <Link2 className="h-5 w-5" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                      Sumber Data Aktif
                    </CardTitle>
                    <CardDescription>
                      Data source yang sedang digunakan untuk dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        {currentDataSource.type === 'spreadsheet' ? 'Google Spreadsheet' : 'File Upload'}
                      </Badge>
                      <Badge variant="outline">
                        <Check className="h-3 w-3 mr-1" />
                        Aktif
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Nama</Label>
                        <p className="text-sm text-muted-foreground">{currentDataSource.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tanggal Upload</Label>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(currentDataSource.uploadedAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {currentDataSource.type === 'spreadsheet' && currentDataSource.url && (
                      <div>
                        <Label className="text-sm font-medium">Spreadsheet ID</Label>
                        <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                          {currentDataSource.url}
                        </p>
                      </div>
                    )}

                    {currentDataSource.type === 'file' && currentDataSource.filename && (
                      <div>
                        <Label className="text-sm font-medium">Nama File</Label>
                        <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                          {currentDataSource.filename}
                        </p>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Aksi</Label>
                      
                      {/* Progress indicator for delete operation */}
                      {isLoading && (
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>{loadingMessage}</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="w-full" />
                        </div>
                      )}
                      
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteDataSource}
                        disabled={isLoading}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isLoading ? `${loadingMessage}...` : "Hapus Sumber Data"}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Menghapus sumber data akan menghilangkan akses ke semua menu dashboard
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
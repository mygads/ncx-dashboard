"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileSpreadsheet, 
  Link2, 
  Trash2, 
  Check, 
  AlertCircle,
  Calendar,
  FileText,
  Settings,
  Database,
  RefreshCw,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { getCurrentDataSource } from "@/lib/data-source"

interface DataSource {
  id: string
  type: 'spreadsheet' | 'file'
  name: string
  url?: string
  filename?: string
  uploadedAt: string
  userId: string
}

export default function DataManagementPage() {
  const [currentDataSource, setCurrentDataSource] = useState<DataSource | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadCurrentDataSource()
  }, [user])

  const loadCurrentDataSource = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const dataSource = await getCurrentDataSource(user.id)
      setCurrentDataSource(dataSource)
    } catch (error) {
      console.error("Error loading data source:", error)
      toast({
        title: "Error",
        description: "Gagal memuat informasi sumber data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testDataConnection = async () => {
    if (!currentDataSource || !user) return

    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch(`/api/read-data?userId=${user.id}&sheetName=DataAutoGSlide`)
      
      if (response.ok) {
        const data = await response.json()
        setTestResult({
          success: true,
          message: `Koneksi berhasil! Ditemukan ${data.rowCount} baris data.`
        })
      } else {
        const errorData = await response.json()
        setTestResult({
          success: false,
          message: errorData.error || "Gagal mengakses data"
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Terjadi kesalahan saat menguji koneksi"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDataSource = async () => {
    if (!currentDataSource || !user) return

    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus sumber data ini? " +
      "Tindakan ini akan menghapus akses ke semua menu dashboard dan tidak dapat dibatalkan."
    )

    if (!confirmed) return

    setIsLoading(true)

    try {
      const supabase = createClientComponentClient()

      // Delete from database
      const { error } = await supabase
        .from('data_sources')
        .delete()
        .eq('id', currentDataSource.id)

      if (error) throw error

      // If it's a file, delete the physical file
      if (currentDataSource.type === 'file' && currentDataSource.filename) {
        await fetch('/api/delete-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: currentDataSource.filename })
        })
      }

      setCurrentDataSource(null)
      setTestResult(null)

      toast({
        title: "Berhasil",
        description: "Sumber data berhasil dihapus"
      })

      // Redirect to home to set up new data source
      window.location.href = "/dashboard/home"

    } catch (error) {
      console.error("Error deleting data source:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus sumber data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const goToDataSourceSetup = () => {
    window.location.href = "/dashboard/home"
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Akses Ditolak</h2>
          <p className="text-muted-foreground">Silakan login untuk mengakses halaman ini</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Manajemen Data
        </h1>
        <p className="text-muted-foreground mt-2">
          Kelola dan monitor sumber data untuk dashboard analytics
        </p>
      </div>

      {currentDataSource ? (
        <div className="space-y-6">
          {/* Current Data Source Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sumber Data Aktif
              </CardTitle>
              <CardDescription>
                Informasi sumber data yang sedang digunakan untuk dashboard
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
                  <Label className="text-sm font-medium">Tanggal Setup</Label>
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
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded flex-1">
                      {currentDataSource.url}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${currentDataSource.url}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
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
            </CardContent>
          </Card>

          {/* Connection Test Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Test Koneksi Data
              </CardTitle>
              <CardDescription>
                Uji akses ke sumber data untuk memastikan data dapat dibaca dengan benar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testDataConnection} 
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? "Menguji Koneksi..." : "Test Koneksi Data"}
              </Button>

              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Aksi
              </CardTitle>
              <CardDescription>
                Tindakan yang dapat dilakukan pada sumber data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline"
                  onClick={goToDataSourceSetup}
                  className="w-full"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Ganti Sumber Data
                </Button>

                <Button 
                  variant="destructive"
                  onClick={handleDeleteDataSource}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isLoading ? "Menghapus..." : "Hapus Sumber Data"}
                </Button>
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground">
                <p><strong>Catatan:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Mengganti sumber data akan mengarahkan Anda ke halaman setup baru</li>
                  <li>Menghapus sumber data akan menghilangkan akses ke semua menu dashboard</li>
                  <li>Pastikan untuk backup data penting sebelum menghapus sumber data</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Belum Ada Sumber Data
            </CardTitle>
            <CardDescription>
              Anda belum mengatur sumber data untuk dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Setup Sumber Data</h3>
            <p className="text-muted-foreground mb-6">
              Pilih dan konfigurasikan sumber data (Google Spreadsheet atau Upload File) 
              untuk mulai menggunakan dashboard analytics.
            </p>
            <Button onClick={goToDataSourceSetup}>
              <Database className="h-4 w-4 mr-2" />
              Setup Sumber Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

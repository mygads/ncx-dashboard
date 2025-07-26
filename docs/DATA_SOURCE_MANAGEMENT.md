# Data Source Management System

## Overview

Sistem manajemen sumber data yang memungkinkan pengguna untuk memilih antara Google Spreadsheet atau upload file Excel/CSV sebagai sumber data untuk dashboard analytics.

## Fitur Utama

### 1. Pilihan Sumber Data
- **Google Spreadsheet**: Menghubungkan dengan Google Sheets menggunakan URL atau ID
- **Upload File**: Mengupload file Excel (.xlsx, .xls) atau CSV (.csv)

### 2. Validasi dan Verifikasi
- Validasi URL Google Spreadsheet
- Validasi format file upload
- Test koneksi data
- Verifikasi struktur data

### 3. Manajemen Data Source
- Monitor status koneksi
- Ganti sumber data
- Hapus sumber data
- Informasi detail sumber data aktif

### 4. Kontrol Akses Menu
- Menu dashboard dikunci hingga user mengatur sumber data
- Redirect otomatis ke halaman setup jika belum ada data source
- Home dan Profile selalu dapat diakses

## Struktur Database

### Tabel `data_sources`
```sql
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('spreadsheet', 'file')),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500), -- For spreadsheet ID
    filename VARCHAR(255), -- For uploaded files
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### 1. `/api/verify-spreadsheet`
- **Method**: GET
- **Purpose**: Verifikasi akses Google Spreadsheet
- **Parameters**: `id` (spreadsheet ID)
- **Response**: Status verifikasi dan informasi sheet

### 2. `/api/upload-file`
- **Method**: POST
- **Purpose**: Upload file Excel atau CSV
- **Body**: FormData dengan file dan userId
- **Response**: Informasi file yang berhasil diupload

### 3. `/api/read-data`
- **Method**: GET
- **Purpose**: Membaca data dari sumber data aktif
- **Parameters**: `userId`, `sheetName` (optional)
- **Response**: Data array dari spreadsheet atau file

### 4. `/api/delete-file`
- **Method**: POST
- **Purpose**: Menghapus file yang diupload
- **Body**: `{ filename }`
- **Response**: Status penghapusan

## Halaman dan Komponen

### 1. Dashboard Home (`/dashboard/home`)
- Setup sumber data untuk user baru
- Interface untuk memilih Google Spreadsheet atau Upload File
- Manajemen sumber data yang sudah ada

### 2. Data Management (`/dashboard/data-management`)
- Monitor dan kelola sumber data aktif
- Test koneksi data
- Ganti atau hapus sumber data

### 3. Sidebar Component
- Tampilkan menu yang terkunci dengan ikon lock
- Indikator visual untuk menu yang memerlukan data source
- Dynamic menu berdasarkan ketersediaan data

## File Upload Management

### Lokasi File
- Files disimpan di: `public/uploads/`
- Naming convention: `{userId}_{timestamp}.{extension}`
- Supported formats: .xlsx, .xls, .csv

### File Security
- Validasi file type
- Size limitation (configurable)
- User-specific file access
- Automatic cleanup saat hapus data source

## Data Source Utility

### `lib/data-source.ts`
Helper functions untuk:
- `fetchDataFromSource()`: Fetch data dari sumber aktif
- `hasActiveDataSource()`: Check apakah user punya data source
- `getCurrentDataSource()`: Get informasi data source aktif

## Middleware Protection

### Route Protection
- Dashboard routes memerlukan authentication
- Analytics routes memerlukan data source
- Auto-redirect ke setup page jika belum ada data source

### Allowed Routes Without Data Source
- `/dashboard/home`
- `/dashboard/profile`
- `/dashboard/data-management`

## Error Handling

### Common Error Scenarios
1. **Spreadsheet tidak dapat diakses**
   - Invalid URL/ID
   - Permissions tidak sesuai
   - Spreadsheet tidak public

2. **File upload gagal**
   - Format file tidak didukung
   - File size terlalu besar
   - Storage error

3. **Data read error**
   - Sheet name tidak ditemukan
   - Data format tidak sesuai
   - Network connectivity issues

### Error Display
- Alert notifications dengan toast
- Inline error messages
- Redirect ke error page jika perlu

## Migration Guide

### Untuk Developer
1. Update semua function yang menggunakan `process.env.NEXT_PUBLIC_SPREADSHEET_ID`
2. Ganti dengan `fetchDataFromSource(userId, sheetName)`
3. Add error handling untuk data source
4. Update UI components untuk show loading/error states

### Untuk User
1. Login ke dashboard
2. Akan diarahkan ke halaman setup data source
3. Pilih Google Spreadsheet atau Upload File
4. Verifikasi koneksi data
5. Menu dashboard akan terbuka setelah setup selesai

## Best Practices

### Security
- Validate all file uploads
- Sanitize file names
- Implement rate limiting
- Use secure file storage

### Performance
- Cache data source information
- Lazy load menu items
- Optimize file read operations
- Use background processing for large files

### User Experience
- Clear error messages
- Loading indicators
- Progress feedback
- Intuitive navigation flows

## Troubleshooting

### Common Issues
1. **Menu masih locked setelah setup**
   - Check database data_sources table
   - Verify user_id matches
   - Clear browser cache

2. **Spreadsheet data tidak muncul**
   - Verify spreadsheet permissions
   - Check API key configuration
   - Test with verify-spreadsheet endpoint

3. **File upload gagal**
   - Check file format
   - Verify uploads directory permissions
   - Check server storage space

### Debug Steps
1. Check browser console for errors
2. Verify network requests in dev tools
3. Check server logs
4. Test API endpoints directly
5. Verify database records

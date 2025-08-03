import { NextRequest, NextResponse } from "next/server"
import { unlink } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json()

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      )
    }

    // Construct file path
    const filePath = join(process.cwd(), 'public', 'uploads', filename)

    try {
      await unlink(filePath)
      return NextResponse.json({
        success: true,
        message: "File deleted successfully"
      })
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, consider it already deleted
        return NextResponse.json({
          success: true,
          message: "File already deleted or doesn't exist"
        })
      }
      throw error
    }

  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    )
  }
}

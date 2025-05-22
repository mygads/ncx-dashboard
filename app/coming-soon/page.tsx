"use client"

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Coming Soon</h1>
      <p className="text-lg text-gray-500 mb-6">Halaman ini sedang dalam pengembangan.<br />Silakan kembali lagi nanti.</p>
      <span className="inline-block animate-bounce text-6xl text-red-400">🚧</span>
    </div>
  )
}

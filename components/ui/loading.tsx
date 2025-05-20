"use client"
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative flex items-center justify-center mb-6">
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75 animate-ping"></span>
        <svg
          className="relative z-10 w-16 h-16 text-red-600 animate-spin"
          fill="none"
          viewBox="0 0 64 64"
        >
          <circle
            className="opacity-25"
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="8"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M60 32c0-15.464-12.536-28-28-28v8c11.046 0 20 8.954 20 20h8z"
          />
        </svg>
      </div>
      <p className="text-red-700 text-xl font-semibold animate-pulse tracking-wide">
        Loading Data...
      </p>
    </div>
  )
}

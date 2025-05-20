// lib/getBaseUrl.ts
export function getBaseUrl() {
  // 1️⃣ Browser: window.location.origin (e.g. https://my‑app.vercel.app)
  if (typeof window !== "undefined") return window.location.origin

  // 2️⃣ Server-side on Vercel: use the Vercel-provided URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  // 3️⃣ Server-side on Render / Railway / DigitalOcean etc.
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL

  // 4️⃣ Fallback to localhost for ⁠ next dev ⁠
  return "http://localhost:3000"
}

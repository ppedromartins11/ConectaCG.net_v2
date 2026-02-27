'use client'
// components/PromotionBadge.tsx
import { useEffect, useState } from 'react'

interface PromotionBadgeProps {
  expiresAt: string | Date
  label?: string | null
}

export function PromotionBadge({ expiresAt, label }: PromotionBadgeProps) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Expirado'); return }

      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)

      if (days > 0) setTimeLeft(`${days}d ${hours}h`)
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}min`)
      else setTimeLeft(`${mins}min`)
    }

    calc()
    const interval = setInterval(calc, 60_000)
    return () => clearInterval(interval)
  }, [expiresAt])

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      <span className="text-xs font-semibold text-red-600">
        {label || 'Promoção'} · {timeLeft}
      </span>
    </div>
  )
}

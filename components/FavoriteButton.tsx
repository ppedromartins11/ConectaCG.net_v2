'use client'
// components/FavoriteButton.tsx
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
  planId: string
  initialFavorited?: boolean
  size?: 'sm' | 'md'
}

export function FavoriteButton({ planId, initialFavorited = false, size = 'md' }: FavoriteButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    try {
      if (favorited) {
        await fetch(`/api/favorites?planId=${planId}`, { method: 'DELETE' })
        setFavorited(false)
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId }),
        })
        setFavorited(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const btnSize = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className={`${btnSize} rounded-full flex items-center justify-center transition-all ${
        favorited
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-red-400'
      } disabled:opacity-50`}
    >
      <svg
        className={iconSize}
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}

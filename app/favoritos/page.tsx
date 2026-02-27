'use client'
// app/favoritos/page.tsx
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { PlanCard } from '@/components/PlanCard'
import { HireModal } from '@/components/HireModal'

export default function FavoritosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hireModal, setHireModal] = useState<any | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return }
    if (!session) return

    fetch('/api/favorites')
      .then((r) => r.json())
      .then((d) => { setFavorites(d.favorites || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [session, status, router])

  const handleHire = (planId: string) => {
    const fav = favorites.find((f) => f.plan.id === planId)
    if (fav) setHireModal({ planId, planName: fav.plan.name, providerName: fav.plan.provider.name })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-100 rounded w-1/3" />
            {[1,2,3].map(i => <div key={i} className="card h-32" />)}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Meus Favoritos</h1>
            <p className="text-slate-500 mt-1">{favorites.length} plano{favorites.length !== 1 ? 's' : ''} salvo{favorites.length !== 1 ? 's' : ''}</p>
          </div>
          <a href="/planos" className="btn-secondary text-sm">Explorar planos</a>
        </div>

        {favorites.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-4xl mb-4">🤍</p>
            <p className="font-semibold text-slate-900 mb-2">Nenhum favorito ainda</p>
            <p className="text-sm text-slate-500 mb-5">Clique no ❤️ em qualquer plano para salvar aqui.</p>
            <a href="/planos" className="btn-primary">Ver planos</a>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((fav) => (
              <PlanCard
                key={fav.id}
                plan={{ ...fav.plan, isFavorited: true }}
                onHireClick={handleHire}
              />
            ))}
          </div>
        )}
      </main>

      {hireModal && (
        <HireModal
          planId={hireModal.planId}
          planName={hireModal.planName}
          providerName={hireModal.providerName}
          onClose={() => setHireModal(null)}
        />
      )}
    </div>
  )
}

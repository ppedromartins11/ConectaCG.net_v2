'use client'
// app/perfil/page.tsx
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

const BADGE_CONFIG: Record<string, { icon: string; label: string; desc: string; color: string }> = {
  EXPLORER: { icon: '🧭', label: 'Explorador', desc: 'Fez sua primeira busca', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  REVIEWER: { icon: '⭐', label: 'Avaliador', desc: 'Publicou sua primeira avaliação', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  SPECIALIST: { icon: '🎯', label: 'Especialista', desc: 'Favoritou 3 ou mais planos', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  AMBASSADOR: { icon: '🤝', label: 'Embaixador', desc: 'Indicou um amigo', color: 'bg-green-50 border-green-200 text-green-700' },
  EARLY_ADOPTER: { icon: '🚀', label: 'Early Adopter', desc: 'Um dos primeiros 100 usuários', color: 'bg-red-50 border-red-200 text-red-700' },
}

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return }
    if (!session) return

    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((d) => { setUserData(d.user); setLoading(false) })
      .catch(() => setLoading(false))
  }, [session, status, router])

  const copyReferral = () => {
    if (!userData) return
    const url = `${window.location.origin}/auth/cadastro?ref=${userData.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen"><Navbar />
        <main className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-4">
          <div className="h-8 bg-slate-100 rounded w-1/3" />
          <div className="card h-48" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Header card */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-2xl">
              {userData?.name?.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">{userData?.name}</h1>
              <p className="text-slate-500 text-sm">{userData?.email}</p>
              <p className="text-xs text-slate-400 mt-1">
                Membro desde {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xl font-bold text-slate-900">{userData?.reviewCount ?? 0}</p>
                  <p className="text-xs text-slate-500">Avaliações</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xl font-bold text-slate-900">{userData?.favoriteCount ?? 0}</p>
                  <p className="text-xs text-slate-500">Favoritos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-900 mb-4">🏆 Conquistas</h2>
          {userData?.badges?.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma conquista ainda. Explore planos para ganhar badges!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {userData?.badges?.map((badge: any) => {
                const config = BADGE_CONFIG[badge.slug]
                if (!config) return null
                return (
                  <div key={badge.slug} className={`p-3 rounded-xl border ${config.color}`}>
                    <p className="text-2xl mb-1">{config.icon}</p>
                    <p className="font-semibold text-sm">{config.label}</p>
                    <p className="text-xs opacity-75">{config.desc}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Referral */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-900 mb-2">🤝 Indique amigos</h2>
          <p className="text-sm text-slate-500 mb-4">Compartilhe seu link e ganhe o badge Embaixador quando um amigo se cadastrar.</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/auth/cadastro?ref=${userData?.id}` : ''}
              className="input flex-1 text-xs bg-slate-50"
            />
            <button onClick={copyReferral} className="btn-primary whitespace-nowrap text-sm">
              {copied ? '✓ Copiado!' : 'Copiar link'}
            </button>
          </div>
        </div>

        {/* Profile data */}
        {userData?.profile && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">🎯 Perfil de uso</h2>
              <a href="/personalizar" className="text-xs text-brand-500 hover:underline">Atualizar →</a>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Pessoas na casa</p>
                <p className="font-semibold">{userData.profile.pessoas}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Velocidade atual</p>
                <p className="font-semibold">{userData.profile.velocidadeAtual ? `${userData.profile.velocidadeAtual} Mbps` : '—'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Atividades</p>
                <p className="font-semibold">{userData.profile.atividades?.join(', ') || '—'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Dispositivos</p>
                <p className="font-semibold">{userData.profile.dispositivos?.join(', ') || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

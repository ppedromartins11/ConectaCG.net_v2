'use client'
// app/SearchSection.tsx
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PlanCard } from '@/components/PlanCard'
import { CTALoginCard } from '@/components/CTALoginCard'
import { HireModal } from '@/components/HireModal'
import { AlertModal } from '@/components/AlertModal'

interface SearchResult {
  plans: any[]
  total: number
  hiddenCount: number
  isLoggedIn: boolean
}

const CATEGORIES = ['Todos', 'Gaming', 'Streaming', 'Trabalho']

export function SearchSection() {
  const { data: session } = useSession()
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [hireModal, setHireModal] = useState<{ planId: string; planName: string; providerName: string } | null>(null)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches for logged-in users
  useEffect(() => {
    if (session) {
      fetch('/api/user/history')
        .then((r) => r.json())
        .then((d) => {
          if (d.history) setRecentSearches(d.history.slice(0, 3).map((h: any) => h.cep))
        })
        .catch(() => {})
    }
  }, [session])

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    if (digits.length > 5) return digits.slice(0, 5) + '-' + digits.slice(5)
    return digits
  }

  const doSearch = async (searchCep: string) => {
    const cleanCep = searchCep.replace(/\D/g, '')
    if (cleanCep.length < 5) { setError('Digite um CEP válido com 8 dígitos'); return }
    setError('')
    setLoading(true)
    setActiveCategory('Todos')

    try {
      const categoryParam = activeCategory !== 'Todos' ? `&category=${activeCategory}` : ''
      const res = await fetch(`/api/plans?cep=${searchCep}${categoryParam}`)
      const data = await res.json()
      setResults(data)
    } catch {
      setError('Erro ao buscar planos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(cep)
  }

  const handleHire = (planId: string) => {
    const plan = results?.plans.find((p) => p.id === planId)
    if (plan) {
      setHireModal({ planId, planName: plan.name, providerName: plan.provider.name })
    }
  }

  const filteredPlans = results
    ? activeCategory === 'Todos'
      ? results.plans
      : results.plans.filter((p) => p.categorias.includes(activeCategory))
    : []

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 text-white py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-700/20 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm font-medium mb-6 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
            Comparando planos em toda a região
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-up stagger-1">
            Encontre a Melhor <br />
            <span className="text-brand-400">Internet da Sua Região</span>
          </h1>

          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto animate-fade-up stagger-2">
            Compare planos, preços e velocidades dos principais provedores.
            Descubra qual internet é perfeita para você.
          </p>

          <form onSubmit={handleSearch} className="mt-10 animate-fade-up stagger-3">
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(formatCep(e.target.value))}
                  placeholder="Digite seu CEP (ex: 01310-000)"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 transition-all"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary py-3.5 px-6 text-sm whitespace-nowrap">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Buscando...
                  </span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar
                  </>
                )}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </form>

          {/* Recent searches */}
          {recentSearches.length > 0 && !results && (
            <div className="mt-4 animate-fade-up stagger-4">
              <p className="text-xs text-slate-400 mb-2">Buscas recentes:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setCep(s); doSearch(s) }}
                    className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300 hover:bg-white/20 transition"
                  >
                    📍 {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      {results && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Planos encontrados na sua região:</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Mostrando {results.plans.length} de {results.total} planos · CEP: {cep}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAlertModal(true)}
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
              >
                🔔 Criar alerta
              </button>
              {results.isLoggedIn && (
                <a href="/personalizar" className="btn-primary text-xs px-3 py-2">
                  🎯 Personalizar
                </a>
              )}
            </div>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-brand-500 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredPlans.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-slate-500">Nenhum plano encontrado para este CEP.</p>
              <a href="/planos" className="btn-primary mt-4 inline-flex">Ver todos os planos</a>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onHireClick={handleHire} />
              ))}

              {!results.isLoggedIn && results.hiddenCount > 0 && (
                <CTALoginCard hiddenCount={results.hiddenCount} />
              )}
            </div>
          )}
        </section>
      )}

      {/* Features (no search yet) */}
      {!results && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🔍', title: 'Compare facilmente', desc: 'Velocidade, preço e avaliações lado a lado.' },
              { icon: '🎯', title: 'Recomendação personalizada', desc: 'Responda perguntas e encontramos o plano ideal.' },
              { icon: '⭐', title: 'Avaliações reais', desc: 'Leia avaliações verificadas antes de contratar.' },
            ].map((f) => (
              <div key={f.title} className="card p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      {hireModal && (
        <HireModal
          planId={hireModal.planId}
          planName={hireModal.planName}
          providerName={hireModal.providerName}
          onClose={() => setHireModal(null)}
        />
      )}
      {showAlertModal && (
        <AlertModal defaultCep={cep} onClose={() => setShowAlertModal(false)} />
      )}
    </main>
  )
}

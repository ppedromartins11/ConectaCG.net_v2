'use client'
// app/planos/[id]/page.tsx
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/Navbar'
import { ProviderLogo } from '@/components/ProviderLogo'
import { StarRating } from '@/components/StarRating'
import { ReviewCard } from '@/components/ReviewCard'

export default function PlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ nota: 5, comentario: '' })
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/plans/${params.id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewLoading(true)
    setReviewError('')

    const res = await fetch(`/api/plans/${params.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewForm),
    })

    const result = await res.json()
    setReviewLoading(false)

    if (!res.ok) {
      setReviewError(result.error || 'Erro ao enviar avaliação')
    } else {
      setReviewSuccess(true)
      // Refresh data
      fetch(`/api/plans/${params.id}`).then((r) => r.json()).then(setData)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-100 rounded w-1/3" />
            <div className="card p-6 space-y-3">
              <div className="h-6 bg-slate-100 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!data?.plan) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-10 text-center">
          <p className="text-slate-500">Plano não encontrado.</p>
          <button onClick={() => router.back()} className="btn-primary mt-4">Voltar</button>
        </main>
      </div>
    )
  }

  const { plan, comparePlans } = data

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <button onClick={() => router.back()} className="hover:text-brand-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <span>/</span>
          <span>Detalhes do plano</span>
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-1">Detalhes do plano</h1>
        <p className="text-sm text-slate-500 mb-6">Confira todas as informações sobre este plano de internet</p>

        {/* Plan Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <ProviderLogo name={plan.provider.name} size="lg" />
              <div>
                {plan.destaque && (
                  <span className="badge bg-brand-50 text-brand-600 mb-1">⭐ Mais popular</span>
                )}
                <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                <p className="text-sm text-slate-500">Provedor: <strong>{plan.provider.name}</strong></p>
                <div className="mt-1">
                  <StarRating
                    rating={Math.round(plan.avgRating)}
                    count={plan.reviews.length}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">A partir de</p>
              <p className="text-3xl font-bold text-brand-500">R$ {plan.price.toFixed(2)}</p>
              <p className="text-xs text-slate-500">/mês · Fidelidade {plan.fidelidade} meses</p>
              <div className="flex gap-2 mt-3 justify-end">
                <button onClick={() => router.back()} className="btn-secondary text-xs px-3 py-2">Voltar</button>
                <button className="btn-primary text-xs px-3 py-2">Contratar agora</button>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-slate-900 mb-4">Especificações técnicas</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">Velocidade de download</p>
              <p className="text-2xl font-bold text-slate-900">{plan.downloadSpeed} <span className="text-sm font-normal">Mbps</span></p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">Velocidade de upload</p>
              <p className="text-2xl font-bold text-slate-900">{plan.uploadSpeed} <span className="text-sm font-normal">Mbps</span></p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">Capacidade</p>
              <p className="text-lg font-bold text-slate-900">{plan.capacidade || 'Ilimitado'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">Fidelidade</p>
              <p className="text-lg font-bold text-slate-900">{plan.fidelidade} meses</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Indicado para:</p>
              <div className="flex flex-wrap gap-2">
                {plan.indicadoPara.map((item: string) => (
                  <span key={item} className="badge bg-brand-50 text-brand-600">{item}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Benefícios inclusos:</p>
              <ul className="space-y-1">
                {plan.servicosInclusos.map((item: string) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        {comparePlans && comparePlans.length > 0 && (
          <div className="card p-6 mb-6 overflow-x-auto">
            <h3 className="font-bold text-slate-900 mb-4">Comparação detalhada</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 pr-4 text-slate-500 font-medium">Característica</th>
                  <th className="text-center py-2 px-3 bg-brand-50 rounded-t-lg">
                    <span className="badge bg-brand-500 text-white text-xs">Atual</span>
                    <p className="font-bold text-slate-900 mt-1 text-xs">{plan.name}</p>
                  </th>
                  {comparePlans.map((cp: any) => (
                    <th key={cp.id} className="text-center py-2 px-3">
                      <p className="text-xs text-slate-500">{cp.provider.name}</p>
                      <p className="font-bold text-slate-900 text-xs">{cp.name}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { label: 'Download/Upload', getValue: (p: any) => `${p.downloadSpeed}/${p.uploadSpeed} Mbps` },
                  { label: 'Preço/mês', getValue: (p: any) => `R$ ${p.price.toFixed(2)}` },
                  { label: 'Fidelidade', getValue: (p: any) => `${p.fidelidade} meses` },
                  { label: 'Avaliação', getValue: (p: any) => {
                    const avg = p.reviews?.length > 0 ? (p.reviews.reduce((a: number, r: any) => a + r.nota, 0) / p.reviews.length).toFixed(1) : '—'
                    return `⭐ ${avg}`
                  }},
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="py-3 pr-4 text-slate-500 font-medium">{row.label}</td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-900 bg-brand-50/50">{row.getValue(plan)}</td>
                    {comparePlans.map((cp: any) => (
                      <td key={cp.id} className="py-3 px-3 text-center text-slate-700">{row.getValue(cp)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reviews */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Avaliações de usuários</h3>

          {plan.reviews.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhuma avaliação ainda. Seja o primeiro!</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {plan.reviews.map((review: any) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}

          {/* Add Review */}
          {session ? (
            reviewSuccess ? (
              <div className="mt-6 p-4 bg-accent-50 rounded-xl border border-accent-100">
                <p className="text-accent-700 font-semibold text-sm">✓ Avaliação enviada com sucesso!</p>
              </div>
            ) : (
              <form onSubmit={handleReview} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                <h4 className="font-semibold text-slate-900">Deixe sua avaliação</h4>
                <div>
                  <label className="label">Nota</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm((p) => ({ ...p, nota: star }))}
                        className={`text-2xl transition-transform hover:scale-110 ${star <= reviewForm.nota ? 'text-amber-400' : 'text-slate-200'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Comentário</label>
                  <textarea
                    value={reviewForm.comentario}
                    onChange={(e) => setReviewForm((p) => ({ ...p, comentario: e.target.value }))}
                    placeholder="Conte sua experiência com este plano..."
                    className="input resize-none h-24"
                    required
                  />
                </div>
                {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                <button type="submit" disabled={reviewLoading} className="btn-primary">
                  {reviewLoading ? 'Enviando...' : 'Enviar avaliação'}
                </button>
              </form>
            )
          ) : (
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500 mb-3">Faça login para deixar sua avaliação</p>
              <a href="/auth/login" className="btn-primary text-sm">Entrar para avaliar</a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

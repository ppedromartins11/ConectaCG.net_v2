'use client'
// app/personalizar/page.tsx
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { PlanCard } from '@/components/PlanCard'

const DISPOSITIVOS = ['Computadores/Laptops', 'Celulares / tablets', 'Smart TVs / consoles', 'Outros dispositivos']
const ATIVIDADES = ['Gaming', 'Streaming', 'Home Office', 'Redes Sociais', 'Estudos', 'Outros']

export default function PersonalizarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[] | null>(null)
  const [activeFilter, setActiveFilter] = useState('Todos')

  const [form, setForm] = useState({
    pessoas: 1,
    dispositivos: [] as string[],
    atividades: [] as string[],
    velocidadeAtual: '',
  })

  if (status === 'loading') return null

  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  const toggleItem = (list: 'dispositivos' | 'atividades', item: string) => {
    setForm((prev) => ({
      ...prev,
      [list]: prev[list].includes(item)
        ? prev[list].filter((i) => i !== item)
        : [...prev[list], item],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/plans/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pessoas: form.pessoas,
          dispositivos: form.dispositivos,
          atividades: form.atividades,
          velocidadeAtual: form.velocidadeAtual ? parseInt(form.velocidadeAtual) : undefined,
        }),
      })
      const data = await res.json()
      setResults(data.plans)
      setStep(5)
    } catch {
      alert('Erro ao buscar recomendações')
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = results
    ? activeFilter === 'Todos' ? results : results.filter((p) => p.categorias.includes(activeFilter))
    : []

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {step < 5 ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Personalize sua Internet</h1>
              <p className="text-slate-500 mt-1 text-sm">Responda algumas perguntas rápidas e encontramos o plano perfeito para você</p>

              {/* Progress */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                      s === step ? 'bg-brand-500 text-white' : s < step ? 'bg-accent-500 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {s < step ? '✓' : s}
                    </div>
                    {s < 4 && <div className={`w-8 h-0.5 ${s < step ? 'bg-accent-500' : 'bg-slate-100'}`} />}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-10 mt-2">
                {['Pessoas', 'Dispositivos', 'Atividades', 'Velocidade'].map((label, i) => (
                  <span key={label} className={`text-xs ${i + 1 === step ? 'text-brand-500 font-semibold' : 'text-slate-400'}`}>{label}</span>
                ))}
              </div>
            </div>

            <div className="card p-8">
              {step === 1 && (
                <div>
                  <h2 className="font-bold text-slate-900 mb-4">1. Quantas pessoas moram na sua casa?</h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setForm((p) => ({ ...p, pessoas: Math.max(1, p.pessoas - 1) }))}
                      className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-xl font-bold hover:bg-slate-50 transition"
                    >−</button>
                    <span className="text-3xl font-bold text-slate-900 w-12 text-center">{form.pessoas}</span>
                    <button
                      onClick={() => setForm((p) => ({ ...p, pessoas: Math.min(20, p.pessoas + 1) }))}
                      className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-xl font-bold hover:bg-slate-50 transition"
                    >+</button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="font-bold text-slate-900 mb-4">2. Quantos dispositivos você conecta na internet?</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {DISPOSITIVOS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem('dispositivos', item)}
                        className={`p-3 rounded-xl border text-sm text-left transition-all ${
                          form.dispositivos.includes(item)
                            ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                            : 'border-slate-200 text-slate-600 hover:border-brand-200'
                        }`}
                      >
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="font-bold text-slate-900 mb-4">3. Quais são suas principais atividades na internet?</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {ATIVIDADES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem('atividades', item)}
                        className={`p-3 rounded-xl border text-sm text-left transition-all ${
                          form.atividades.includes(item)
                            ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                            : 'border-slate-200 text-slate-600 hover:border-brand-200'
                        }`}
                      >
                        {item === 'Gaming' && '🎮 '}{item === 'Streaming' && '📺 '}
                        {item === 'Home Office' && '💼 '}{item === 'Redes Sociais' && '📱 '}
                        {item === 'Estudos' && '📚 '}{item === 'Outros' && '⚡ '}
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="font-bold text-slate-900 mb-4">4. Qual a velocidade atual da sua internet? <span className="text-slate-400 font-normal text-base">(em Mbps)</span></h2>
                  <input
                    type="number"
                    value={form.velocidadeAtual}
                    onChange={(e) => setForm((p) => ({ ...p, velocidadeAtual: e.target.value }))}
                    placeholder="Ex: 100"
                    className="input max-w-xs"
                    min="1"
                  />
                  <p className="text-xs text-slate-400 mt-2">Opcional — deixe em branco se não souber</p>
                </div>
              )}

              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <button onClick={() => setStep((s) => s - 1)} className="btn-secondary">
                    Voltar
                  </button>
                )}
                {step < 4 ? (
                  <button onClick={() => setStep((s) => s + 1)} className="btn-primary ml-auto">
                    Próximo →
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={loading} className="btn-success ml-auto">
                    {loading ? 'Buscando...' : '🎯 Ver minha recomendação'}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Planos adequados para você:</h1>
              <p className="text-slate-500 mt-1 text-sm">De acordo com suas respostas, esses são os planos mais recomendados para sua casa</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['Todos', 'Gaming', 'Trabalho', 'Streaming'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeFilter === cat
                      ? 'bg-brand-500 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredResults.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>

            <button
              onClick={() => { setStep(1); setResults(null) }}
              className="btn-secondary mt-6"
            >
              Refazer questionário
            </button>
          </>
        )}
      </main>
    </div>
  )
}

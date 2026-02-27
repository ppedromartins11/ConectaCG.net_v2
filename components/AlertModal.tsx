'use client'
// components/AlertModal.tsx
import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface AlertModalProps {
  defaultCep?: string
  onClose: () => void
}

export function AlertModal({ defaultCep = '', onClose }: AlertModalProps) {
  const { data: session } = useSession()
  const [form, setForm] = useState({ cep: defaultCep, maxPrice: '', minSpeed: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cep: form.cep,
        maxPrice: parseFloat(form.maxPrice),
        minSpeed: form.minSpeed ? parseInt(form.minSpeed) : undefined,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error || 'Erro'); return }
    setSuccess(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card p-6 w-full max-w-md">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!session ? (
          <div className="text-center py-4">
            <p className="font-semibold text-slate-900 mb-3">Faça login para criar alertas</p>
            <a href="/auth/login" className="btn-primary w-full">Entrar</a>
          </div>
        ) : success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Alerta criado!</h3>
            <p className="text-sm text-slate-500">Te avisaremos quando um plano se encaixar nos seus critérios.</p>
            <button onClick={onClose} className="btn-primary mt-4 w-full">Fechar</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-slate-900 text-lg mb-1">🔔 Criar alerta de preço</h3>
            <p className="text-sm text-slate-500 mb-5">Avise-me quando um plano encaixar nesses critérios.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">CEP da região</label>
                <input
                  className="input"
                  value={form.cep}
                  onChange={(e) => setForm((p) => ({ ...p, cep: e.target.value }))}
                  placeholder="01310-000"
                  required
                />
              </div>
              <div>
                <label className="label">Preço máximo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={form.maxPrice}
                  onChange={(e) => setForm((p) => ({ ...p, maxPrice: e.target.value }))}
                  placeholder="100.00"
                  required
                />
              </div>
              <div>
                <label className="label">Velocidade mínima (Mbps) — opcional</label>
                <input
                  type="number"
                  className="input"
                  value={form.minSpeed}
                  onChange={(e) => setForm((p) => ({ ...p, minSpeed: e.target.value }))}
                  placeholder="200"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Criando...' : '🔔 Criar alerta'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

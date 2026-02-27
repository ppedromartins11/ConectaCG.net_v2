'use client'
// components/HireModal.tsx
import { useState } from 'react'

interface HireModalProps {
  planId: string
  planName: string
  providerName: string
  onClose: () => void
}

export function HireModal({ planId, planName, providerName, onClose }: HireModalProps) {
  const [form, setForm] = useState({ name: '', phone: '', cep: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/plans/${planId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erro'); return }
      setSuccess(true)
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
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

        {success ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Interesse registrado!</h3>
            <p className="text-sm text-slate-500">
              Um consultor da <strong>{providerName}</strong> entrará em contato em breve para concluir sua contratação.
            </p>
            <button onClick={onClose} className="btn-primary mt-5 w-full">Fechar</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-slate-900 text-lg mb-1">Contratar plano</h3>
            <p className="text-sm text-slate-500 mb-5">
              <strong>{planName}</strong> · {providerName}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Deixe seus dados e um consultor entrará em contato para finalizar a contratação.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">Nome completo</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="João Silva"
                  required
                />
              </div>
              <div>
                <label className="label">Telefone / WhatsApp</label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="(67) 99999-0000"
                  required
                />
              </div>
              <div>
                <label className="label">CEP de instalação</label>
                <input
                  className="input"
                  value={form.cep}
                  onChange={(e) => setForm((p) => ({ ...p, cep: e.target.value }))}
                  placeholder="79000-000"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button type="submit" disabled={loading} className="btn-success w-full py-3">
                {loading ? 'Enviando...' : '✓ Quero ser contactado'}
              </button>
              <p className="text-xs text-center text-slate-400">
                Seus dados são enviados apenas ao provedor escolhido.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

'use client'
// components/CTALoginCard.tsx
import Link from 'next/link'
import { useEffect } from 'react'

export function CTALoginCard({ hiddenCount = 0 }: { hiddenCount?: number }) {
  useEffect(() => {
    // Track CTA shown
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'CTA_LOGIN_SHOWN', payload: { hiddenCount } }),
    }).catch(() => {})
  }, [hiddenCount])

  return (
    <div className="card p-6 border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white">
      {hiddenCount > 0 && (
        <p className="text-sm text-center text-slate-500 mb-4 font-medium">
          + {hiddenCount} plano{hiddenCount > 1 ? 's' : ''} disponíve{hiddenCount > 1 ? 'is' : 'l'}...
        </p>
      )}
      <div className="text-center">
        <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="font-bold text-slate-900 mb-3">🔒 Cadastre-se grátis para desbloquear:</p>
        <ul className="text-sm text-slate-600 space-y-2 text-left max-w-xs mx-auto mb-5">
          {[
            ['🚀', 'Todos os planos e velocidades'],
            ['🎯', 'Questionário de recomendação personalizada'],
            ['⭐', 'Avaliações e comparação detalhada'],
            ['🔔', 'Alertas de preço e promoções'],
            ['❤️', 'Favoritar planos e histórico de buscas'],
          ].map(([icon, text]) => (
            <li key={text} className="flex items-center gap-2">
              <span>{icon}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-400 mb-4">Gratuito · Sem cartão de crédito · 30 segundos</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/auth/cadastro" className="btn-primary">Criar conta grátis</Link>
          <Link href="/auth/login" className="btn-secondary">Já tenho conta</Link>
        </div>
      </div>
    </div>
  )
}

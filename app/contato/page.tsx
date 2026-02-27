'use client'
// app/contato/page.tsx
import { useState } from 'react'
import { Navbar } from '@/components/Navbar'

export default function ContatoPage() {
  const [sent, setSent] = useState(false)

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Contato</h1>
          <p className="text-slate-500 mt-1">Entre em contato com nossa equipe</p>
        </div>
        {sent ? (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-slate-900">Mensagem enviada!</p>
            <p className="text-sm text-slate-500 mt-1">Responderemos em breve.</p>
          </div>
        ) : (
          <div className="card p-8">
            <div className="space-y-4">
              <div>
                <label className="label">Seu nome</label>
                <input type="text" className="input" placeholder="João Silva" />
              </div>
              <div>
                <label className="label">E-mail</label>
                <input type="email" className="input" placeholder="joao@email.com" />
              </div>
              <div>
                <label className="label">Assunto</label>
                <input type="text" className="input" placeholder="Dúvida sobre plano" />
              </div>
              <div>
                <label className="label">Mensagem</label>
                <textarea className="input resize-none h-32" placeholder="Escreva sua mensagem..." />
              </div>
              <button onClick={() => setSent(true)} className="btn-primary w-full py-3">
                Enviar mensagem
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

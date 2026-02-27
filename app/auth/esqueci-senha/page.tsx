'use client'
// app/auth/esqueci-senha/page.tsx
import { useState } from 'react'
import Link from 'next/link'

type Step = 'form' | 'sent'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Digite seu e-mail'); return }
    setLoading(true)
    setError('')

    // Simula envio (implemente o e-mail real conectando ao seu serviço de e-mail)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setStep('sent')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-brand-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-brand-600">ConectaCG.net</span>
          </Link>
        </div>

        <div className="card p-8">
          {step === 'form' ? (
            <>
              {/* Ícone */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>

              <h1 className="text-xl font-bold text-slate-900 text-center mb-1">Esqueceu sua senha?</h1>
              <p className="text-sm text-slate-500 text-center mb-6">
                Digite seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="label">E-mail cadastrado</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="input pl-9"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : 'Enviar link de redefinição'}
                </button>
              </form>
            </>
          ) : (
            /* Tela de confirmação */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-accent-50 border border-accent-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">E-mail enviado!</h2>
              <p className="text-sm text-slate-500 mb-1">
                Se o endereço <strong>{email}</strong> estiver cadastrado,
              </p>
              <p className="text-sm text-slate-500 mb-6">
                você receberá um link para redefinir sua senha em instantes.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-left mb-6">
                <p className="text-xs font-semibold text-slate-600 mb-2">Não recebeu o e-mail?</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Verifique sua pasta de spam ou lixo eletrônico</li>
                  <li>• Aguarde alguns minutos e recarregue sua caixa de entrada</li>
                  <li>• Certifique-se de que digitou o e-mail correto</li>
                </ul>
              </div>

              <button
                onClick={() => { setStep('form'); setEmail('') }}
                className="btn-secondary w-full mb-3"
              >
                Tentar com outro e-mail
              </button>
              <Link href="/auth/login" className="btn-primary w-full block text-center">
                Voltar para o login
              </Link>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Lembrou a senha?{' '}
              <Link href="/auth/login" className="text-brand-500 font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} ConectaCG.net · Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}

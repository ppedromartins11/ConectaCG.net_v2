'use client'
// app/avaliacoes/page.tsx
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function AvaliacoesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Avaliações</h1>
          <p className="text-slate-500 mt-1">Veja o que outros usuários estão dizendo sobre os planos</p>
        </div>
        <div className="card p-8 text-center">
          <p className="text-slate-500">Para ver avaliações específicas, acesse os detalhes de cada plano.</p>
          <Link href="/planos" className="btn-primary mt-4 inline-flex">Ver planos</Link>
        </div>
      </main>
    </div>
  )
}

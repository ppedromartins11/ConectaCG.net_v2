'use client'
// app/page.tsx
import { Navbar } from '@/components/Navbar'
import { SearchSection } from './SearchSection'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SearchSection />
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} ConectaCG.net — Todos os direitos reservados.{' '}
        <a href="#" className="hover:text-brand-500">Termos de uso</a> ·{' '}
        <a href="#" className="hover:text-brand-500">Contato</a>
      </div>
    </footer>
  )
}

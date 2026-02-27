'use client'
// components/Navbar.tsx
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-lg">ConectaCG<span className="text-brand-500">.net</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">Home</Link>
            <Link href="/planos" className="text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">Planos</Link>
            {session && (
              <>
                <Link href="/personalizar" className="text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">Personalizar</Link>
                <Link href="/favoritos" className="text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">Favoritos</Link>
              </>
            )}
            <Link href="/contato" className="text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">Contato</Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
                    {session.user?.name?.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{session.user?.name?.split(' ')[0]}</span>
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                    <Link href="/perfil" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      👤 Meu perfil
                    </Link>
                    <Link href="/favoritos" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      ❤️ Favoritos
                    </Link>
                    <Link href="/personalizar" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      🎯 Personalizar
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary text-xs px-4 py-2">Entrar</Link>
                <Link href="/auth/cadastro" className="btn-primary text-xs px-4 py-2">Cadastrar</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-1">
            {[
              { href: '/', label: 'Home' },
              { href: '/planos', label: 'Planos' },
              ...(session ? [
                { href: '/personalizar', label: '🎯 Personalizar' },
                { href: '/favoritos', label: '❤️ Favoritos' },
                { href: '/perfil', label: '👤 Meu Perfil' },
              ] : []),
              { href: '/contato', label: 'Contato' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-2 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3 border-t border-slate-100 mt-2">
              {session ? (
                <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-secondary text-xs flex-1">Sair</button>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-secondary text-xs flex-1 text-center" onClick={() => setMenuOpen(false)}>Entrar</Link>
                  <Link href="/auth/cadastro" className="btn-primary text-xs flex-1 text-center" onClick={() => setMenuOpen(false)}>Cadastrar</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

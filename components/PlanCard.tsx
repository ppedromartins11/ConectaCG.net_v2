'use client'
// components/PlanCard.tsx
import Link from 'next/link'
import { ProviderLogo } from './ProviderLogo'
import { StarRating } from './StarRating'
import { FavoriteButton } from './FavoriteButton'
import { PromotionBadge } from './PromotionBadge'

interface Plan {
  id: string
  name: string
  downloadSpeed: number | null
  uploadSpeed: number | null
  price: number
  fidelidade: number
  isSponsored: boolean
  promotionPrice?: number | null
  promotionExpiresAt?: string | null
  promotionLabel?: string | null
  categorias: string[]
  provider: { name: string; color?: string | null }
  _count?: { reviews: number }
  reviewCount?: number
  avgRating?: number
  isFavorited?: boolean
  compatibilityScore?: number
  _masked?: boolean
}

const categoryColors: Record<string, string> = {
  Gaming: 'bg-purple-100 text-purple-700',
  Streaming: 'bg-red-100 text-red-700',
  Trabalho: 'bg-blue-100 text-blue-700',
}

export function PlanCard({ plan, onHireClick }: { plan: Plan; onHireClick?: (planId: string) => void }) {
  const hasPromotion = plan.promotionPrice && plan.promotionExpiresAt
  const displayPrice = hasPromotion ? plan.promotionPrice! : plan.price
  const reviewCount = plan.reviewCount ?? plan._count?.reviews ?? 0

  const handleClick = async () => {
    // fire-and-forget click tracking
    fetch(`/api/plans/${plan.id}/click`, { method: 'POST' }).catch(() => {})
  }

  return (
    <div
      className={`card p-5 hover:shadow-md transition-all duration-200 ${
        plan.isSponsored ? 'ring-2 ring-brand-400 bg-brand-50/30' : ''
      }`}
    >
      {/* Top badges row */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {plan.isSponsored && (
            <span className="badge bg-brand-100 text-brand-700 text-xs">★ Destaque</span>
          )}
          {plan.compatibilityScore !== undefined && plan.compatibilityScore > 70 && (
            <span className="badge bg-accent-100 text-accent-700 text-xs">✅ Ideal para você</span>
          )}
        </div>
        {hasPromotion && (
          <PromotionBadge expiresAt={plan.promotionExpiresAt!} label={plan.promotionLabel} />
        )}
      </div>

      <div className="flex items-start gap-4">
        <ProviderLogo name={plan.provider.name} />

        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 font-medium">{plan.provider.name}</p>
          <h3 className="font-bold text-slate-900 text-base leading-tight mt-0.5">{plan.name}</h3>

          {plan.avgRating !== undefined && reviewCount > 0 && (
            <div className="mt-1">
              <StarRating rating={plan.avgRating} count={reviewCount} />
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mt-2">
            {plan.categorias.slice(0, 2).map((cat) => (
              <span key={cat} className={`badge text-xs ${categoryColors[cat] || 'bg-slate-100 text-slate-600'}`}>
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Speed or masked */}
        <div className="text-right flex-shrink-0">
          {plan._masked ? (
            <div className="text-right">
              <p className="text-xs text-slate-400">Velocidade</p>
              <div className="mt-1 h-6 w-16 bg-slate-200 rounded blur-sm select-none" title="Faça login para ver" />
              <p className="text-xs text-slate-400 mt-1">🔒 Login</p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500">Download</p>
              <p className="font-bold text-slate-900 text-lg">{plan.downloadSpeed} <span className="text-xs font-normal">MB</span></p>
              <p className="text-xs text-slate-400">↑{plan.uploadSpeed} MB</p>
            </div>
          )}
        </div>

        <FavoriteButton planId={plan.id} initialFavorited={plan.isFavorited} size="sm" />
      </div>

      {/* Price and actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
        <div>
          {hasPromotion && (
            <p className="text-xs text-slate-400 line-through">R$ {plan.price.toFixed(2)}</p>
          )}
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${hasPromotion ? 'text-red-600' : 'text-slate-900'}`}>
              R$ {displayPrice.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">/mês</span>
          </div>
          <p className="text-xs text-slate-400">Fidelidade {plan.fidelidade} meses</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/planos/${plan.id}`} onClick={handleClick} className="btn-secondary text-xs px-3 py-2">
            Ver detalhes
          </Link>
          <button
            onClick={() => onHireClick ? onHireClick(plan.id) : null}
            className="btn-primary text-xs px-3 py-2"
          >
            Contratar
          </button>
        </div>
      </div>
    </div>
  )
}

// components/ReviewCard.tsx
import { StarRating } from './StarRating'

interface Review {
  id: string
  nota: number
  comentario: string
  createdAt: string | Date
  user: { name: string }
}

export function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString('pt-BR', {
    year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
            {review.user.name.slice(0, 1).toUpperCase()}
          </div>
          <span className="font-semibold text-sm text-slate-900">{review.user.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.nota} />
          <span className="text-xs text-slate-400">{date}</span>
        </div>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed pl-10">{review.comentario}</p>
    </div>
  )
}

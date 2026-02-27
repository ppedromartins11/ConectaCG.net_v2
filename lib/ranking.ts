// lib/ranking.ts
import { prisma } from '@/lib/prisma'

export async function recalculateRankingScores() {
  const plans = await prisma.plan.findMany({
    include: {
      reviews: { select: { nota: true } },
      _count: { select: { clicks: true, conversions: true, favorites: true } },
    },
  })

  for (const plan of plans) {
    const avgRating =
      plan.reviews.length > 0
        ? plan.reviews.reduce((a, r) => a + r.nota, 0) / plan.reviews.length
        : 0

    // Score formula:
    // 40% reviews (avg * 10 normalized to 50)
    // 30% conversions (capped at 100)
    // 20% clicks (capped at 100)
    // 10% favorites
    const ratingScore = (avgRating / 5) * 40
    const conversionScore = Math.min(plan._count.conversions / 10, 1) * 30
    const clickScore = Math.min(plan._count.clicks / 100, 1) * 20
    const favoriteScore = Math.min(plan._count.favorites / 20, 1) * 10

    const score = ratingScore + conversionScore + clickScore + favoriteScore

    await prisma.plan.update({
      where: { id: plan.id },
      data: {
        rankingScore: score,
        viewCount: plan._count.clicks,
        conversionCount: plan._count.conversions,
      },
    })
  }
}

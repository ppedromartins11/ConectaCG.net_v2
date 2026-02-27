// app/api/plans/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { trackEvent, getIpFromRequest } from '@/lib/analytics'
import { checkAndAwardBadges } from '@/lib/badges'
import { rateLimit } from '@/lib/rateLimit'

const VISITOR_PLAN_LIMIT = 2

// Fields shown to visitors (partial)
const VISITOR_FIELDS = {
  id: true,
  name: true,
  providerId: true,
  price: true,
  fidelidade: true,
  categorias: true,
  isSponsored: true,
  sponsorPriority: true,
  promotionPrice: true,
  promotionExpiresAt: true,
  promotionLabel: true,
  rankingScore: true,
  clickCount: true,
  // BLOCKED for visitors:
  downloadSpeed: false,
  uploadSpeed: false,
  servicosInclusos: false,
  indicadoPara: false,
  capacidade: false,
}

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { limit: 30, windowMs: 60_000 })
  if (limited) return limited

  const { searchParams } = new URL(req.url)
  const cep = searchParams.get('cep')
  const category = searchParams.get('category')
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session

  const cepPrefix = cep ? cep.replace('-', '').slice(0, 5) : null

  // Build where clause
  const where: Record<string, unknown> = { isActive: true }
  if (cepPrefix) where.cepsAtendidos = { has: cepPrefix }
  if (category && category !== 'Todos') where.categorias = { has: category }

  const plans = await prisma.plan.findMany({
    where,
    include: {
      provider: { select: { id: true, name: true, color: true, slug: true } },
      _count: { select: { reviews: true, favorites: true } },
      reviews: { select: { nota: true } },
      ...(isLoggedIn && {
        favorites: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      }),
    },
    orderBy: [
      { isSponsored: 'desc' },
      { sponsorPriority: 'desc' },
      { rankingScore: 'desc' },
      { price: 'asc' },
    ],
  })

  const plansWithMeta = plans.map((plan) => {
    const avgRating =
      plan.reviews.length > 0
        ? Math.round((plan.reviews.reduce((a, r) => a + r.nota, 0) / plan.reviews.length) * 10) / 10
        : 0

    // Check if promotion is still valid
    const hasActivePromotion =
      plan.promotionPrice !== null &&
      plan.promotionExpiresAt !== null &&
      new Date(plan.promotionExpiresAt) > new Date()

    const base = {
      id: plan.id,
      name: plan.name,
      provider: plan.provider,
      price: plan.price,
      fidelidade: plan.fidelidade,
      categorias: plan.categorias,
      isSponsored: plan.isSponsored,
      promotionPrice: hasActivePromotion ? plan.promotionPrice : null,
      promotionExpiresAt: hasActivePromotion ? plan.promotionExpiresAt : null,
      promotionLabel: hasActivePromotion ? plan.promotionLabel : null,
      rankingScore: plan.rankingScore,
      clickCount: plan.clickCount,
      avgRating,
      reviewCount: plan._count.reviews,
      favoriteCount: plan._count.favorites,
    }

    if (isLoggedIn) {
      return {
        ...base,
        downloadSpeed: plan.downloadSpeed,
        uploadSpeed: plan.uploadSpeed,
        servicosInclusos: plan.servicosInclusos,
        indicadoPara: plan.indicadoPara,
        capacidade: plan.capacidade,
        isFavorited: (plan as any).favorites?.length > 0,
      }
    }

    // Visitor: masked fields
    return {
      ...base,
      downloadSpeed: null,   // masked
      uploadSpeed: null,
      servicosInclusos: [],
      indicadoPara: [],
      capacidade: null,
      isFavorited: false,
      _masked: true,
    }
  })

  // Track search event
  if (cepPrefix) {
    await trackEvent({
      type: 'CEP_SEARCHED',
      userId: session?.user?.id ?? null,
      ip: getIpFromRequest(req),
      payload: { cep: cepPrefix, resultsCount: plansWithMeta.length },
    })

    // Save search history for logged-in users
    if (isLoggedIn) {
      await prisma.searchHistory.create({
        data: {
          userId: session.user.id,
          cep: cepPrefix,
          resultsCount: plansWithMeta.length,
        },
      })
      await checkAndAwardBadges(session.user.id)
    }
  }

  const visiblePlans = isLoggedIn ? plansWithMeta : plansWithMeta.slice(0, VISITOR_PLAN_LIMIT)
  const hiddenCount = isLoggedIn ? 0 : Math.max(0, plansWithMeta.length - VISITOR_PLAN_LIMIT)

  return NextResponse.json({
    plans: visiblePlans,
    total: plansWithMeta.length,
    hiddenCount,
    isLoggedIn,
  })
}

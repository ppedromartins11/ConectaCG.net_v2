export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { trackEvent, getIpFromRequest } from '@/lib/analytics'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session

  const plan = await prisma.plan.findUnique({
    where: { id, isActive: true },
    include: {
      provider: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: isLoggedIn ? 50 : 1,
      },
      _count: { select: { reviews: true, favorites: true } },
      ...(isLoggedIn && {
        favorites: { where: { userId: session.user.id }, select: { id: true } },
      }),
    },
  })

  if (!plan) return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })

  await prisma.plan.update({ where: { id: plan.id }, data: { viewCount: { increment: 1 } } })

  const avgRating =
    plan.reviews.length > 0
      ? Math.round((plan.reviews.reduce((a, r) => a + r.nota, 0) / plan.reviews.length) * 10) / 10
      : 0

  const hasActivePromotion =
    plan.promotionPrice !== null &&
    plan.promotionExpiresAt !== null &&
    new Date(plan.promotionExpiresAt) > new Date()

  const comparePlans = await prisma.plan.findMany({
    where: { id: { not: plan.id }, categorias: { hasSome: plan.categorias }, isActive: true },
    include: {
      provider: { select: { name: true, color: true } },
      reviews: { select: { nota: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { rankingScore: 'desc' },
    take: 2,
  })

  await trackEvent({
    type: 'PLAN_DETAIL_OPENED',
    userId: session?.user?.id ?? null,
    ip: getIpFromRequest(req),
    payload: { planId: plan.id, planName: plan.name },
  })

  const planData = {
    ...plan,
    avgRating,
    reviewCount: plan._count.reviews,
    favoriteCount: plan._count.favorites,
    isFavorited: isLoggedIn && (plan as any).favorites?.length > 0,
    promotionPrice: hasActivePromotion ? plan.promotionPrice : null,
    promotionExpiresAt: hasActivePromotion ? plan.promotionExpiresAt : null,
    promotionLabel: hasActivePromotion ? plan.promotionLabel : null,
    ...(!isLoggedIn && {
      servicosInclusos: plan.servicosInclusos.slice(0, 1),
      reviews: plan.reviews.slice(0, 1),
      _masked: true,
    }),
  }

  return NextResponse.json({
    plan: planData,
    comparePlans: isLoggedIn
      ? comparePlans.map((cp) => ({
          ...cp,
          avgRating:
            cp.reviews.length > 0
              ? Math.round((cp.reviews.reduce((a, r) => a + r.nota, 0) / cp.reviews.length) * 10) / 10
              : 0,
          reviews: undefined,
        }))
      : [],
    isLoggedIn,
  })
}

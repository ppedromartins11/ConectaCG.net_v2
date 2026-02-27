// app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { trackEvent, getIpFromRequest } from '@/lib/analytics'
import { checkAndAwardBadges } from '@/lib/badges'
import { z } from 'zod'

const schema = z.object({ planId: z.string() })

// GET - list user favorites
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      plan: {
        include: {
          provider: { select: { name: true, color: true } },
          reviews: { select: { nota: true } },
          _count: { select: { reviews: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const favoritesWithMeta = favorites.map((f) => ({
    ...f,
    plan: {
      ...f.plan,
      avgRating:
        f.plan.reviews.length > 0
          ? Math.round((f.plan.reviews.reduce((a, r) => a + r.nota, 0) / f.plan.reviews.length) * 10) / 10
          : 0,
      reviews: undefined,
    },
  }))

  return NextResponse.json({ favorites: favoritesWithMeta })
}

// POST - add favorite
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Faça login para favoritar' }, { status: 401 })

  try {
    const body = await req.json()
    const { planId } = schema.parse(body)

    const favorite = await prisma.favorite.upsert({
      where: { userId_planId: { userId: session.user.id, planId } },
      update: {},
      create: { userId: session.user.id, planId },
    })

    await trackEvent({
      type: 'FAVORITE_ADDED',
      userId: session.user.id,
      ip: getIpFromRequest(req),
      payload: { planId },
    })

    await checkAndAwardBadges(session.user.id)

    return NextResponse.json({ favorite }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - remove favorite
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const planId = searchParams.get('planId')
    if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 })

    await prisma.favorite.deleteMany({
      where: { userId: session.user.id, planId },
    })

    await trackEvent({
      type: 'FAVORITE_REMOVED',
      userId: session.user.id,
      ip: getIpFromRequest(req),
      payload: { planId },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

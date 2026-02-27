export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { trackEvent, getIpFromRequest } from '@/lib/analytics'
import { checkAndAwardBadges } from '@/lib/badges'
import { z } from 'zod'

const schema = z.object({
  nota: z.number().int().min(1).max(5),
  comentario: z.string().min(5, 'Comentário muito curto').max(500),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Faça login para avaliar' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const existing = await prisma.review.findUnique({
      where: { userId_planId: { userId: session.user.id, planId: id } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Você já avaliou este plano' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: { userId: session.user.id, planId: id, nota: data.nota, comentario: data.comentario },
      include: { user: { select: { name: true } } },
    })

    await trackEvent({
      type: 'REVIEW_PUBLISHED',
      userId: session.user.id,
      ip: getIpFromRequest(req),
      payload: { planId: id, nota: data.nota },
    })

    await checkAndAwardBadges(session.user.id)

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// app/api/alerts/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { trackEvent, getIpFromRequest } from '@/lib/analytics'
import { z } from 'zod'

const schema = z.object({
  cep: z.string().min(5).max(9),
  maxPrice: z.number().positive(),
  minSpeed: z.number().int().positive().optional(),
  planId: z.string().optional(),
})

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: session.user.id },
    include: { plan: { select: { name: true, price: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ alerts })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Faça login para criar alertas' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    // Max 5 active alerts per user
    const count = await prisma.priceAlert.count({
      where: { userId: session.user.id, isActive: true },
    })
    if (count >= 5) {
      return NextResponse.json({ error: 'Limite de 5 alertas ativos atingido' }, { status: 400 })
    }

    const alert = await prisma.priceAlert.create({
      data: {
        userId: session.user.id,
        cep: data.cep.replace('-', '').slice(0, 5),
        maxPrice: data.maxPrice,
        minSpeed: data.minSpeed,
        planId: data.planId,
      },
    })

    await trackEvent({
      type: 'ALERT_CREATED',
      userId: session.user.id,
      ip: getIpFromRequest(req),
      payload: { cep: data.cep, maxPrice: data.maxPrice },
    })

    return NextResponse.json({ alert }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const alertId = searchParams.get('id')
  if (!alertId) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await prisma.priceAlert.deleteMany({
    where: { id: alertId, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}
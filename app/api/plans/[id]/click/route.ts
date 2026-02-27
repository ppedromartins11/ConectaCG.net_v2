export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { trackEvent, getIpFromRequest } from '@/lib/analytics'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const body = await req.json().catch(() => ({}))

  await prisma.planClick.create({
    data: {
      planId: id,
      userId: session?.user?.id ?? null,
      sessionId: body.sessionId ?? null,
      ip: getIpFromRequest(req),
    },
  })

  await prisma.plan.update({
    where: { id },
    data: { clickCount: { increment: 1 } },
  })

  await trackEvent({
    type: 'PLAN_CLICKED',
    userId: session?.user?.id ?? null,
    ip: getIpFromRequest(req),
    payload: { planId: id },
  })

  return NextResponse.json({ success: true })
}

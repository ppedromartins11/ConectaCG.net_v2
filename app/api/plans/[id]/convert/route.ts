export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { trackEvent, getIpFromRequest } from '@/lib/analytics'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8).max(20),
  cep: z.string().min(5),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const lead = await prisma.lead.create({
      data: {
        planId: id,
        userId: session?.user?.id ?? null,
        name: data.name,
        phone: data.phone,
        cep: data.cep,
      },
    })

    await prisma.planConversion.create({
      data: { planId: id, userId: session?.user?.id ?? null },
    })

    await prisma.plan.update({
      where: { id },
      data: { conversionCount: { increment: 1 } },
    })

    await trackEvent({
      type: 'LEAD_CAPTURED',
      userId: session?.user?.id ?? null,
      ip: getIpFromRequest(req),
      payload: { planId: id, leadId: lead.id },
    })

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

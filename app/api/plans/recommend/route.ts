// app/api/plans/recommend/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { trackEvent, getIpFromRequest } from '@/lib/analytics'
import { z } from 'zod'

const schema = z.object({
  pessoas: z.number().int().min(1).max(20),
  dispositivos: z.array(z.string()),
  atividades: z.array(z.string()),
  velocidadeAtual: z.number().int().positive().optional(),
})

function scoreplan(
  plan: { downloadSpeed: number; uploadSpeed: number; price: number; categorias: string[] },
  atividades: string[],
  pessoas: number
): number {
  let score = 0

  const activitiesMap: Record<string, { category: string; minSpeed: number; uploadWeight: boolean }> = {
    Gaming: { category: 'Gaming', minSpeed: 300, uploadWeight: true },
    Streaming: { category: 'Streaming', minSpeed: 200, uploadWeight: false },
    'Home Office': { category: 'Trabalho', minSpeed: 150, uploadWeight: true },
    Estudos: { category: 'Trabalho', minSpeed: 100, uploadWeight: false },
    'Redes Sociais': { category: 'Streaming', minSpeed: 50, uploadWeight: false },
  }

  for (const activity of atividades) {
    const config = activitiesMap[activity]
    if (!config) continue

    if (plan.downloadSpeed >= config.minSpeed * 1.5) score += 25
    else if (plan.downloadSpeed >= config.minSpeed) score += 15
    else score += 5

    if (config.uploadWeight && plan.uploadSpeed >= config.minSpeed * 0.5) score += 10

    if (plan.categorias.includes(config.category)) score += 20
  }

  // Speed per person
  const speedPerPerson = plan.downloadSpeed / pessoas
  if (speedPerPerson >= 100) score += 20
  else if (speedPerPerson >= 50) score += 12
  else score += 3

  // Price efficiency (speed per real)
  const efficiency = plan.downloadSpeed / plan.price
  if (efficiency >= 4) score += 15
  else if (efficiency >= 2.5) score += 10
  else score += 4

  return score
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    // Upsert user profile
    await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        pessoas: data.pessoas,
        dispositivos: data.dispositivos,
        atividades: data.atividades,
        velocidadeAtual: data.velocidadeAtual,
      },
      create: {
        userId: session.user.id,
        pessoas: data.pessoas,
        dispositivos: data.dispositivos,
        atividades: data.atividades,
        velocidadeAtual: data.velocidadeAtual,
      },
    })

    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      include: {
        provider: { select: { name: true, color: true, slug: true } },
        _count: { select: { reviews: true } },
        reviews: { select: { nota: true } },
        favorites: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    })

    const scoredPlans = plans.map((plan) => ({
      ...plan,
      avgRating:
        plan.reviews.length > 0
          ? Math.round((plan.reviews.reduce((a, r) => a + r.nota, 0) / plan.reviews.length) * 10) / 10
          : 0,
      isFavorited: plan.favorites.length > 0,
      compatibilityScore: scoreplan(plan, data.atividades, data.pessoas),
      reviews: undefined,
      favorites: undefined,
    }))

    scoredPlans.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

    await trackEvent({
      type: 'QUESTIONNAIRE_COMPLETED',
      userId: session.user.id,
      ip: getIpFromRequest(req),
      payload: { atividades: data.atividades, pessoas: data.pessoas },
    })

    return NextResponse.json({ plans: scoredPlans })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

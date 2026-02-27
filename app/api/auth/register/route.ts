// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trackEvent } from '@/lib/analytics'
import { checkAndAwardBadges } from '@/lib/badges'
import { rateLimit } from '@/lib/rateLimit'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido').toLowerCase(),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  address: z.string().optional(),
  referralCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, windowMs: 60_000 })
  if (limited) return limited

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email,
        password: hashedPassword,
        address: data.address?.trim(),
      },
    })

    // Handle referral
    if (data.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { id: data.referralCode },
      })
      if (referrer && referrer.id !== user.id) {
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referredId: user.id,
            status: 'COMPLETED',
          },
        })
        await checkAndAwardBadges(referrer.id)
      }
    }

    // Track event
    await trackEvent({
      type: 'SIGNUP_COMPLETED',
      userId: user.id,
      ip: req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent'),
      payload: { email: user.email },
    })

    // Award early adopter badge
    await checkAndAwardBadges(user.id)

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('[REGISTER]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// lib/analytics.ts
import { prisma } from '@/lib/prisma'
import { EventType, Prisma } from '@prisma/client'

interface TrackEventParams {
  type: EventType
  userId?: string | null
  sessionId?: string | null
  payload?: Record<string, unknown>
  ip?: string | null
  userAgent?: string | null
}

export async function trackEvent(params: TrackEventParams) {
  try {
    await prisma.event.create({
      data: {
        type: params.type,
        userId: params.userId ?? null,
        sessionId: params.sessionId ?? null,
        payload: (params.payload ?? {}) as Prisma.InputJsonValue,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null,
      },
    })
  } catch {
    // analytics never break the app
  }
}

export function getIpFromRequest(req: Request): string | null {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return null
}

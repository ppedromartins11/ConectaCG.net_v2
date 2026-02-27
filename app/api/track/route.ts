// app/api/track/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { trackEvent, getIpFromRequest } from '@/lib/analytics'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EventType } from '@prisma/client'
import { z } from 'zod'

const ALLOWED_CLIENT_EVENTS: EventType[] = [
  'PAGE_VIEW',
  'PLAN_VIEWED',
  'COMPARISON_STARTED',
  'CTA_LOGIN_SHOWN',
  'SIGNUP_STARTED',
  'HIRE_CLICKED',
]

const schema = z.object({
  type: z.string(),
  payload: z.record(z.unknown()).optional(),
  sessionId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const data = schema.parse(body)

    // Only allow safe client-side events
    if (!ALLOWED_CLIENT_EVENTS.includes(data.type as EventType)) {
      return NextResponse.json({ error: 'Event type not allowed' }, { status: 400 })
    }

    await trackEvent({
      type: data.type as EventType,
      userId: session?.user?.id ?? null,
      sessionId: data.sessionId ?? null,
      payload: data.payload,
      ip: getIpFromRequest(req),
      userAgent: req.headers.get('user-agent'),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}

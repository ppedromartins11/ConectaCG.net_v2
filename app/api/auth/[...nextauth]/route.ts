// app/api/auth/[...nextauth]/route.ts
export const dynamic = 'force-dynamic'

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export const GET = handler
export const POST = handler

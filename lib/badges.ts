// lib/badges.ts
import { prisma } from '@/lib/prisma'
import { BadgeSlug } from '@prisma/client'

export async function checkAndAwardBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      reviews: true,
      favorites: true,
      badges: true,
      referralsMade: true,
      searchHistory: true,
    },
  })
  if (!user) return

  const existingBadges = new Set(user.badges.map((b) => b.slug))

  const toAward: BadgeSlug[] = []

  // EXPLORER: first search
  if (!existingBadges.has('EXPLORER') && user.searchHistory.length >= 1) {
    toAward.push('EXPLORER')
  }

  // EARLY_ADOPTER: one of first 100 users
  const userCount = await prisma.user.count()
  if (!existingBadges.has('EARLY_ADOPTER') && userCount <= 100) {
    toAward.push('EARLY_ADOPTER')
  }

  // REVIEWER: first review
  if (!existingBadges.has('REVIEWER') && user.reviews.length >= 1) {
    toAward.push('REVIEWER')
  }

  // SPECIALIST: 3+ favorites
  if (!existingBadges.has('SPECIALIST') && user.favorites.length >= 3) {
    toAward.push('SPECIALIST')
  }

  // AMBASSADOR: referred someone
  if (!existingBadges.has('AMBASSADOR') && user.referralsMade.length >= 1) {
    toAward.push('AMBASSADOR')
  }

  if (toAward.length > 0) {
    await prisma.userBadge.createMany({
      data: toAward.map((slug) => ({ userId, slug })),
      skipDuplicates: true,
    })
  }

  return toAward
}

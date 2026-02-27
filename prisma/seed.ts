// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Providers
  const claro = await prisma.provider.upsert({
    where: { slug: 'claro' },
    update: {},
    create: { id: 'claro', name: 'Claro', logo: '/logos/claro.svg', color: '#E02020', slug: 'claro' },
  })
  const technet = await prisma.provider.upsert({
    where: { slug: 'technet' },
    update: {},
    create: { id: 'technet', name: 'TechNet', logo: '/logos/technet.svg', color: '#2563EB', slug: 'technet' },
  })
  const vivo = await prisma.provider.upsert({
    where: { slug: 'vivo' },
    update: {},
    create: { id: 'vivo', name: 'Vivo', logo: '/logos/vivo.svg', color: '#6D28D9', slug: 'vivo' },
  })

  // Plans
  const tomorrow = new Date(Date.now() + 86400000 * 7)
  const plansData = [
    {
      id: 'plan-claro-500',
      name: 'Fibra Premium 500MB',
      providerId: claro.id,
      downloadSpeed: 500, uploadSpeed: 250, price: 109.90, fidelidade: 12,
      capacidade: 'Ilimitado',
      servicosInclusos: ['Roteador Wi-Fi incluído', 'Suporte 24h', 'Instalação grátis'],
      indicadoPara: ['Gaming', 'Streaming', 'Home Office'],
      categorias: ['Gaming', 'Streaming', 'Trabalho'],
      isSponsored: true, sponsorPriority: 10,
      promotionPrice: 89.90, promotionExpiresAt: tomorrow, promotionLabel: 'Black Friday',
      cepsAtendidos: ['01310', '01311', '04530', '20040', '79000', '79001', '79002'],
      rankingScore: 85,
    },
    {
      id: 'plan-technet-300',
      name: 'Fibra Ultra 300MB',
      providerId: technet.id,
      downloadSpeed: 300, uploadSpeed: 150, price: 89.90, fidelidade: 12,
      capacidade: 'Ilimitado',
      servicosInclusos: ['Roteador Wi-Fi incluído', 'Suporte 24h'],
      indicadoPara: ['Streaming', 'Home Office'],
      categorias: ['Streaming', 'Trabalho'],
      isSponsored: false, sponsorPriority: 0,
      cepsAtendidos: ['01310', '01311', '04530', '20040', '79000', '79001'],
      rankingScore: 72,
    },
    {
      id: 'plan-technet-200',
      name: 'Plano Básico 200MB',
      providerId: technet.id,
      downloadSpeed: 200, uploadSpeed: 100, price: 79.90, fidelidade: 12,
      capacidade: 'Ilimitado',
      servicosInclusos: ['Suporte comercial'],
      indicadoPara: ['Redes Sociais', 'Estudos'],
      categorias: ['Trabalho'],
      isSponsored: false, sponsorPriority: 0,
      cepsAtendidos: ['01310', '04530', '20040', '79000', '79002', '79003'],
      rankingScore: 55,
    },
    {
      id: 'plan-vivo-600',
      name: 'Vivo Fibra Gamer 600MB',
      providerId: vivo.id,
      downloadSpeed: 600, uploadSpeed: 300, price: 129.90, fidelidade: 12,
      capacidade: 'Ilimitado',
      servicosInclusos: ['IP fixo', 'Roteador Gaming', 'Suporte 24h', 'Instalação grátis'],
      indicadoPara: ['Gaming', 'Streaming'],
      categorias: ['Gaming', 'Streaming'],
      isSponsored: true, sponsorPriority: 8,
      cepsAtendidos: ['01310', '04530', '20040', '79000', '79001', '79002'],
      rankingScore: 78,
    },
    {
      id: 'plan-vivo-150',
      name: 'Vivo Home 150MB',
      providerId: vivo.id,
      downloadSpeed: 150, uploadSpeed: 75, price: 69.90, fidelidade: 12,
      capacidade: 'Ilimitado',
      servicosInclusos: ['Suporte comercial'],
      indicadoPara: ['Redes Sociais', 'Estudos'],
      categorias: ['Trabalho'],
      isSponsored: false, sponsorPriority: 0,
      cepsAtendidos: ['01310', '04530', '20040', '79000', '79001', '79002', '79003', '79004'],
      rankingScore: 48,
    },
    {
      id: 'plan-claro-400',
      name: 'Claro Streaming 400MB',
      providerId: claro.id,
      downloadSpeed: 400, uploadSpeed: 200, price: 99.90, fidelidade: 12,
      capacidade: 'Ilimitado',
      servicosInclusos: ['Globoplay incluído', 'Roteador Wi-Fi', 'Suporte 24h'],
      indicadoPara: ['Streaming', 'Home Office'],
      categorias: ['Streaming', 'Trabalho'],
      isSponsored: false, sponsorPriority: 0,
      cepsAtendidos: ['01310', '04530', '20040', '79000', '79001', '79002', '79003'],
      rankingScore: 68,
    },
  ]

  for (const plan of plansData) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    })
  }

  // Users
  const hash = await bcrypt.hash('senha123', 12)
  const usersData = [
    { id: 'user-joao', name: 'João S.', email: 'joao@email.com', address: '01310-000' },
    { id: 'user-maria', name: 'Maria T.', email: 'maria@email.com', address: '04530-000' },
    { id: 'user-pedro', name: 'Pedro M.', email: 'pedro@email.com', address: '79000-000' },
    { id: 'user-marcos', name: 'Marcos', email: 'marcos@email.com', address: '01310-000' },
    { id: 'user-paula', name: 'Paula W.', email: 'paula@email.com', address: '04530-000' },
  ]

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: hash },
    })
  }

  // Reviews
  const reviews = [
    { userId: 'user-joao', planId: 'plan-claro-500', nota: 5, comentario: 'Internet excelente, nunca cai no home office!' },
    { userId: 'user-maria', planId: 'plan-claro-500', nota: 4, comentario: 'Boa velocidade, suporte rápido.' },
    { userId: 'user-pedro', planId: 'plan-claro-500', nota: 5, comentario: 'Perfeita para gaming, sem lag.' },
    { userId: 'user-marcos', planId: 'plan-technet-300', nota: 4, comentario: 'Custo-benefício ótimo.' },
    { userId: 'user-paula', planId: 'plan-technet-300', nota: 4, comentario: 'Velocidade estável, recomendo.' },
    { userId: 'user-joao', planId: 'plan-technet-200', nota: 3, comentario: 'Funciona para uso básico.' },
    { userId: 'user-maria', planId: 'plan-vivo-600', nota: 5, comentario: 'Incrível para gaming!' },
    { userId: 'user-pedro', planId: 'plan-vivo-600', nota: 5, comentario: 'Melhor plano para games.' },
    { userId: 'user-marcos', planId: 'plan-vivo-150', nota: 3, comentario: 'Suficiente para uso casual.' },
    { userId: 'user-paula', planId: 'plan-claro-400', nota: 5, comentario: 'Globoplay incluso é ótimo!' },
  ]

  for (const r of reviews) {
    await prisma.review.upsert({
      where: { userId_planId: { userId: r.userId, planId: r.planId } },
      update: {},
      create: r,
    })
  }

  // Badges
  await prisma.userBadge.createMany({
    skipDuplicates: true,
    data: [
      { userId: 'user-joao', slug: 'EXPLORER' },
      { userId: 'user-joao', slug: 'REVIEWER' },
      { userId: 'user-joao', slug: 'EARLY_ADOPTER' },
      { userId: 'user-maria', slug: 'EXPLORER' },
      { userId: 'user-maria', slug: 'REVIEWER' },
      { userId: 'user-pedro', slug: 'EXPLORER' },
      { userId: 'user-pedro', slug: 'EARLY_ADOPTER' },
    ],
  })

  // Price snapshots
  await prisma.priceSnapshot.createMany({
    data: plansData.map((p) => ({ planId: p.id, price: p.price })),
  })

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

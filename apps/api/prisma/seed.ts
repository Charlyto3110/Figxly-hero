import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('secret123', 10);
  const [plomeria, electricidad] = await Promise.all([
    prisma.serviceCategory.upsert({ where: { slug: 'plomeria' }, update: {}, create: { name: 'Plomería', slug: 'plomeria' } }),
    prisma.serviceCategory.upsert({ where: { slug: 'electricidad' }, update: {}, create: { name: 'Electricidad', slug: 'electricidad' } })
  ]);

  const providerUser = await prisma.user.upsert({ where: { email: 'tecnico@figxly.com' }, update: {}, create: { email: 'tecnico@figxly.com', name: 'Carlos Técnico', passwordHash: pass, role: 'provider' } });
  const customer = await prisma.user.upsert({ where: { email: 'cliente@figxly.com' }, update: {}, create: { email: 'cliente@figxly.com', name: 'Ana Cliente', passwordHash: pass, role: 'customer' } });

  const profile = await prisma.providerProfile.upsert({ where: { userId: providerUser.id }, update: {}, create: { userId: providerUser.id, bio: '10 años de experiencia', city: 'Bogotá', skills: 'Plomería, Electricidad', hourlyRate: 25 } });

  await prisma.providerService.upsert({ where: { providerId_categoryId: { providerId: profile.id, categoryId: plomeria.id } }, update: {}, create: { providerId: profile.id, categoryId: plomeria.id } });
  await prisma.providerService.upsert({ where: { providerId_categoryId: { providerId: profile.id, categoryId: electricidad.id } }, update: {}, create: { providerId: profile.id, categoryId: electricidad.id } });

  console.log('seed ready', customer.email, providerUser.email);
}
main().finally(() => prisma.$disconnect());

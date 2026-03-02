import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

const auth = async (req: any, res: any, next: any) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; role: Role };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
};

app.post('/auth/register', async (req, res) => {
  const schema = z.object({ name: z.string(), email: z.string().email(), password: z.string().min(6), role: z.nativeEnum(Role), city: z.string().optional(), bio: z.string().optional(), skills: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, email, password, role, city, bio, skills } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, role, passwordHash } });
  if (role === 'provider') {
    await prisma.providerProfile.create({ data: { userId: user.id, city: city || 'Bogotá', bio: bio || 'Técnico certificado', skills: skills || 'General' } });
  }
  res.json({ id: user.id, email: user.email, role: user.role });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'invalid_credentials' });
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true });
  res.json({ token, role: user.role });
});

app.get('/me', auth, async (req: any, res) => res.json(await prisma.user.findUnique({ where: { id: req.user.sub }, select: { id: true, role: true, name: true, email: true } })));

app.get('/services', async (_req, res) => res.json(await prisma.serviceCategory.findMany()));
app.post('/services', auth, async (req: any, res) => res.json(await prisma.serviceCategory.create({ data: req.body })));
app.get('/providers', async (_req, res) => res.json(await prisma.providerProfile.findMany({ include: { user: true, services: { include: { category: true } }, reviews: true } })));
app.get('/providers/:id', async (req, res) => res.json(await prisma.providerProfile.findUnique({ where: { id: req.params.id }, include: { user: true, services: { include: { category: true } }, reviews: true } })));
app.post('/providers', auth, async (req, res) => res.json(await prisma.providerProfile.create({ data: req.body })));

app.get('/search', async (req, res) => {
  const { service, city } = req.query;
  const providers = await prisma.providerProfile.findMany({
    where: {
      city: city ? String(city) : undefined,
      services: service ? { some: { category: { slug: String(service) } } } : undefined
    },
    include: { user: true, services: { include: { category: true } }, reviews: true }
  });
  res.json(providers);
});

app.post('/requests', auth, async (req: any, res) => res.json(await prisma.request.create({ data: { ...req.body, customerId: req.user.sub } })));
app.get('/requests', auth, async (req: any, res) => res.json(await prisma.request.findMany({ where: { customerId: req.user.sub } })));

app.get('/availability', async (req, res) => {
  const { providerId, date } = req.query;
  const day = new Date(String(date));
  const slots = [9, 10, 11, 14, 15, 16].map((h) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), h));
  const busy = await prisma.booking.findMany({ where: { providerId: String(providerId), date: { gte: new Date(day.setHours(0, 0, 0, 0)), lte: new Date(day.setHours(23, 59, 59, 999)) } } });
  res.json(slots.filter((slot) => !busy.some((b) => b.date.getTime() === slot.getTime()) && slot > new Date()));
});

app.post('/bookings', auth, async (req: any, res) => {
  const bookingDate = new Date(req.body.date);
  if (bookingDate < new Date()) return res.status(400).json({ error: 'slot_in_past' });
  const existing = await prisma.booking.findUnique({ where: { providerId_date: { providerId: req.body.providerId, date: bookingDate } } });
  if (existing) return res.status(409).json({ error: 'slot_unavailable' });
  const booking = await prisma.booking.create({ data: { ...req.body, date: bookingDate, customerId: req.user.sub, status: 'requested' } });
  res.json(booking);
});
app.get('/bookings', auth, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  const where = user?.role === 'provider' ? { providerId: req.user.sub } : { customerId: req.user.sub };
  res.json(await prisma.booking.findMany({ where, include: { category: true } }));
});
app.patch('/bookings/:id/status', auth, async (req, res) => res.json(await prisma.booking.update({ where: { id: req.params.id }, data: { status: req.body.status } })));

app.post('/reviews', auth, async (req: any, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.body.bookingId } });
  if (!booking || booking.status !== 'completed') return res.status(400).json({ error: 'booking_not_completed' });
  const provider = await prisma.providerProfile.findFirst({ where: { userId: booking.providerId } });
  if (!provider) return res.status(404).json({ error: 'provider_profile_missing' });
  res.json(await prisma.review.create({ data: { ...req.body, providerId: provider.id, customerId: req.user.sub } }));
});
app.get('/reviews', async (req, res) => res.json(await prisma.review.findMany({ where: { providerId: String(req.query.providerId) } })));

app.post('/support/tickets', auth, async (req: any, res) => res.json(await prisma.supportTicket.create({ data: { ...req.body, userId: req.user.sub } })));
app.get('/support/tickets', auth, async (req: any, res) => res.json(await prisma.supportTicket.findMany({ where: { userId: req.user.sub } })));

app.post('/payments/intent', auth, async (req, res) => res.json(await prisma.payment.upsert({ where: { bookingId: req.body.bookingId }, update: { status: 'pending' }, create: { ...req.body, provider: 'mock', status: 'pending' } })));
app.post('/payments/confirm', auth, async (req, res) => res.json(await prisma.payment.update({ where: { bookingId: req.body.bookingId }, data: { status: 'paid', externalId: `stub_${Date.now()}` } })));

app.post('/claims', auth, async (req: any, res) => res.json(await prisma.claim.create({ data: { ...req.body, customerId: req.user.sub } })));
app.get('/claims', auth, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  res.json(await prisma.claim.findMany({ where: user?.role === 'admin' ? {} : { customerId: req.user.sub } }));
});
app.patch('/claims/:id/status', auth, async (req, res) => res.json(await prisma.claim.update({ where: { id: req.params.id }, data: { status: req.body.status } })));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`API on ${PORT}`));

export { app };

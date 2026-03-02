import { renderHome } from './views/home.js';
import { renderSearch } from './views/search.js';
import { renderResults } from './views/results.js';
import { renderProfile } from './views/profile.js';
import { renderSchedule } from './views/schedule.js';
import { renderCheckout } from './views/checkout.js';
import { renderDashboard } from './views/dashboard.js';
import { renderReview } from './views/review.js';
import { renderClaims } from './views/claims.js';
import { renderAuthLogin } from './views/auth-login.js';
import { renderAuthRegister } from './views/auth-register.js';
import { renderQuote } from './views/quote.js';
import { renderAuthArea } from './components/layout.js';
import { fileToBase64, qsa, qs, toast } from './components/ui.js';
import { pros } from './data/pros.js';
import { store, uid } from './store.js';
import { calculateQuote, validateExtras } from '../modules/cost-generator/index.js';

const app = () => qs('#app');
const protectedRoutes = ['/search', '/schedule', '/checkout', '/dashboard', '/job/', '/review', '/claims'];

const parse = () => {
  const raw = (location.hash || '#/').slice(1);
  const [path, query = ''] = raw.split('?');
  return { path: path || '/', params: new URLSearchParams(query) };
};

const match = (path, pattern) => {
  const p = path.split('/'); const pp = pattern.split('/');
  if (p.length !== pp.length) return null;
  const out = {};
  for (let i = 0; i < p.length; i++) {
    if (pp[i].startsWith(':')) out[pp[i].slice(1)] = p[i];
    else if (pp[i] !== p[i]) return null;
  }
  return out;
};

function ensureAuth(path) {
  if (!protectedRoutes.some((r) => path.startsWith(r))) return true;
  if (store.getAuth().loggedIn) return true;
  store.setReturnTo(`#${location.hash.slice(1) || '/'}`);
  location.hash = '#/auth/login';
  return false;
}

function render() {
  const { path, params } = parse();
  if (!ensureAuth(path)) return;
  qs('#auth-desktop').innerHTML = renderAuthArea();
  const routes = [
    ['/', () => renderHome()],
    ['/search', () => renderSearch(params)],
    ['/results', () => renderResults(params)],
    ['/pro/:id', ({ id }) => renderProfile(id)],
    ['/schedule/:id', ({ id }) => renderSchedule(id)],
    ['/checkout/:jobId', ({ jobId }) => renderCheckout(jobId, params)],
    ['/dashboard', () => renderDashboard()],
    ['/review/:jobId', ({ jobId }) => renderReview(jobId)],
    ['/claims/:jobId', ({ jobId }) => renderClaims(jobId)],
    ['/auth/login', () => renderAuthLogin()],
    ['/auth/register', () => renderAuthRegister()],
    ['/job/:jobId/quote', ({ jobId }) => renderQuote(jobId)],
  ];
  for (const [pattern, fn] of routes) {
    const found = match(path, pattern);
    if (found) { app().innerHTML = fn(found); bind(); return; }
  }
  app().innerHTML = '<p>Ruta no encontrada.</p>';
}

async function bind() {
  qs('#search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const query = Object.fromEntries(fd.entries());
    store.setLastSearch(query);
    location.hash = `#/results?service=${encodeURIComponent(query.q || '')}`;
  });
  qsa('[data-service]').forEach((el) => el.addEventListener('click', () => location.hash = `#/search?service=${el.dataset.service}`));
  qs('#results-filters')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    location.hash = `#/results?service=${fd.get('service') || ''}&rating=${fd.get('rating') || 0}`;
  });
  qs('#request-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const files = [...(fd.getAll('photos') || [])].filter((f) => f?.size);
    const photos = await Promise.all(files.map(fileToBase64));
    store.setDraftRequest({ service: fd.get('service'), description: fd.get('description'), photos });
    location.hash = `#/results?service=${fd.get('service')}`;
  });
  qs('#schedule-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pro = pros.find((p) => p.id === e.currentTarget.dataset.proId);
    const job = { id: uid('job'), proId: pro.id, proName: pro.name, service: pro.service, date: fd.get('date'), time: fd.get('time'), status: 'pending_payment', timeline: ['ingeniero aceptó', 'técnicos aceptaron', 'en camino', 'trabajando', 'terminado'] };
    store.upsertJob(job);
    location.hash = `#/checkout/${job.id}`;
  });
  qs('#pay-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const { jobId, type } = e.currentTarget.dataset;
    const job = store.getJobs().find((j) => j.id === jobId);
    if (!job) return;
    job.status = type === 'final' ? 'paid_final' : 'paid_consultation';
    store.upsertJob(job);
    toast('Pago aplicado');
    location.hash = '#/dashboard';
  });
  qs('#role-switch')?.addEventListener('change', (e) => { store.setRole(e.target.value); render(); });
  qsa('[data-next-job]').forEach((btn) => btn.addEventListener('click', () => {
    const jobs = store.getJobs(); const job = jobs.find((j) => j.id === btn.dataset.nextJob); if (!job) return;
    const idx = job.timeline.indexOf(job.currentStep || job.timeline[0]);
    job.currentStep = job.timeline[Math.min(idx + 1, job.timeline.length - 1)];
    job.status = job.currentStep;
    store.upsertJob(job); render();
  }));
  qsa('[data-accept-job]').forEach((btn) => btn.addEventListener('click', () => {
    const job = store.getJobs().find((j) => j.id === btn.dataset.acceptJob); if (!job) return;
    job.status = 'accepted'; store.upsertJob(job); render();
  }));
  qsa('[data-provider]').forEach((btn) => btn.addEventListener('click', () => {
    store.setAuth({ loggedIn: true, token: `fake-${Date.now()}`, user: { id: uid('user'), name: `Usuario ${btn.dataset.provider}`, provider: btn.dataset.provider } });
    location.hash = store.consumeReturnTo();
  }));
  qs('#logout-btn')?.addEventListener('click', () => { store.clearAuth(); location.hash = '#/'; });
  qs('#account-btn')?.addEventListener('click', () => qs('#account-menu')?.classList.toggle('hidden'));
  qsa('[data-role]').forEach((b) => b.addEventListener('click', () => { store.setRole(b.dataset.role); toast(`Rol: ${b.dataset.role}`); }));
  qs('#review-form')?.addEventListener('submit', (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const reviews = store.getReviews(); reviews.unshift({ id: uid('review'), jobId: e.currentTarget.dataset.jobId, rating: fd.get('rating'), comment: fd.get('comment'), favorite: Boolean(fd.get('favorite')) }); store.setReviews(reviews); toast('Reseña guardada'); location.hash = '#/dashboard'; });
  qs('#claim-form')?.addEventListener('submit', async (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const files = [...fd.getAll('evidence')].filter((f) => f?.size); const evidence = await Promise.all(files.map(fileToBase64)); const claims = store.getClaims(); claims.unshift({ id: uid('claim'), jobId: e.currentTarget.dataset.jobId, description: fd.get('description'), severity: fd.get('severity'), evidence, status: 'recibido' }); store.setClaims(claims); toast('Reclamo recibido'); location.hash = '#/dashboard'; });
  qs('#quote-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const jobId = e.currentTarget.dataset.jobId;
    const activities = fd.getAll('activity').map((id) => ({ activityId: id, qty: Number(fd.get(`qty-${id}`) || 1) }));
    const extras = [];
    if (fd.get('extraDescription')) {
      const evidenceFile = fd.get('extraEvidence');
      extras.push({ description: fd.get('extraDescription'), qty: Number(fd.get('extraQty') || 1), unitPrice: Number(fd.get('extraPrice') || 0), reason: fd.get('extraReason') || '', evidence: evidenceFile?.size ? await fileToBase64(evidenceFile) : '' });
    }
    const draft = { activities, extras };
    const drafts = store.getQuoteDrafts(); drafts[jobId] = draft; store.setQuoteDrafts(drafts);
    const action = fd.get('action');
    const check = validateExtras(extras);
    if (action === 'send' && !check.ok) return toast('Extras sin evidencia');
    const jobs = store.getJobs(); const job = jobs.find((j) => j.id === jobId); if (!job) return;
    const calc = calculateQuote(draft); job.quote = calc; job.quoteStatus = action === 'reject' ? 'rejected' : (action === 'accept' ? 'accepted' : (action === 'send' ? 'sent' : 'draft'));
    store.upsertJob(job);
    if (action === 'accept') location.hash = `#/checkout/${jobId}?type=final`;
    else toast(`Presupuesto ${job.quoteStatus}`);
    if (action !== 'accept') render();
  });
}

export function initRouter() {
  window.addEventListener('hashchange', render);
  render();
}

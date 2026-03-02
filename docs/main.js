const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];

const STORE = {
  get selectedLocation() { return localStorage.getItem('selectedLocation') || 'Ciudad de México'; },
  set selectedLocation(v) { localStorage.setItem('selectedLocation', v); },
  get bookings() { return JSON.parse(localStorage.getItem('bookings') || '[]'); },
  set bookings(v) { localStorage.setItem('bookings', JSON.stringify(v)); },
  get lastSearch() { return JSON.parse(localStorage.getItem('lastSearch') || '{}'); },
  set lastSearch(v) { localStorage.setItem('lastSearch', JSON.stringify(v)); },
};

const state = { checkout: null, draftReviewTech: null };

function navTo(path) { location.hash = path.startsWith('/') ? `#${path}` : `#/${path}`; }
function parseHash() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const [path, queryString = ''] = hash.split('?');
  return { path, params: new URLSearchParams(queryString) };
}
function toast(msg) {
  const t = qs('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), 1500);
}

function cardTech(t) {
  return `<button data-tech-id="${t.id}" class="tech-card text-left rounded-2xl bg-white/85 p-4 ring-1 ring-slate-200/80 shadow-card hover:-translate-y-0.5 transition w-full focus:outline-none focus:ring-4 focus:ring-blue-200/60">
    <p class="font-semibold text-slateInk">${t.name}</p>
    <p class="text-sm text-slateInk/70 line-clamp-2">${t.bio}</p>
    <div class="mt-3 flex items-center justify-between text-sm text-slateInk/70"><span>⭐ ${t.rating} · ${t.jobs} trabajos</span><span>Desde $${t.price}</span></div>
  </button>`;
}

function renderHome() {
  const cats = window.FIGXLY_MOCK.categories;
  return `<section class="grid items-center gap-12 lg:grid-cols-2 lg:gap-10 -mt-4">
    <div class="max-w-[640px]">
      <h1 class="text-slateInk tracking-[-0.03em] leading-[1.06] font-semibold text-[32px] sm:text-[40px] lg:text-[48px]">El talento que necesitas,<br />a tu servicio con un clic</h1>
      <form id="search-form" class="mt-8" autocomplete="off">
        <div class="relative flex items-center gap-2 rounded-full bg-white/80 shadow-pill ring-1 ring-slate-200/70 px-4 py-3 sm:px-5 sm:py-4">
          <input id="q" name="q" type="text" placeholder="¿Qué servicio necesitas?" class="min-w-0 flex-[2] bg-transparent text-[15px] font-medium text-slateInk/80 placeholder:text-slateInk/45 outline-none" />
          <input id="loc" name="loc" value="${STORE.selectedLocation}" class="min-w-0 hidden sm:block flex-1 bg-transparent text-[15px] text-slateInk/70 outline-none" />
          <input id="dateInput" name="date" type="date" class="min-w-0 hidden sm:block flex-1 bg-transparent text-[15px] text-slateInk/70 outline-none" />
          <button type="submit" class="ml-2 w-[118px] sm:w-[140px] rounded-full bg-coral px-5 py-3 text-[14px] font-semibold text-white">Buscar</button>
        </div>
      </form>
      <div class="mt-10 flex flex-wrap items-start gap-7 sm:gap-8">${cats.map((c) => `<button data-category="${c.slug}" class="cat-card"><div class="cat-avatar"><img src="./assets/cat-${c.slug}.jpg" alt="${c.name}" class="cat-img" data-fallback="cat" /><div class="cat-ph" aria-hidden="true"><div class="cat-ph-bg"></div><div class="cat-ph-icon text-2xl">${c.icon}</div></div></div><div class="cat-label">${c.name}</div></button>`).join('')}</div>
      <div class="mt-10 flex flex-wrap gap-5">${cats.slice(0, 3).map((c) => `<button class="big-pill" data-category="${c.slug}"><span class="big-pill-ic">${c.icon}</span><span class="big-pill-tx">${c.name}</span></button>`).join('')}</div>
    </div>
    <div class="relative"><img src="./assets/phone-mock.png" alt="Vista previa de la app Figxly" class="phone-img block w-full max-w-[520px] lg:max-w-[560px] translate-x-6 lg:translate-x-8 rotate-[10deg] rounded-[42px] shadow-float" data-fallback="phone" /><div class="phone-ph hidden translate-x-6 lg:translate-x-8 rotate-[10deg]"><div class="phone-shell"><div class="phone-notch"></div><div class="phone-card mt-12"><div class="h-24 rounded-2xl bg-haze"></div></div><div class="phone-card mt-4"><div class="h-24 rounded-2xl bg-haze"></div></div><div class="phone-homebar"></div></div></div></div>
  </section>`;
}

function renderSearch(params) {
  const q = params.get('q') || '';
  const loc = params.get('loc') || STORE.selectedLocation;
  const date = params.get('date') || '';
  const results = window.FIGXLY_MOCK.searchTechnicians({ q, loc, date });
  return `<section><h2 class="text-3xl font-semibold text-slateInk">Resultados de búsqueda</h2><p class="text-slateInk/70 mt-2">${results.length} técnicos en ${loc}</p><div class="mt-6 grid gap-4 md:grid-cols-2">${results.map(cardTech).join('') || '<p>Sin resultados.</p>'}</div></section>`;
}

function renderCategory(slug) {
  const cat = window.FIGXLY_MOCK.categories.find((c) => c.slug === slug);
  const techs = window.FIGXLY_MOCK.searchTechnicians({ category: slug });
  return `<section><h2 class="text-3xl font-semibold text-slateInk">${cat?.name || 'Categoría'}</h2><div class="mt-6 grid gap-4 md:grid-cols-2">${techs.map(cardTech).join('')}</div></section>`;
}

function renderTech(id) {
  const t = window.FIGXLY_MOCK.getTechnician(id);
  if (!t) return '<p>Técnico no encontrado</p>';
  const localReviews = JSON.parse(localStorage.getItem('reviews') || '[]').filter((r) => r.technicianId === id);
  const reviews = [...window.FIGXLY_MOCK.reviews.filter((r) => r.technicianId === id), ...localReviews];
  return `<section class="grid gap-6 lg:grid-cols-[1.2fr_1fr]"><div class="rounded-3xl bg-white/85 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-3xl font-semibold">${t.name}</h2><p class="mt-2 text-slateInk/70">${t.bio}</p><p class="mt-4">⭐ ${t.rating} · ${t.jobs} servicios</p><button data-book="${t.id}" class="mt-6 rounded-full bg-uiBlue px-6 py-3 text-white font-semibold">Agendar</button></div><aside class="rounded-3xl bg-white/85 p-6 ring-1 ring-slate-200/80 shadow-card"><h3 class="font-semibold text-xl">Reseñas</h3><div class="mt-4 space-y-3 max-h-72 overflow-auto">${reviews.map((r) => `<article class="rounded-xl bg-haze p-3"><p class="font-medium">${r.user} · ${'★'.repeat(r.rating)}</p><p class="text-sm text-slateInk/75">${r.comment}</p></article>`).join('')}</div><form id="review-form" class="mt-4 space-y-2"><input type="hidden" name="technicianId" value="${t.id}" /><input required name="user" placeholder="Tu nombre" class="w-full rounded-xl border border-slate-200 p-2" /><select name="rating" class="w-full rounded-xl border border-slate-200 p-2"><option>5</option><option>4</option><option>3</option></select><textarea required name="comment" class="w-full rounded-xl border border-slate-200 p-2" placeholder="Escribe tu reseña"></textarea><button class="rounded-xl bg-coral px-4 py-2 text-white">Enviar reseña</button></form></aside></section>`;
}

function renderBooking(id) {
  const t = window.FIGXLY_MOCK.getTechnician(id);
  const slots = ['09:00', '11:00', '13:00', '16:00', '18:00'];
  return `<section class="max-w-3xl"><h2 class="text-3xl font-semibold">Agendar con ${t?.name || ''}</h2><form id="booking-form" class="mt-6 space-y-4 rounded-3xl bg-white/85 p-6 ring-1 ring-slate-200/80 shadow-card"><input type="hidden" name="id" value="${id}" /><label class="block">Fecha<input required name="date" type="date" class="mt-1 w-full rounded-xl border border-slate-200 p-2" /></label><label class="block">Hora<select name="time" class="mt-1 w-full rounded-xl border border-slate-200 p-2">${slots.map((s) => `<option>${s}</option>`).join('')}</select></label><label class="block">Dirección<input required name="address" class="mt-1 w-full rounded-xl border border-slate-200 p-2" /></label><label class="block">Notas<textarea name="notes" class="mt-1 w-full rounded-xl border border-slate-200 p-2"></textarea></label><button class="rounded-xl bg-uiBlue px-5 py-3 text-white">Continuar</button></form></section>`;
}

function renderCheckout() {
  const b = state.checkout;
  if (!b) return '<p>No hay cita seleccionada.</p>';
  return `<section class="max-w-3xl"><h2 class="text-3xl font-semibold">Checkout</h2><div class="mt-6 rounded-3xl bg-white/85 p-6 ring-1 ring-slate-200/80 shadow-card"><p class="text-slateInk/70">Resumen: ${b.date} ${b.time} · ${b.address}</p><form id="checkout-form" class="mt-4 space-y-3"><label><input type="radio" name="payment" value="Tarjeta" checked /> Tarjeta</label><label class="block"><input type="radio" name="payment" value="Efectivo" /> Efectivo</label><label class="block"><input type="radio" name="payment" value="Transferencia" /> Transferencia</label><button class="rounded-xl bg-coral px-5 py-3 text-white">Confirmar</button></form></div></section>`;
}

const renderSuccess = () => `<section class="max-w-2xl rounded-3xl bg-white/85 p-8 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-3xl font-semibold">¡Cita confirmada!</h2><p class="mt-2 text-slateInk/70">Tu solicitud fue enviada exitosamente.</p><button data-nav-to="/mis-citas" class="mt-6 rounded-xl bg-uiBlue px-5 py-3 text-white">Ver mis citas</button></section>`;

function renderSupport() {
  return `<section class="grid gap-6 lg:grid-cols-2"><div class="rounded-3xl bg-white/85 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-2xl font-semibold">Asistencia</h2><ul class="mt-4 list-disc pl-6 text-slateInk/80"><li>¿Cómo reagendar una cita?</li><li>¿Cómo cancelar sin costo?</li><li>¿Cómo solicitar factura?</li></ul><button id="open-ticket" class="mt-5 rounded-xl bg-uiBlue px-4 py-2 text-white">Abrir ticket</button></div><form id="claim-form" class="rounded-3xl bg-white/85 p-6 ring-1 ring-slate-200/80 shadow-card"><h3 class="text-xl font-semibold">Reclamos</h3><input name="subject" required class="mt-4 w-full rounded-xl border border-slate-200 p-2" placeholder="Asunto" /><textarea name="details" required class="mt-3 w-full rounded-xl border border-slate-200 p-2" placeholder="Cuéntanos qué pasó"></textarea><button class="mt-3 rounded-xl bg-coral px-4 py-2 text-white">Enviar reclamo</button></form></section>`;
}

function renderBookings() {
  const bookings = STORE.bookings;
  return `<section><h2 class="text-3xl font-semibold">Mis citas</h2><div class="mt-5 space-y-3">${bookings.map((b) => `<article class="rounded-2xl bg-white/85 p-4 ring-1 ring-slate-200/80 shadow-card"><p class="font-semibold">${b.techName}</p><p class="text-slateInk/70">${b.date} · ${b.time} · ${b.address}</p><p class="text-sm">Pago: ${b.payment || 'Pendiente'}</p></article>`).join('') || '<p class="text-slateInk/70">Aún no tienes citas.</p>'}</div></section>`;
}

function renderRoute() {
  const app = qs('#app');
  const { path, params } = parseHash();
  const seg = path.split('/').filter(Boolean);
  let html = '';
  if (path === '/') html = renderHome();
  else if (seg[0] === 'buscar') html = renderSearch(params);
  else if (seg[0] === 'categoria') html = renderCategory(seg[1]);
  else if (seg[0] === 'tecnico') html = renderTech(seg[1]);
  else if (seg[0] === 'agendar') html = renderBooking(seg[1]);
  else if (seg[0] === 'checkout') html = renderCheckout();
  else if (seg[0] === 'exito') html = renderSuccess();
  else if (seg[0] === 'soporte') html = renderSupport();
  else if (seg[0] === 'mis-citas') html = renderBookings();
  else html = renderHome();
  app.innerHTML = html;
  bindEvents();
  setupImageFallbacks();
  updateActiveNav(path);
}

function updateActiveNav(path) {
  qsa('[data-nav]').forEach((a) => {
    const on = a.getAttribute('href') === `#${path}`;
    a.setAttribute('aria-current', on ? 'page' : 'false');
  });
}

function setupImageFallbacks() {
  qsa('img[data-fallback="cat"]').forEach((img) => {
    img.addEventListener('error', () => img.nextElementSibling?.style.setProperty('display', 'block'), { once: true });
  });
  qsa('img[data-fallback="phone"]').forEach((img) => {
    img.addEventListener('error', () => {
      img.classList.add('hidden');
      img.nextElementSibling?.classList.remove('hidden');
    }, { once: true });
  });
}

function bindEvents() {
  qs('#search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    STORE.lastSearch = data;
    STORE.selectedLocation = data.loc || STORE.selectedLocation;
    navTo(`/buscar?q=${encodeURIComponent(data.q || '')}&loc=${encodeURIComponent(data.loc || '')}&date=${encodeURIComponent(data.date || '')}`);
  });

  qsa('[data-category]').forEach((b) => b.addEventListener('click', () => navTo(`/categoria/${b.dataset.category}`)));
  qsa('[data-tech-id]').forEach((b) => b.addEventListener('click', () => navTo(`/tecnico/${b.dataset.techId}`)));
  qsa('[data-book]').forEach((b) => b.addEventListener('click', () => navTo(`/agendar/${b.dataset.book}`)));
  qs('[data-nav-to]')?.addEventListener('click', (e) => navTo(e.currentTarget.dataset.navTo));

  qs('#booking-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const tech = window.FIGXLY_MOCK.getTechnician(raw.id);
    state.checkout = { ...raw, techName: tech?.name || 'Técnico' };
    navTo('/checkout');
  });

  qs('#checkout-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const payment = new FormData(e.currentTarget).get('payment');
    const bookings = STORE.bookings;
    bookings.unshift({ ...state.checkout, payment, createdAt: new Date().toISOString() });
    STORE.bookings = bookings;
    navTo('/exito');
  });

  qs('#review-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const review = Object.fromEntries(new FormData(e.currentTarget).entries());
    const list = JSON.parse(localStorage.getItem('reviews') || '[]');
    list.unshift({ ...review, rating: Number(review.rating), id: crypto.randomUUID() });
    localStorage.setItem('reviews', JSON.stringify(list));
    toast('Reseña enviada');
    renderRoute();
  });

  qs('#claim-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const claim = Object.fromEntries(new FormData(e.currentTarget).entries());
    const claims = JSON.parse(localStorage.getItem('claims') || '[]');
    claims.unshift({ ...claim, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    localStorage.setItem('claims', JSON.stringify(claims));
    toast('Reclamo registrado');
    e.currentTarget.reset();
  });

  qs('#open-ticket')?.addEventListener('click', () => toast('Ticket de asistencia abierto'));
}

function setupChrome() {
  const btn = qs('#btn-mobile-menu');
  const panel = qs('#mobile-menu');
  btn?.addEventListener('click', () => {
    panel?.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(btn.getAttribute('aria-expanded') !== 'true'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') panel?.classList.add('hidden');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) navTo('/');
  setupChrome();
  renderRoute();
  window.addEventListener('hashchange', renderRoute);
});

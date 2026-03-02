const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];

const STORAGE_KEYS = {
  session: 'figxly.session',
  users: 'figxly.users',
  pendingOtp: 'figxly.pendingOtp',
  bookings: 'figxly.bookings',
  reviews: 'figxly.reviews',
  tickets: 'figxly.tickets',
  lastSearch: 'figxly.lastSearch',
};

const STORE = {
  get session() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || '{"loggedIn":false,"name":"Invitado"}');
  },
  set session(v) {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(v));
  },
  get users() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
  },
  set users(v) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(v));
  },
  get pendingOtp() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.pendingOtp) || 'null');
  },
  set pendingOtp(v) {
    if (v) localStorage.setItem(STORAGE_KEYS.pendingOtp, JSON.stringify(v));
    else localStorage.removeItem(STORAGE_KEYS.pendingOtp);
  },
  get bookings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings) || '[]');
  },
  set bookings(v) {
    localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(v));
  },
  get reviews() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.reviews) || '[]');
  },
  set reviews(v) {
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(v));
  },
  get tickets() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.tickets) || '[]');
  },
  set tickets(v) {
    localStorage.setItem(STORAGE_KEYS.tickets, JSON.stringify(v));
  },
  get lastSearch() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.lastSearch) || '{}');
  },
  set lastSearch(v) {
    localStorage.setItem(STORAGE_KEYS.lastSearch, JSON.stringify(v));
  },
};

const state = { bookingDraft: null, activeStars: 5 };

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function navTo(path) {
  location.hash = path.startsWith('/') ? `#${path}` : `#/${path}`;
}
function parseHash() {
  const hash = (location.hash || '#/').replace(/^#/, '');
  const [path, queryString = ''] = hash.split('?');
  return { path: path || '/', params: new URLSearchParams(queryString) };
}
function toast(message, timeout = 1700) {
  const t = qs('#toast');
  if (!t) return;
  t.textContent = message;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), timeout);
}

function renderHome() {
  const { categories } = window.FIGXLY_MOCK;
  const last = STORE.lastSearch;
  return `<section class="grid items-center gap-12 lg:grid-cols-2 lg:gap-10 -mt-4">
    <div class="max-w-[640px]">
      <h1 class="text-slateInk tracking-[-0.03em] leading-[1.06] font-semibold text-[32px] sm:text-[40px] lg:text-[48px]">El talento que necesitas,<br />a tu servicio con un clic</h1>
      <p class="mt-5 text-[17px] text-slateInk/70">Busca, agenda y paga en minutos. Todo desde Figxly con técnicos verificados y soporte humano.</p>
      <form id="search-form" class="mt-8" autocomplete="off">
        <div class="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-3xl sm:rounded-full bg-white/85 shadow-pill ring-1 ring-slate-200/70 px-4 py-3 sm:px-5 sm:py-4">
          <input name="q" value="${last.q || ''}" type="text" placeholder="¿Qué servicio necesitas?" class="min-w-0 flex-[2] bg-transparent text-[15px] font-medium text-slateInk/80 placeholder:text-slateInk/45 outline-none" />
          <input name="loc" value="${last.loc || 'Ciudad de México'}" class="min-w-0 flex-1 bg-transparent text-[15px] text-slateInk/70 outline-none" />
          <input name="date" value="${last.date || ''}" type="date" class="min-w-0 flex-1 bg-transparent text-[15px] text-slateInk/70 outline-none" />
          <button type="submit" class="ml-0 sm:ml-2 rounded-full bg-coral px-5 py-3 text-[14px] font-semibold text-white">Buscar</button>
        </div>
      </form>
      <div class="mt-10 flex flex-wrap items-start gap-7 sm:gap-8">${categories.map((c) => `<button data-service="${c.slug}" class="cat-card"><div class="cat-avatar"><div class="cat-ph" style="display:block"><div class="cat-ph-bg"></div><div class="cat-ph-icon text-2xl">${c.icon}</div></div></div><div class="cat-label">${c.name}</div></button>`).join('')}</div>
      <div class="mt-10 flex flex-wrap gap-5">${categories.slice(0, 4).map((c) => `<button class="big-pill" data-service="${c.slug}"><span class="big-pill-ic">${c.icon}</span><span class="big-pill-tx">${c.name}</span></button>`).join('')}</div>
    </div>
    <div class="relative"><img src="./assets/phone-mock.png" alt="Vista previa de la app Figxly" class="phone-img block w-full max-w-[520px] lg:max-w-[560px] translate-x-6 lg:translate-x-8 rotate-[10deg] rounded-[42px] shadow-float" data-fallback="phone" /><div class="phone-ph hidden translate-x-6 lg:translate-x-8 rotate-[10deg]"><div class="phone-shell"><div class="phone-notch"></div><div class="phone-card mt-12"><div class="h-24 rounded-2xl bg-haze"></div></div><div class="phone-card mt-4"><div class="h-24 rounded-2xl bg-haze"></div></div><div class="phone-homebar"></div></div></div></div>
  </section>`;
}

function techCard(t) {
  return `<article class="rounded-2xl bg-white/90 p-4 ring-1 ring-slate-200/80 shadow-card">
    <div class="flex items-start justify-between gap-3">
      <div><h3 class="text-lg font-semibold text-slateInk">${t.nombre}</h3><p class="text-sm text-slateInk/65">${t.servicioLabel} · ${t.ciudad} · ${t.distanciaKm} km</p></div>
      <span class="rounded-full bg-haze px-3 py-1 text-xs font-semibold text-uiBlue">⭐ ${t.rating}</span>
    </div>
    <p class="mt-3 text-sm text-slateInk/70 line-clamp-2">${t.descripcion}</p>
    <div class="mt-3 flex flex-wrap gap-2">${t.tags.map((tag) => `<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slateInk/70">${tag}</span>`).join('')}</div>
    <div class="mt-4 flex items-center justify-between"><p class="font-semibold text-slateInk">Desde $${t.precioBase} MXN</p><button data-go-pro="${t.id}" class="rounded-xl bg-uiBlue px-4 py-2 text-sm font-semibold text-white">Ver perfil</button></div>
  </article>`;
}

function renderResults(params) {
  const filters = {
    q: params.get('q') || '',
    loc: params.get('loc') || '',
    date: params.get('date') || '',
    service: params.get('service') || '',
    minRating: Number(params.get('minRating') || 0),
    maxPrice: Number(params.get('maxPrice') || 10000),
    verifiedOnly: params.get('verified') === '1',
    todayOnly: params.get('today') === '1',
  };
  const results = window.FIGXLY_MOCK.searchTechnicians(filters);
  return `<section class="space-y-6">
    <header class="rounded-2xl bg-white/85 p-5 ring-1 ring-slate-200/80 shadow-card">
      <h2 class="text-3xl font-semibold text-slateInk">Técnicos disponibles</h2>
      <p class="mt-2 text-slateInk/70">${results.length} resultados ${filters.loc ? `en ${filters.loc}` : ''} ${filters.date ? `para ${filters.date}` : ''}</p>
    </header>
    <div class="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside class="rounded-2xl bg-white/85 p-4 ring-1 ring-slate-200/80 shadow-card h-fit">
        <h3 class="font-semibold text-slateInk">Filtros</h3>
        <form id="filters-form" class="mt-4 space-y-3 text-sm">
          <label class="block">Servicio<select name="service" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"><option value="">Todos</option>${window.FIGXLY_MOCK.services.map((s) => `<option value="${s.slug}" ${s.slug === filters.service ? 'selected' : ''}>${s.label}</option>`).join('')}</select></label>
          <label class="block">Rating mínimo<select name="minRating" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-white">${[0, 4, 4.5].map((v) => `<option value="${v}" ${v === filters.minRating ? 'selected' : ''}>${v === 0 ? 'Cualquiera' : `${v}+`}</option>`).join('')}</select></label>
          <label class="block">Precio máximo<input type="range" min="250" max="1200" step="50" name="maxPrice" value="${filters.maxPrice}" class="mt-1 w-full" /><span class="text-xs text-slateInk/70">Hasta $${filters.maxPrice}</span></label>
          <label class="flex items-center gap-2"><input type="checkbox" name="verified" ${filters.verifiedOnly ? 'checked' : ''} /> Verificados</label>
          <label class="flex items-center gap-2"><input type="checkbox" name="today" ${filters.todayOnly ? 'checked' : ''} /> Disponible hoy</label>
          <button class="w-full rounded-xl bg-uiBlue px-3 py-2 font-semibold text-white">Aplicar filtros</button>
        </form>
      </aside>
      <div class="grid gap-4 md:grid-cols-2">${results.map(techCard).join('') || '<p class="text-slateInk/70">No hay técnicos con esos filtros.</p>'}</div>
    </div>
  </section>`;
}

function renderProProfile(id) {
  const pro = window.FIGXLY_MOCK.getTechnician(id);
  if (!pro) return '<p class="text-slateInk/80">No encontramos ese técnico.</p>';
  const reviews = [...window.FIGXLY_MOCK.reviews.filter((r) => r.technicianId === id), ...STORE.reviews.filter((r) => r.technicianId === id)];
  return `<section class="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
    <article class="rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div><h2 class="text-3xl font-semibold text-slateInk">${pro.nombre}</h2><p class="text-slateInk/70">${pro.servicioLabel} · ${pro.ciudad}</p></div>
        <div class="text-right"><p class="font-semibold">⭐ ${pro.rating} (${pro.reviewsCount})</p><p class="text-sm text-slateInk/70">${pro.distanciaKm} km de distancia</p></div>
      </header>
      <div class="mt-4 flex flex-wrap gap-2">${pro.tags.map((tag) => `<span class="rounded-full bg-haze px-3 py-1 text-xs font-semibold text-uiBlue">${tag}</span>`).join('')}</div>
      <p class="mt-5 text-slateInk/80">${pro.descripcion}</p>
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div class="rounded-2xl bg-slate-50 p-4"><p class="text-xs text-slateInk/60">Servicios</p><p class="mt-1 font-semibold">${pro.servicios.join(', ')}</p></div>
        <div class="rounded-2xl bg-slate-50 p-4"><p class="text-xs text-slateInk/60">Rango de precios</p><p class="mt-1 font-semibold">$${pro.precioBase} - $${pro.precioBase + 450} MXN</p></div>
      </div>
      <section class="mt-7"><h3 class="text-xl font-semibold">Reviews</h3><div class="mt-3 space-y-3">${reviews.slice(0, 4).map((r) => `<div class="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><p class="text-sm font-semibold">${r.user} · ⭐ ${r.rating}</p><p class="text-sm text-slateInk/70">${r.comment}</p></div>`).join('') || '<p class="text-slateInk/70">Aún no tiene reseñas.</p>'}</div></section>
    </article>
    <aside class="lg:sticky lg:top-24 h-fit rounded-3xl bg-white/90 p-5 ring-1 ring-slate-200/80 shadow-card">
      <p class="text-sm text-slateInk/70">Costo base</p><p class="text-3xl font-semibold text-slateInk mt-1">$${pro.precioBase}</p>
      <button data-book-now="${pro.id}" class="mt-5 w-full rounded-xl bg-coral px-4 py-3 text-sm font-semibold text-white">Agendar</button>
    </aside>
  </section>`;
}

function renderBooking(id) {
  const pro = window.FIGXLY_MOCK.getTechnician(id);
  if (!pro) return '<p>Técnico no encontrado.</p>';
  return `<section class="mx-auto max-w-3xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card">
    <h2 class="text-3xl font-semibold">Agendar cita con ${pro.nombre}</h2>
    <form id="booking-form" class="mt-6 grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="proId" value="${pro.id}" />
      <label class="block">Fecha<select name="date" required class="mt-1 w-full rounded-xl border border-slate-200 p-2 bg-white">${pro.disponibilidad.map((d) => `<option>${d}</option>`).join('')}</select></label>
      <label class="block">Hora<select name="time" required class="mt-1 w-full rounded-xl border border-slate-200 p-2 bg-white"><option>09:00</option><option>11:00</option><option>13:00</option><option>16:00</option></select></label>
      <label class="sm:col-span-2">Dirección<input name="address" required placeholder="Calle, número, colonia" class="mt-1 w-full rounded-xl border border-slate-200 p-2" /></label>
      <label class="sm:col-span-2">Notas<textarea name="notes" rows="3" placeholder="Detalles de la reparación" class="mt-1 w-full rounded-xl border border-slate-200 p-2"></textarea></label>
      <label class="block">Tipo de visita<select name="visitType" class="mt-1 w-full rounded-xl border border-slate-200 p-2 bg-white"><option value="normal">Normal</option><option value="urgente">Urgente</option></select></label>
      <div class="rounded-2xl bg-haze p-3"><p class="text-sm text-slateInk/70">Resumen estimado</p><p class="font-semibold">$${pro.precioBase} base + urgencia si aplica.</p></div>
      <button class="sm:col-span-2 rounded-xl bg-uiBlue px-4 py-3 text-sm font-semibold text-white">Continuar a pago</button>
    </form>
  </section>`;
}

function renderPayment(bookingId) {
  const booking = STORE.bookings.find((b) => b.id === bookingId);
  if (!booking) return '<p class="text-slateInk/80">No encontramos esta reserva.</p>';
  if (booking.status === 'paid') {
    return `<section class="mx-auto max-w-2xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card text-center"><h2 class="text-3xl font-semibold">Pago confirmado</h2><p class="mt-2 text-slateInk/70">Tu cita con ${booking.proName} quedó pagada.</p><button data-go-review="${booking.id}" class="mt-6 rounded-xl bg-coral px-5 py-3 font-semibold text-white">Calificar servicio</button></section>`;
  }
  return `<section class="mx-auto max-w-3xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card">
    <h2 class="text-3xl font-semibold">Checkout</h2>
    <p class="mt-1 text-slateInk/70">Booking ${booking.id.slice(-8)} · ${booking.proName}</p>
    <form id="payment-form" data-booking-id="${booking.id}" class="mt-5 grid gap-4 sm:grid-cols-2">
      <label>Método<select name="method" class="mt-1 w-full rounded-xl border border-slate-200 p-2 bg-white"><option>tarjeta</option><option>efectivo</option><option>transferencia</option></select></label>
      <label>Titular<input name="holder" required class="mt-1 w-full rounded-xl border border-slate-200 p-2" /></label>
      <label>Número<input name="card" required class="mt-1 w-full rounded-xl border border-slate-200 p-2" placeholder="4242 4242 4242 4242" /></label>
      <label>CVV<input name="cvv" required class="mt-1 w-full rounded-xl border border-slate-200 p-2" /></label>
      <div class="sm:col-span-2 rounded-2xl bg-haze p-3"><p class="font-semibold">Total a pagar: $${booking.estimate} MXN</p></div>
      <button class="sm:col-span-2 rounded-xl bg-uiBlue px-4 py-3 font-semibold text-white">Pagar</button>
    </form>
  </section>`;
}

function renderReview(bookingId) {
  const booking = STORE.bookings.find((b) => b.id === bookingId);
  if (!booking) return '<p>Reserva no encontrada.</p>';
  return `<section class="mx-auto max-w-2xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card">
    <h2 class="text-3xl font-semibold">Califica tu servicio</h2>
    <p class="mt-1 text-slateInk/70">${booking.proName} · ${booking.date} ${booking.time}</p>
    <form id="review-form" data-booking-id="${booking.id}" class="mt-6 space-y-4">
      <input type="hidden" name="rating" value="5" />
      <div class="flex gap-2 text-2xl" data-stars>${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}">⭐</button>`).join('')}</div>
      <textarea name="comment" required rows="4" placeholder="Cuéntanos cómo fue tu experiencia" class="w-full rounded-xl border border-slate-200 p-3"></textarea>
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="reportIssue" /> Reportar un problema</label>
      <button class="rounded-xl bg-coral px-4 py-3 font-semibold text-white">Enviar reseña</button>
    </form>
  </section>`;
}

function renderSupport(params) {
  const bookingId = params.get('bookingId') || '';
  return `<section class="mx-auto max-w-3xl grid gap-6 lg:grid-cols-2">
    <article class="rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card">
      <h2 class="text-2xl font-semibold">Soporte Figxly</h2>
      <p class="mt-2 text-slateInk/70">Abrimos un ticket y te respondemos por correo en menos de 12h.</p>
      <ul class="mt-4 list-disc pl-5 text-sm text-slateInk/70"><li>Estado de cita</li><li>Cobro incorrecto</li><li>Calidad del servicio</li></ul>
    </article>
    <form id="support-form" class="rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card">
      <input type="hidden" name="bookingId" value="${bookingId}" />
      <label class="block">Motivo<select name="reason" class="mt-1 w-full rounded-xl border border-slate-200 p-2 bg-white"><option>Cobro</option><option>Incumplimiento</option><option>Seguridad</option><option>Otro</option></select></label>
      <label class="mt-3 block">Descripción<textarea name="description" required rows="4" class="mt-1 w-full rounded-xl border border-slate-200 p-2" placeholder="Describe lo sucedido"></textarea></label>
      <label class="mt-3 block">Adjuntar evidencia (UI)<input type="file" class="mt-1 w-full rounded-xl border border-slate-200 p-2" /></label>
      <button class="mt-4 w-full rounded-xl bg-uiBlue px-4 py-3 font-semibold text-white">Enviar reclamo</button>
    </form>
  </section>`;
}

function renderOrders() {
  const bookings = STORE.bookings;
  return `<section><h2 class="text-3xl font-semibold">Mis citas</h2><div class="mt-5 space-y-3">${bookings.map((b) => `<article class="rounded-2xl bg-white/85 p-4 ring-1 ring-slate-200/80 shadow-card"><p class="font-semibold">${b.proName}</p><p class="text-sm text-slateInk/70">${b.date} ${b.time} · ${b.address}</p><p class="text-sm">Estado: <strong>${b.status}</strong></p></article>`).join('') || '<p class="text-slateInk/70">Aún no tienes citas.</p>'}</div></section>`;
}

function renderTickets() {
  const tickets = STORE.tickets;
  return `<section><h2 class="text-3xl font-semibold">Mis reclamos</h2><div class="mt-5 space-y-3">${tickets.map((t) => `<article class="rounded-2xl bg-white/85 p-4 ring-1 ring-slate-200/80 shadow-card"><p class="font-semibold">${t.folio} · ${t.reason}</p><p class="text-sm text-slateInk/70">${t.description}</p><p class="text-sm">Estado: ${t.status}</p></article>`).join('') || '<p class="text-slateInk/70">No tienes reclamos activos.</p>'}</div></section>`;
}


function socialIcon(provider) {
  const icons = {
    google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.7h5.5a4.9 4.9 0 0 1-2.1 3.2v2.7h3.4c2-1.8 3-4.4 3-7.6Z"/><path fill="currentColor" d="M12 22c2.7 0 5-1 6.7-2.6l-3.4-2.7c-.9.7-2.1 1.2-3.3 1.2-2.6 0-4.8-1.8-5.6-4.2H2.9v2.8A10 10 0 0 0 12 22Z"/><path fill="currentColor" d="M6.4 13.7a6 6 0 0 1 0-3.4V7.5H2.9a10 10 0 0 0 0 8.9l3.5-2.7Z"/><path fill="currentColor" d="M12 6.1c1.4 0 2.7.5 3.7 1.5l2.8-2.8A9.7 9.7 0 0 0 12 2a10 10 0 0 0-9.1 5.5l3.5 2.8C7.2 7.9 9.4 6.1 12 6.1Z"/></svg>',
    apple: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.3 12.3c0-2.2 1.8-3.2 1.9-3.3-1-.1-2.2.6-2.8.6-.8 0-1.5-.6-2.4-.5-1.2 0-2.4.7-3 1.8-1.3 2.3-.3 5.8 1 7.5.7.9 1.4 1.8 2.4 1.8s1.3-.6 2.4-.6 1.4.6 2.4.6 1.6-.9 2.2-1.8c.8-1.1 1.1-2.2 1.1-2.2s-2.1-.8-2.1-3.9Zm-1.7-5.2c.5-.7.9-1.6.8-2.5-.8 0-1.8.5-2.4 1.2-.5.6-.9 1.5-.8 2.4.9.1 1.9-.4 2.4-1.1Z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.6-1.6h1.7V3.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4v2.2H8V13h2.4v8h3.1Z"/></svg>',
  };
  return icons[provider] || '';
}

function authCard(title, subtitle, content) {
  return `<section class="mx-auto max-w-xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-3xl font-semibold">${title}</h2><p class="mt-2 text-slateInk/70">${subtitle}</p><div class="mt-6">${content}</div></section>`;
}

function renderAuthSocialLinks(mode) {
  const label = mode === 'signup' ? 'Registrarme con' : 'Iniciar con';
  return ['google', 'apple', 'facebook'].map((provider) => `<a href="#/auth/social/${provider}?mode=${mode}" class="auth-social"><span class="auth-social-ic">${socialIcon(provider)}</span>${label} ${provider[0].toUpperCase() + provider.slice(1)}</a>`).join('');
}

function renderAuthSignup() {
  return authCard('Regístrate', 'Crea tu cuenta con tu método preferido.', `${renderAuthSocialLinks('signup')}<div class="mt-4 grid gap-3 sm:grid-cols-2"><a href="#/auth/phone?mode=signup" class="auth-secondary">Número de celular</a><a href="#/auth/email?mode=signup" class="auth-secondary">Correo y contraseña</a></div><p class="mt-4 text-sm text-slateInk/70">¿Ya tienes cuenta? <a class="font-semibold text-uiBlue" href="#/auth/login">Inicia sesión</a></p>`);
}

function renderAuthLogin() {
  return authCard('Iniciar sesión', 'Accede para gestionar tus citas y soporte.', `${renderAuthSocialLinks('login')}<div class="mt-4 grid gap-3 sm:grid-cols-2"><a href="#/auth/phone?mode=login" class="auth-secondary">Entrar con celular</a><a href="#/auth/email?mode=login" class="auth-secondary">Entrar con correo</a></div><p class="mt-4 text-sm text-slateInk/70">¿No tienes cuenta? <a class="font-semibold text-uiBlue" href="#/auth/signup">Regístrate</a></p>`);
}

function renderAuthPhone(params) {
  const mode = params.get('mode') || 'login';
  return authCard('Verifica tu celular', 'Te enviaremos un código OTP mock de 6 dígitos.', `<form id="phone-form" data-mode="${mode}" class="space-y-4"><label class="block">Número de celular<input name="phone" required minlength="8" class="mt-1 w-full rounded-xl border border-slate-200 p-3" placeholder="+52 55 1234 5678" /></label><button class="w-full rounded-xl bg-uiBlue px-4 py-3 font-semibold text-white">Continuar</button></form>`);
}

function renderAuthOtp(params) {
  const mode = params.get('mode') || 'login';
  return authCard('Código OTP', 'Ingresa el código mock: 123456.', `<form id="otp-form" data-mode="${mode}" class="space-y-4"><label class="block">OTP<input name="otp" required minlength="6" maxlength="6" class="mt-1 w-full rounded-xl border border-slate-200 p-3 tracking-[0.35em]" placeholder="123456" /></label><button class="w-full rounded-xl bg-uiBlue px-4 py-3 font-semibold text-white">Validar código</button></form>`);
}

function renderAuthEmail(params) {
  const mode = params.get('mode') || 'login';
  return authCard(mode === 'signup' ? 'Registro por correo' : 'Ingreso por correo', 'Usa tu correo y contraseña para continuar.', `<form id="email-form" data-mode="${mode}" class="space-y-4"><label class="block">Nombre completo<input name="name" ${mode === 'signup' ? 'required' : ''} class="mt-1 w-full rounded-xl border border-slate-200 p-3" placeholder="Tu nombre" /></label><label class="block">Correo<input type="email" name="email" required class="mt-1 w-full rounded-xl border border-slate-200 p-3" placeholder="hola@correo.com" /></label><label class="block">Contraseña<input type="password" name="password" required minlength="6" class="mt-1 w-full rounded-xl border border-slate-200 p-3" placeholder="******" /></label><button class="w-full rounded-xl bg-uiBlue px-4 py-3 font-semibold text-white">${mode === 'signup' ? 'Crear cuenta' : 'Entrar'}</button></form>`);
}

function renderAuthSocial(provider, params) {
  const mode = params.get('mode') || 'login';
  const name = provider[0].toUpperCase() + provider.slice(1);
  return authCard(`${mode === 'signup' ? 'Registro' : 'Ingreso'} con ${name}`, `Este flujo es mock y simula autenticación con ${name}.`, `<button class="w-full rounded-xl bg-uiBlue px-4 py-3 font-semibold text-white" data-social-login="${provider}" data-mode="${mode}">Continuar con ${name}</button><p class="mt-3 text-sm text-slateInk/70">No se realizan llamadas externas.</p>`);
}

function renderAccount() {
  const session = STORE.session;
  if (!session.loggedIn) return '<section class="rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><p class="text-slateInk/75">Debes iniciar sesión para ver tu cuenta.</p><a href="#/auth/login" class="mt-4 inline-block rounded-xl bg-uiBlue px-4 py-2 text-white">Iniciar sesión</a></section>';
  return `<section class="mx-auto max-w-2xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-3xl font-semibold">Mi cuenta</h2><p class="mt-2 text-slateInk/70">${session.name}</p><dl class="mt-5 grid gap-4 sm:grid-cols-2"><div class="rounded-2xl bg-haze p-4"><dt class="text-sm text-slateInk/70">Método</dt><dd class="font-semibold">${session.provider || 'email'}</dd></div><div class="rounded-2xl bg-haze p-4"><dt class="text-sm text-slateInk/70">Contacto</dt><dd class="font-semibold">${session.email || session.phone || 'Sin dato'}</dd></div></dl></section>`;
}

function loginUser(user) {
  STORE.session = { ...user, loggedIn: true };
  renderAuthControls();
  toast('¡Bienvenido a Figxly!');
  navTo('/');
}

function upsertUser(user) {
  const users = STORE.users;
  const key = user.email ? 'email' : user.phone ? 'phone' : 'id';
  const next = users.filter((u) => (key === 'id' ? u.id !== user.id : u[key] !== user[key]));
  next.unshift(user);
  STORE.users = next;
}

function getInitials(name = 'U') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function renderAuthControls() {
  const session = STORE.session;
  const desktop = qs('#auth-desktop');
  const mobile = qs('#auth-mobile');
  if (!desktop || !mobile) return;

  if (!session.loggedIn) {
    desktop.innerHTML = `<a href="#/auth/login" class="auth-link">Iniciar sesión</a><a href="#/auth/signup" class="auth-btn">Regístrate</a>`;
    mobile.innerHTML = `<div class="grid gap-2"><a href="#/auth/login" class="auth-link text-center">Iniciar sesión</a><a href="#/auth/signup" class="auth-btn text-center">Regístrate</a></div>`;
    return;
  }

  desktop.innerHTML = `<div class="relative"><button id="account-btn" type="button" class="account-btn"><span class="account-avatar">${getInitials(session.name)}</span><span class="max-w-[140px] truncate">${session.name}</span></button><div id="account-menu" class="account-menu hidden"><a href="#/account" class="dd-item">Mi cuenta</a><a href="#/orders" class="dd-item">Mis citas</a><a href="#/reviews" class="dd-item">Mis reseñas</a><a href="#/support" class="dd-item">Soporte / Reclamos</a><button type="button" class="dd-item" data-logout>Cerrar sesión</button></div></div>`;
  mobile.innerHTML = `<div class="rounded-2xl bg-white/80 p-3 ring-1 ring-slate-200/70"><p class="text-sm font-semibold text-slateInk">${session.name}</p><div class="mt-2 grid gap-2"><a href="#/account" class="dd-item">Mi cuenta</a><a href="#/orders" class="dd-item">Mis citas</a><a href="#/reviews" class="dd-item">Mis reseñas</a><a href="#/support" class="dd-item">Soporte / Reclamos</a><button type="button" class="dd-item" data-logout>Cerrar sesión</button></div></div>`;
}


function renderMyReviews() {
  const reviews = STORE.reviews;
  return `<section><h2 class="text-3xl font-semibold">Mis reseñas</h2><div class="mt-5 space-y-3">${reviews.map((r) => `<article class="rounded-2xl bg-white/85 p-4 ring-1 ring-slate-200/80 shadow-card"><p class="font-semibold">${r.user} · ⭐ ${r.rating}</p><p class="text-sm text-slateInk/70">${r.comment}</p></article>`).join('') || '<p class="text-slateInk/70">Todavía no has publicado reseñas.</p>'}</div></section>`;
}

function renderRoute() {
  const app = qs('#app');
  const { path, params } = parseHash();
  const seg = path.split('/').filter(Boolean);
  let html = '';
  if (path === '/') html = renderHome();
  else if (seg[0] === 'results') html = renderResults(params);
  else if (seg[0] === 'pro') html = renderProProfile(seg[1]);
  else if (seg[0] === 'booking') html = renderBooking(seg[1]);
  else if (seg[0] === 'payment') html = renderPayment(seg[1]);
  else if (seg[0] === 'review') html = renderReview(seg[1]);
  else if (seg[0] === 'support') html = renderSupport(params);
  else if (seg[0] === 'orders') html = renderOrders();
  else if (seg[0] === 'tickets') html = renderTickets();
  else if (seg[0] === 'reviews') html = renderMyReviews();
  else if (seg[0] === 'account') html = renderAccount();
  else if (seg[0] === 'auth' && seg[1] === 'signup') html = renderAuthSignup();
  else if (seg[0] === 'auth' && seg[1] === 'login') html = renderAuthLogin();
  else if (seg[0] === 'auth' && seg[1] === 'phone') html = renderAuthPhone(params);
  else if (seg[0] === 'auth' && seg[1] === 'otp') html = renderAuthOtp(params);
  else if (seg[0] === 'auth' && seg[1] === 'email') html = renderAuthEmail(params);
  else if (seg[0] === 'auth' && seg[1] === 'social' && seg[2]) html = renderAuthSocial(seg[2], params);
  else html = renderHome();
  app.innerHTML = html;
  renderAuthControls();
  bindEvents();
  setupImageFallbacks();
  updateActiveNav(path);
}

function updateActiveNav(path) {
  qsa('[data-nav]').forEach((a) => {
    const on = path.startsWith(a.dataset.nav || '/__none__');
    a.setAttribute('aria-current', on ? 'page' : 'false');
  });
}

function setupImageFallbacks() {
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
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    STORE.lastSearch = data;
    const p = new URLSearchParams(data);
    navTo(`/results?${p.toString()}`);
  });
  qsa('[data-service]').forEach((b) => b.addEventListener('click', () => navTo(`/results?service=${encodeURIComponent(b.dataset.service)}`)));
  qsa('[data-go-pro]').forEach((b) => b.addEventListener('click', () => navTo(`/pro/${b.dataset.goPro}`)));
  qs('[data-book-now]')?.addEventListener('click', (e) => navTo(`/booking/${e.currentTarget.dataset.bookNow}`));

  qs('#filters-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const current = parseHash().params;
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const p = new URLSearchParams({
      q: current.get('q') || '',
      loc: current.get('loc') || '',
      date: current.get('date') || '',
      service: data.service || '',
      minRating: data.minRating || '0',
      maxPrice: data.maxPrice || '10000',
      verified: data.verified ? '1' : '0',
      today: data.today ? '1' : '0',
    });
    navTo(`/results?${p.toString()}`);
  });

  qs('#booking-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    const pro = window.FIGXLY_MOCK.getTechnician(payload.proId);
    const estimate = pro.precioBase + (payload.visitType === 'urgente' ? 180 : 0);
    const booking = {
      id: uid('bk'),
      proId: pro.id,
      proName: pro.nombre,
      date: payload.date,
      time: payload.time,
      address: payload.address,
      notes: payload.notes,
      visitType: payload.visitType,
      estimate,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    };
    STORE.bookings = [booking, ...STORE.bookings];
    state.bookingDraft = booking;
    navTo(`/payment/${booking.id}`);
  });

  qs('#payment-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const bookingId = e.currentTarget.dataset.bookingId;
    const method = new FormData(e.currentTarget).get('method');
    STORE.bookings = STORE.bookings.map((b) => (b.id === bookingId ? { ...b, method, status: 'paid', paidAt: new Date().toISOString() } : b));
    toast('Pago realizado con éxito');
    navTo(`/review/${bookingId}`);
  });

  qsa('[data-go-review]').forEach((b) => b.addEventListener('click', () => navTo(`/review/${b.dataset.goReview}`)));

  qsa('[data-star]').forEach((starBtn) => {
    starBtn.addEventListener('click', () => {
      state.activeStars = Number(starBtn.dataset.star);
      qs('#review-form input[name="rating"]').value = String(state.activeStars);
      qsa('[data-star]').forEach((el) => el.classList.toggle('opacity-40', Number(el.dataset.star) > state.activeStars));
    });
  });

  qs('#review-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const bookingId = e.currentTarget.dataset.bookingId;
    const booking = STORE.bookings.find((b) => b.id === bookingId);
    const review = Object.fromEntries(new FormData(e.currentTarget).entries());
    STORE.reviews = [{ id: uid('rv'), technicianId: booking.proId, bookingId, user: STORE.session.name, rating: Number(review.rating), comment: review.comment, createdAt: new Date().toISOString() }, ...STORE.reviews];
    if (review.reportIssue) {
      navTo(`/support?bookingId=${encodeURIComponent(bookingId)}`);
      return;
    }
    toast('Gracias por tu reseña');
    navTo('/');
  });

  qs('#support-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    const ticket = { id: uid('tk'), folio: `FGX-${Math.floor(100000 + Math.random() * 900000)}`, status: 'open', createdAt: new Date().toISOString(), ...payload };
    STORE.tickets = [ticket, ...STORE.tickets];
    toast(`Ticket creado: ${ticket.folio}`);
    navTo('/tickets');
  });

  qs('#phone-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    STORE.pendingOtp = { phone: data.phone, mode: e.currentTarget.dataset.mode || 'login', otp: '123456' };
    toast('OTP mock enviado: 123456');
    navTo(`/auth/otp?mode=${encodeURIComponent(e.currentTarget.dataset.mode || 'login')}`);
  });

  qs('#otp-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const pending = STORE.pendingOtp;
    if (!pending || data.otp !== '123456') {
      toast('OTP inválido');
      return;
    }
    const user = { id: uid('usr'), name: `Usuario ${pending.phone.slice(-4)}`, phone: pending.phone, provider: 'phone' };
    upsertUser(user);
    STORE.pendingOtp = null;
    loginUser(user);
  });

  qs('#email-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const mode = e.currentTarget.dataset.mode || 'login';
    const existing = STORE.users.find((u) => u.email === data.email);
    if (mode === 'login' && !existing) {
      toast('Cuenta no encontrada, regístrate primero');
      navTo('/auth/signup');
      return;
    }
    if (mode === 'login' && existing.password !== data.password) {
      toast('Contraseña incorrecta');
      return;
    }
    const user = mode === 'login' ? existing : { id: uid('usr'), name: data.name || data.email.split('@')[0], email: data.email, password: data.password, provider: 'email' };
    if (mode === 'signup') upsertUser(user);
    loginUser(user);
  });

  qsa('[data-social-login]').forEach((btn) => btn.addEventListener('click', () => {
    const provider = btn.dataset.socialLogin;
    const user = { id: uid('usr'), name: `Usuario ${provider}`, provider };
    upsertUser(user);
    loginUser(user);
  }));

  qsa('[data-logout]').forEach((btn) => btn.addEventListener('click', () => {
    STORE.session = { loggedIn: false, name: 'Invitado' };
    renderAuthControls();
    toast('Sesión cerrada');
    navTo('/');
  }));

  qs('#account-btn')?.addEventListener('click', () => qs('#account-menu')?.classList.toggle('hidden'));
}

function setupChrome() {
  const btn = qs('#btn-mobile-menu');
  const panel = qs('#mobile-menu');

  btn?.addEventListener('click', () => {
    panel?.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(btn.getAttribute('aria-expanded') !== 'true'));
  });
  document.addEventListener('click', (e) => {
    const accountBtn = qs('#account-btn');
    const accountMenu = qs('#account-menu');
    if (!accountBtn?.contains(e.target) && !accountMenu?.contains(e.target)) accountMenu?.classList.add('hidden');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) navTo('/');
  setupChrome();
  renderRoute();
  window.addEventListener('hashchange', renderRoute);
});

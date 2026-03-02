const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];

const { storage, services, STATUS, STATUS_LABEL, ensureSession, addTimeline, createRequest, uid, now } = window.FIGXLY_DATA;

const state = { redirectAfterLogin: null, modalAction: null };

const esc = (v = '') => String(v).replace(/[&<>'"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[m]));
const formatMoney = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
const formatDate = (d) => new Date(d).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
const navTo = (p) => { location.hash = p.startsWith('/') ? `#${p}` : `#/${p}`; };

function parseHash() {
  const hash = (location.hash || '#/').slice(1);
  const [path, search = ''] = hash.split('?');
  return { path: path || '/', params: new URLSearchParams(search) };
}

function uiToast(message) {
  const t = qs('#toast');
  if (!t) return;
  t.textContent = message;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), 1800);
}

function uiModalConfirm(message, onConfirm) {
  state.modalAction = onConfirm;
  const root = qs('#modal-root');
  root.innerHTML = `<div class="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"><div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-card"><p class="text-slateInk/85">${esc(message)}</p><div class="mt-5 flex justify-end gap-3"><button data-modal-cancel class="rounded-xl border border-slate-200 px-4 py-2">Cancelar</button><button data-modal-confirm class="rounded-xl bg-uiBlue px-4 py-2 text-white">Confirmar</button></div></div></div>`;
}

function closeModal() { qs('#modal-root').innerHTML = ''; state.modalAction = null; }
function getCurrentUser() { return storage.currentUser; }
function allUsersByRole(role) { return storage.users.filter((u) => u.role === role); }

function isAuthed() { return !!storage.session.loggedIn && !!storage.currentUser; }
function ensureAuth() {
  if (isAuthed()) return true;
  state.redirectAfterLogin = location.hash || '#/';
  navTo('/auth/login');
  return false;
}

function renderHeaderControls() {
  const user = getCurrentUser();
  const authDesktop = qs('#auth-desktop');
  const authMobile = qs('#auth-mobile');
  const roleOptions = ['cliente', 'ingeniero', 'tecnico', 'transportista'].map((r) => `<option value="${r}" ${user?.role === r ? 'selected' : ''}>${r}</option>`).join('');
  const html = user
    ? `<div class="flex items-center gap-2"><span class="text-sm">${esc(user.name)}</span><select id="dev-role" class="rounded-xl border border-slate-200 bg-white px-2 py-1 text-sm" aria-label="Selector de rol">${roleOptions}</select><button data-logout class="auth-link">Salir</button></div>`
    : '<a class="auth-btn" href="#/auth/login">Ingresar</a>';
  authDesktop.innerHTML = html;
  authMobile.innerHTML = html;
}

function routeMatch(path, pattern) {
  const px = path.split('/').filter(Boolean);
  const pt = pattern.split('/').filter(Boolean);
  if (px.length !== pt.length) return null;
  const params = {};
  for (let i = 0; i < pt.length; i += 1) {
    if (pt[i].startsWith(':')) params[pt[i].slice(1)] = px[i];
    else if (pt[i] !== px[i]) return null;
  }
  return params;
}

function statusChip(status) { return `<span class="status-chip status-${status}">${esc(STATUS_LABEL[status] || status)}</span>`; }

function renderHome() {
  return `<section><h1 class="text-4xl font-semibold">Servicios Figxly</h1><p class="mt-2 text-slateInk/70">Selecciona una categoría para crear tu solicitud.</p><div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${services.map((s) => `<a href="#/request/new?service=${s.slug}" class="rounded-2xl bg-white/85 p-5 ring-1 ring-slate-200/80 shadow-card hover:-translate-y-0.5 transition"><div class="text-2xl">${s.icon}</div><h3 class="mt-2 text-lg font-semibold">${s.label}</h3></a>`).join('')}</div></section>`;
}

function renderLogin() {
  const users = storage.users;
  return `<section class="mx-auto max-w-2xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-3xl font-semibold">Auth mock</h2><p class="mt-2 text-slateInk/70">Elige un usuario semilla para entrar.</p><div class="mt-5 grid gap-3">${users.map((u) => `<button data-login="${u.id}" class="rounded-xl border border-slate-200 bg-white p-3 text-left hover:bg-haze"><strong>${esc(u.name)}</strong> <span class="text-sm text-slateInk/70">(${u.role} · ${u.city})</span></button>`).join('')}</div></section>`;
}

function renderServices() { return renderHome(); }

function renderRequestNew(params) {
  if (!ensureAuth()) return '';
  const user = getCurrentUser();
  const service = params.get('service') || 'plomeria';
  return `<section class="mx-auto max-w-3xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-3xl font-semibold">Nueva solicitud</h2><form id="request-form" class="mt-5 grid gap-4"><label>Servicio<select name="serviceCategory" class="mt-1 w-full rounded-xl border border-slate-200 p-2 bg-white">${services.map((s) => `<option value="${s.slug}" ${s.slug === service ? 'selected' : ''}>${s.label}</option>`).join('')}</select></label><label>Contacto<input disabled value="${esc(user.name)} · ${esc(user.phone || user.email || '')}" class="mt-1 w-full rounded-xl border border-slate-200 p-2 bg-slate-50" /></label><label>Ciudad<input name="city" required value="${esc(user.city || 'CDMX')}" class="mt-1 w-full rounded-xl border border-slate-200 p-2"/></label><label>Dirección<input name="addressText" required class="mt-1 w-full rounded-xl border border-slate-200 p-2"/></label><label>Descripción<textarea name="description" rows="4" required class="mt-1 w-full rounded-xl border border-slate-200 p-2"></textarea></label><label class="flex items-center gap-2"><input type="checkbox" name="requiresTransport" /> Requiere transportista</label><label>Fotos (1-4, recomendado)<input name="photos" type="file" multiple accept="image/*" class="mt-1 w-full rounded-xl border border-slate-200 p-2"/></label><div id="photo-preview" class="grid grid-cols-4 gap-2"></div><button class="rounded-xl bg-uiBlue px-4 py-3 font-semibold text-white">Publicar solicitud</button></form></section>`;
}

function renderRequests() {
  if (!ensureAuth()) return '';
  const u = getCurrentUser();
  const list = storage.requests.filter((r) => u.role === 'cliente' ? r.clientId === u.id : true);
  return `<section><h2 class="text-3xl font-semibold">Mis solicitudes</h2><div class="mt-5 space-y-3">${list.map((r) => `<article class="rounded-2xl bg-white/85 p-4 ring-1 ring-slate-200/80 shadow-card"><div class="flex items-center justify-between"><p class="font-semibold">${esc(r.serviceCategory)} · ${esc(r.address.city)}</p>${statusChip(r.status)}</div><p class="mt-1 text-sm text-slateInk/70">${esc(r.description)}</p><a class="mt-3 inline-block text-uiBlue font-semibold" href="#/request/${r.id}">Ver detalle</a></article>`).join('') || '<p>Sin solicitudes.</p>'}</div></section>`;
}

function requestParticipants(req) {
  const ids = [req.clientId, req.assigned.engineerId, ...req.assigned.technicianIds, req.assigned.transporterId].filter(Boolean);
  return storage.users.filter((u) => ids.includes(u.id));
}

function renderTimeline(req) {
  return `<ol class="timeline">${req.timeline.map((t) => `<li><div class="timeline-dot"></div><div><p class="font-semibold">${esc(STATUS_LABEL[t.status] || t.status)}</p><p class="text-sm text-slateInk/70">${esc(t.note || '')}</p><p class="text-xs text-slateInk/50">${formatDate(t.at)}</p></div></li>`).join('')}</ol>`;
}

function renderRequestDetail(id, dashboard = false) {
  if (!ensureAuth()) return '';
  const req = storage.requests.find((r) => r.id === id);
  if (!req) return '<p>Solicitud no encontrada.</p>';
  const user = getCurrentUser();
  const canClientActions = user.role === 'cliente' && req.clientId === user.id;
  const base = dashboard ? `#/dashboard/request/${id}` : `#/request/${id}`;
  return `<section class="grid gap-6 lg:grid-cols-3"><article class="lg:col-span-2 rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><div class="flex items-center justify-between"><h2 class="text-2xl font-semibold">Solicitud ${esc(id.slice(-6))}</h2>${statusChip(req.status)}</div><p class="mt-2 text-slateInk/70">${esc(req.description)}</p><div class="mt-3 grid grid-cols-4 gap-2">${req.photos.map((p) => `<img src="${p}" alt="evidencia" class="h-20 w-full rounded-xl object-cover"/>`).join('')}</div><div class="mt-4 flex flex-wrap gap-2"><a href="${base}/chat" class="rounded-xl border border-slate-200 px-3 py-2">Chat</a>${canClientActions ? `<a href="#/request/${id}/schedule" class="rounded-xl border border-slate-200 px-3 py-2">Agenda</a><a href="#/request/${id}/payment" class="rounded-xl border border-slate-200 px-3 py-2">Pago</a><a href="#/request/${id}/review" class="rounded-xl border border-slate-200 px-3 py-2">Reseña</a><a href="#/request/${id}/dispute" class="rounded-xl border border-slate-200 px-3 py-2">Reclamo</a>` : ''}</div><div class="mt-6">${renderTimeline(req)}</div></article><aside class="rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><h3 class="font-semibold">Asignados</h3><div class="mt-3 space-y-2">${requestParticipants(req).map((u) => `<div class="rounded-xl bg-haze p-3"><p class="font-semibold">${esc(u.name)}</p><p class="text-xs">${esc(u.role)} · ⭐ ${esc(u.rating)}</p></div>`).join('') || '<p class="text-sm text-slateInk/70">Sin asignar.</p>'}</div></aside></section>`;
}

function renderInbox() {
  if (!ensureAuth()) return '';
  const user = getCurrentUser();
  const list = storage.requests.filter((r) => r.address.city === user.city && (r.status === STATUS.posted || r.status === STATUS.additional_techs_needed || (user.role === 'transportista' && r.requiresTransport && !r.assigned.transporterId)));
  const taken = list.filter((r)=>r.assigned.engineerId||r.assigned.technicianIds.length).length; return `<section><h2 class="text-3xl font-semibold">Inbox / Viajes ${esc(user.role)}</h2><p class="text-sm text-slateInk/70 mt-1">Casos con asignación parcial: ${taken}</p><div class="mt-5 space-y-3">${list.map((r) => `<article class="rounded-2xl bg-white/85 p-4 ring-1 ring-slate-200/80 shadow-card"><p class="font-semibold">${esc(r.serviceCategory)} · ${esc(r.address.city)}</p><p class="text-sm">${esc(r.description)}</p><div class="mt-3 flex gap-2"><a class="rounded-xl border px-3 py-2" href="#/dashboard/request/${r.id}">Detalle</a>${user.role === 'ingeniero' ? `<button data-act="take-engineer" data-id="${r.id}" class="rounded-xl bg-uiBlue px-3 py-2 text-white">Tomar caso</button><button data-act="need-techs" data-id="${r.id}" class="rounded-xl border px-3 py-2">+ Técnicos</button>` : ''}${user.role === 'tecnico' ? `<button data-act="take-tech" data-id="${r.id}" class="rounded-xl bg-uiBlue px-3 py-2 text-white">Aceptar caso</button>` : ''}${user.role === 'transportista' ? `<button data-act="take-transporter" data-id="${r.id}" class="rounded-xl bg-uiBlue px-3 py-2 text-white">Aceptar viaje</button>` : ''}</div></article>`).join('') || '<p>Sin elementos.</p>'}</div></section>`;
}

function renderDashboard() {
  if (!ensureAuth()) return '';
  const u = getCurrentUser();
  return `<section class="rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-3xl font-semibold">Panel ${esc(u.role)}</h2><div class="mt-4 flex gap-3"><a class="rounded-xl border px-3 py-2" href="#/dashboard/inbox">Inbox / Viajes</a><a class="rounded-xl border px-3 py-2" href="#/dashboard/transport">Transporte</a></div></section>`;
}

function renderSchedule(id) {
  if (!ensureAuth()) return '';
  return `<section class="mx-auto max-w-xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-2xl font-semibold">Agenda consulta</h2><form id="schedule-form" data-id="${id}" class="mt-4 grid gap-3"><input required name="date" type="date" class="rounded-xl border p-2"/><select name="timeWindow" class="rounded-xl border p-2"><option>09:00-11:00</option><option>12:00-14:00</option><option>16:00-18:00</option></select><button class="rounded-xl bg-uiBlue px-4 py-2 text-white">Guardar agenda</button></form></section>`;
}

function renderPayment(id) {
  const req = storage.requests.find((r) => r.id === id);
  if (!req) return '<p>No encontrada.</p>';
  return `<section class="mx-auto max-w-xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-2xl font-semibold">Pago de consulta</h2><p class="mt-2">Monto: <strong>${formatMoney(req.consultFee)}</strong></p><p class="text-sm text-slateInk/70">Estado actual: ${esc(STATUS_LABEL[req.status]||req.status)}</p><form id="payment-form" data-id="${id}" class="mt-4 grid gap-3"><select name="method" class="rounded-xl border p-2"><option>Tarjeta</option><option>OXXO</option><option>Transferencia</option></select><button class="rounded-xl bg-uiBlue px-4 py-2 text-white">Pagar ahora</button></form></section>`;
}

function renderChat(id, dashboard = false) {
  const req = storage.requests.find((r) => r.id === id);
  if (!req) return '<p>No encontrada.</p>';
  const msgs = storage.messages.filter((m) => m.requestId === id);
  const user = getCurrentUser();
  const back = dashboard ? `#/dashboard/request/${id}` : `#/request/${id}`;
  return `<section class="mx-auto max-w-3xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><div class="flex items-center justify-between"><h2 class="text-2xl font-semibold">Chat grupal</h2><a href="${back}">Volver</a></div><div class="chat-box mt-4">${msgs.map((m) => `<div class="chat-msg ${m.userId === user.id ? 'me' : ''}"><p>${esc(m.text)}</p><span>${esc(m.userName)} · visto</span></div>`).join('') || '<p class="text-sm text-slateInk/70">Sin mensajes aún.</p>'}</div><form id="chat-form" data-id="${id}" class="mt-3 flex gap-2"><input name="text" required class="flex-1 rounded-xl border p-2" placeholder="Escribe un mensaje al grupo"/><button class="rounded-xl bg-uiBlue px-4 text-white">Enviar</button></form></section>`;
}

function renderStatusPage(id) {
  const req = storage.requests.find((r) => r.id === id);
  if (!req) return '<p>No encontrada.</p>';
  const opts = [STATUS.pickup_planned, STATUS.on_the_way, STATUS.arrived, STATUS.working, STATUS.completed, STATUS.awaiting_review, STATUS.closed];
  return `<section class="mx-auto max-w-xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-2xl font-semibold">Actualizar estado</h2><form id="status-form" data-id="${id}" class="mt-4 grid gap-3"><select name="status" class="rounded-xl border p-2">${opts.map((s) => `<option value="${s}">${esc(STATUS_LABEL[s])}</option>`).join('')}</select><button class="rounded-xl bg-uiBlue px-4 py-2 text-white">Actualizar</button></form></section>`;
}

function renderReview(id) {
  const req = storage.requests.find((r) => r.id === id);
  if (!req) return '<p>No encontrada.</p>';
  const techIds = [req.assigned.engineerId, ...req.assigned.technicianIds].filter(Boolean);
  const techs = storage.users.filter((u) => techIds.includes(u.id));
  return `<section class="mx-auto max-w-2xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-2xl font-semibold">Reseñas (1-5) y favoritos</h2><form id="review-form" data-id="${id}" class="mt-4 space-y-3">${techs.map((t) => `<div class="rounded-xl border p-3"><p class="font-semibold">${esc(t.name)} (${esc(t.role)})</p><label>Rating <input type="number" name="rating_${t.id}" min="1" max="5" value="5" class="ml-2 w-16 rounded border p-1"/></label><label class="ml-4"><input type="checkbox" name="fav_${t.id}"/> Favorito</label></div>`).join('')}<textarea name="comment" class="w-full rounded-xl border p-2" placeholder="Comentario"></textarea><button class="rounded-xl bg-uiBlue px-4 py-2 text-white">Guardar reseña</button></form></section>`;
}

function renderDispute(id) {
  return `<section class="mx-auto max-w-2xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-2xl font-semibold">Abrir reclamo</h2><form id="dispute-form" data-id="${id}" class="mt-4 grid gap-3"><input name="reason" required placeholder="Motivo" class="rounded-xl border p-2"/><textarea name="description" required class="rounded-xl border p-2" placeholder="Describe el problema"></textarea><select name="severity" class="rounded-xl border p-2"><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select><input type="file" name="evidence" multiple accept="image/*" class="rounded-xl border p-2"/><button class="rounded-xl bg-uiBlue px-4 py-2 text-white">Enviar reclamo</button></form></section>`;
}

function renderAccount() {
  const u = getCurrentUser();
  return `<section class="mx-auto max-w-xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-2xl font-semibold">Cuenta</h2><p class="mt-2">${esc(u.name)} · ${esc(u.role)}</p><a href="#/account/favorites" class="mt-4 inline-block rounded-xl border px-3 py-2">Favoritos</a> <a href="#/account/settings" class="mt-4 inline-block rounded-xl border px-3 py-2">Ajustes</a></section>`;
}
function renderFavorites() {
  const u = getCurrentUser();
  const list = storage.users.filter((x) => (u.favorites || []).includes(x.id));
  return `<section><h2 class="text-2xl font-semibold">Favoritos</h2>${list.map((l) => `<p>${esc(l.name)}</p>`).join('') || '<p>Sin favoritos.</p>'}</section>`;
}
function renderSettings() {
  const u = getCurrentUser();
  return `<section class="mx-auto max-w-xl rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card"><h2 class="text-2xl font-semibold">Ajustes</h2><form id="settings-form" class="mt-4"><label><input type="checkbox" name="hasVehicle" ${u.hasVehicle ? 'checked' : ''}/> Tengo vehículo</label><button class="ml-3 rounded-xl bg-uiBlue px-3 py-1 text-white">Guardar</button></form></section>`;
}

function renderRoute() {
  const app = qs('#app');
  const { path, params } = parseHash();
  const routes = [
    ['/', () => renderHome()], ['/services', () => renderServices()], ['/auth/login', () => renderLogin()], ['/requests', () => renderRequests()], ['/request/new', () => renderRequestNew(params)], ['/dashboard', () => renderDashboard()], ['/dashboard/inbox', () => renderInbox()], ['/dashboard/transport', () => renderInbox()], ['/account', () => renderAccount()], ['/account/favorites', () => renderFavorites()], ['/account/settings', () => renderSettings()],
  ];
  for (const [p, fn] of routes) if (path === p) { app.innerHTML = fn(); bindEvents(); return; }
  const dyn = [
    ['/request/:id', ({ id }) => renderRequestDetail(id)], ['/request/:id/chat', ({ id }) => renderChat(id)], ['/request/:id/schedule', ({ id }) => renderSchedule(id)], ['/request/:id/payment', ({ id }) => renderPayment(id)], ['/request/:id/review', ({ id }) => renderReview(id)], ['/request/:id/dispute', ({ id }) => renderDispute(id)], ['/dashboard/request/:id', ({ id }) => renderRequestDetail(id, true)], ['/dashboard/request/:id/chat', ({ id }) => renderChat(id, true)], ['/dashboard/request/:id/status', ({ id }) => renderStatusPage(id)],
  ];
  for (const [pat, fn] of dyn) {
    const match = routeMatch(path, pat);
    if (match) { app.innerHTML = fn(match); bindEvents(); return; }
  }
  app.innerHTML = '<p>Ruta no encontrada.</p>';
  bindEvents();
}

function updateRequest(id, cb) {
  storage.requests = storage.requests.map((r) => (r.id === id ? cb({ ...r }) : r));
}

function filesToDataUrls(files) {
  return Promise.all([...files].slice(0, 4).map((f) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(f);
  })));
}

function bindEvents() {
  renderHeaderControls();

  qsa('[data-login]').forEach((b) => b.onclick = () => {
    const user = storage.users.find((u) => u.id === b.dataset.login);
    storage.currentUser = user;
    storage.session = { loggedIn: true, role: user.role, userId: user.id };
    navTo((state.redirectAfterLogin || '#/').replace('#', ''));
    state.redirectAfterLogin = null;
  });

  qs('#dev-role')?.addEventListener('change', (e) => {
    const role = e.target.value;
    const user = storage.users.find((u) => u.role === role);
    if (user) {
      storage.currentUser = user;
      storage.session = { loggedIn: true, role: user.role, userId: user.id };
      uiToast(`Rol activo: ${role}`);
      renderRoute();
    }
  });

  qsa('[data-logout]').forEach((b) => b.onclick = () => { storage.session = { loggedIn: false }; storage.currentUser = null; navTo('/'); });

  qs('input[name="photos"]')?.addEventListener('change', async (e) => {
    const preview = qs('#photo-preview');
    const urls = await filesToDataUrls(e.target.files);
    e.target.dataset.urls = JSON.stringify(urls);
    preview.innerHTML = urls.map((u) => `<img src="${u}" class="h-16 w-full rounded-xl object-cover" alt="preview"/>`).join('');
  });

  qs('#request-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const photosInput = qs('input[name="photos"]', e.currentTarget);
    const photos = photosInput?.files?.length ? await filesToDataUrls(photosInput.files) : [];
    const req = createRequest({
      clientId: getCurrentUser().id,
      serviceCategory: fd.get('serviceCategory'),
      description: fd.get('description'),
      photos,
      address: { city: fd.get('city'), addressText: fd.get('addressText') },
      requiresTransport: !!fd.get('requiresTransport'),
      vehicleNeeded: !!fd.get('requiresTransport'),
    });
    uiToast('Solicitud publicada');
    navTo(`/request/${req.id}`);
  });

  qsa('[data-act]').forEach((b) => b.onclick = () => {
    const id = b.dataset.id;
    const act = b.dataset.act;
    const u = getCurrentUser();
    uiModalConfirm('¿Confirmas esta acción?', () => {
      if (act === 'take-engineer') updateRequest(id, (r) => addTimeline({ ...r, assigned: { ...r.assigned, engineerId: u.id } }, STATUS.engineer_accepted, 'Ingeniero asignado'));
      if (act === 'take-tech') updateRequest(id, (r) => addTimeline({ ...r, assigned: { ...r.assigned, technicianIds: [...new Set([...r.assigned.technicianIds, u.id])] } }, STATUS.technician_accepted, 'Técnico aceptó caso'));
      if (act === 'need-techs') updateRequest(id, (r) => addTimeline({ ...r, assigned: { ...r.assigned, additionalTechSlots: (r.assigned.additionalTechSlots || 0) + 2 } }, STATUS.additional_techs_needed, 'Se requieren 2 técnicos extra'));
      if (act === 'take-transporter') updateRequest(id, (r) => addTimeline({ ...r, assigned: { ...r.assigned, transporterId: u.id } }, STATUS.pickup_planned, 'Transportista asignado'));
      closeModal();
      renderRoute();
    });
  });

  qs('#schedule-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    const fd = new FormData(e.currentTarget);
    updateRequest(id, (r) => addTimeline({ ...r, schedule: { date: fd.get('date'), timeWindow: fd.get('timeWindow') } }, STATUS.consult_scheduled, 'Consulta agendada'));
    updateRequest(id, (r) => addTimeline(r, STATUS.consult_payment_pending, 'Pago pendiente'));
    uiToast('Agenda guardada');
    navTo(`/request/${id}/payment`);
  });

  qs('#payment-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    const method = new FormData(e.currentTarget).get('method');
    storage.payments = [{ id: uid('pay'), requestId: id, method, amount: 500, createdAt: now(), status: 'paid' }, ...storage.payments];
    updateRequest(id, (r) => addTimeline({ ...r, consultPaid: true }, STATUS.consult_paid, 'Pago de consulta recibido'));
    updateRequest(id, (r) => addTimeline(r, STATUS.chat_opened, 'Chat habilitado'));
    uiToast('Pago confirmado');
    navTo(`/request/${id}/chat`);
  });

  qs('#chat-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    const text = new FormData(e.currentTarget).get('text');
    const u = getCurrentUser();
    storage.messages = [...storage.messages, { id: uid('msg'), requestId: id, userId: u.id, userName: u.name, text, createdAt: now() }];
    renderRoute();
  });

  qs('#status-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    const status = new FormData(e.currentTarget).get('status');
    updateRequest(id, (r) => addTimeline(r, status, `Estado actualizado a ${STATUS_LABEL[status]}`));
    if (status === STATUS.completed) updateRequest(id, (r) => addTimeline(r, STATUS.awaiting_review, 'Esperando reseña del cliente'));
    uiToast('Estado actualizado');
    navTo(`/dashboard/request/${id}`);
  });

  qs('#review-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    const fd = new FormData(e.currentTarget);
    const req = storage.requests.find((r) => r.id === id);
    const client = getCurrentUser();
    const targets = [req.assigned.engineerId, ...req.assigned.technicianIds].filter(Boolean);
    const reviews = targets.map((t) => ({ id: uid('rv'), requestId: id, targetUserId: t, clientId: client.id, rating: Number(fd.get(`rating_${t}`) || 5), favorite: !!fd.get(`fav_${t}`), comment: fd.get('comment'), createdAt: now() }));
    storage.reviews = [...reviews, ...storage.reviews];
    storage.users = storage.users.map((u) => (u.id === client.id ? { ...u, favorites: [...new Set([...(u.favorites || []), ...reviews.filter((r) => r.favorite).map((r) => r.targetUserId)])] } : u));
    updateRequest(id, (r) => addTimeline(r, STATUS.closed, 'Solicitud cerrada y reseñada'));
    uiToast('Reseña guardada');
    navTo('/requests');
  });

  qs('#dispute-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    const fd = new FormData(e.currentTarget);
    const files = e.currentTarget.querySelector('input[name="evidence"]').files;
    const evidencePhotos = files.length ? await filesToDataUrls(files) : [];
    const outcome = fd.get('severity') === 'high' ? 'refund' : 'fix';
    const dispute = { id: uid('dsp'), requestId: id, clientId: getCurrentUser().id, reason: fd.get('reason'), description: fd.get('description'), evidencePhotos, severity: fd.get('severity'), outcome, status: 'resolved' };
    storage.disputes = [dispute, ...storage.disputes];
    updateRequest(id, (r) => addTimeline(r, STATUS.dispute_opened, 'Reclamo abierto'));
    updateRequest(id, (r) => addTimeline(r, STATUS.dispute_reviewing, 'Reclamo en revisión'));
    if (outcome === 'refund') updateRequest(id, (r) => addTimeline(r, STATUS.refund_issued, 'Reembolso emitido (mock)'));
    updateRequest(id, (r) => addTimeline(r, STATUS.resolved, `Reclamo resuelto: ${outcome}`));
    uiToast('Reclamo enviado y resuelto (mock)');
    navTo(`/request/${id}`);
  });

  qs('#settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const hasVehicle = !!new FormData(e.currentTarget).get('hasVehicle');
    const u = getCurrentUser();
    storage.users = storage.users.map((x) => (x.id === u.id ? { ...x, hasVehicle } : x));
    storage.currentUser = storage.users.find((x) => x.id === u.id);
    uiToast('Ajustes guardados');
  });

  qs('#modal-root')?.addEventListener('click', (e) => {
    if (e.target.matches('[data-modal-cancel]')) closeModal();
    if (e.target.matches('[data-modal-confirm]') && state.modalAction) state.modalAction();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  ensureSession();
  if (!location.hash) navTo('/');
  renderRoute();
  window.addEventListener('hashchange', renderRoute);
});

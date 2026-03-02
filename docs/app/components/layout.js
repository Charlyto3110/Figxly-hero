import { store } from '../store.js';

export function renderInternalLayout(title, body, back = '#/') {
  return `<section class="space-y-4">
    <div class="flex items-center justify-between">
      <a href="${back}" class="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slateInk/80">← Volver</a>
      <span class="text-xs font-medium text-slateInk/55">Ruta interna</span>
    </div>
    <article class="rounded-3xl bg-white/90 p-6 ring-1 ring-slate-200/80 shadow-card">
      <h2 class="text-2xl font-semibold text-slateInk">${title}</h2>
      <div class="mt-4">${body}</div>
    </article>
  </section>`;
}

export function renderAuthArea() {
  const auth = store.getAuth();
  if (!auth.loggedIn) {
    return `<a href="#/auth/login" class="auth-link">Entrar</a><a href="#/auth/register" class="auth-btn">Crear cuenta</a>`;
  }
  return `<div class="relative"><button id="account-btn" class="account-btn"><span class="account-avatar">${auth.user.name.slice(0, 2).toUpperCase()}</span><span>${auth.user.name}</span></button><div id="account-menu" class="account-menu hidden"><button data-role="cliente" class="dd-item">Cliente</button><button data-role="ingeniero" class="dd-item">Ingeniero/Técnico</button><button data-role="transportista" class="dd-item">Transportista</button><button id="logout-btn" class="dd-item text-coral">Cerrar sesión</button></div></div>`;
}

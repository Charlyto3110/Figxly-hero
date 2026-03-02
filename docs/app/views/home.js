import { services } from '../data/services.js';
import { store } from '../store.js';

export function renderHome() {
  const last = store.getLastSearch();
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
      <div class="mt-10 flex flex-wrap items-start gap-7 sm:gap-8">${services.map((c) => `<button data-service="${c.slug}" class="cat-card"><div class="cat-avatar"><div class="cat-ph" style="display:block"><div class="cat-ph-bg"></div><div class="cat-ph-icon text-2xl">${c.icon}</div></div></div><div class="cat-label">${c.label}</div></button>`).join('')}</div>
      <div class="mt-10 flex flex-wrap gap-5">${services.slice(0, 4).map((c) => `<button class="big-pill" data-service="${c.slug}"><span class="big-pill-ic">${c.icon}</span><span class="big-pill-tx">${c.label}</span></button>`).join('')}</div>
    </div>
    <div class="relative"><img src="./assets/phone-mock.png" alt="Vista previa de la app Figxly" class="phone-img block w-full max-w-[520px] lg:max-w-[560px] translate-x-6 lg:translate-x-8 rotate-[10deg] rounded-[42px] shadow-float" /></div>
  </section>`;
}

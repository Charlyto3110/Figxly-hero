import { pros } from '../data/pros.js';
import { renderInternalLayout } from '../components/layout.js';

export function renderResults(params) {
  const min = Number(params.get('rating') || 0);
  const service = params.get('service') || '';
  const filtered = pros.filter((p) => p.rating >= min && (!service || p.service === service));
  return renderInternalLayout('Profesionales disponibles', `<form id="results-filters" class="mb-4 grid gap-3 sm:grid-cols-3"><input name="service" value="${service}" placeholder="Servicio" class="rounded-xl border border-slate-200 p-2" /><select name="rating" class="rounded-xl border border-slate-200 p-2 bg-white"><option value="0">Rating</option><option value="4" ${min===4?'selected':''}>4+</option><option value="4.5" ${min===4.5?'selected':''}>4.5+</option></select><button class="rounded-xl bg-haze px-3 py-2 font-semibold text-uiBlue">Filtrar</button></form><div class="space-y-3">${filtered.map((p) => `<article class="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><div class="flex justify-between"><h3 class="font-semibold">${p.name}</h3><span>⭐ ${p.rating}</span></div><p class="text-sm text-slateInk/70">${p.city} · ${p.distanceKm} km · ${p.availability}</p><a href="#/pro/${p.id}" class="mt-3 inline-block rounded-xl bg-uiBlue px-4 py-2 text-sm font-semibold text-white">Ver perfil</a></article>`).join('')}</div>`, '#/search');
}

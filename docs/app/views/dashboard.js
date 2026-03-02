import { renderInternalLayout } from '../components/layout.js';
import { store } from '../store.js';

export function renderDashboard() {
  const role = store.getRole();
  const jobs = store.getJobs();
  const cards = jobs.map((j) => `<article class="rounded-2xl border border-slate-200 p-3"><p class="font-semibold">Job ${j.id.slice(-6)} · ${j.status}</p><p class="text-sm text-slateInk/70">${j.date || ''} ${j.time || ''}</p><div class="mt-2 flex flex-wrap gap-2">${role !== 'cliente' ? `<button data-accept-job="${j.id}" class="rounded-lg bg-haze px-3 py-1 text-xs font-semibold text-uiBlue">Aceptar</button><button data-next-job="${j.id}" class="rounded-lg bg-haze px-3 py-1 text-xs font-semibold text-uiBlue">Siguiente estado</button><a href="#/job/${j.id}/quote" class="rounded-lg bg-uiBlue px-3 py-1 text-xs font-semibold text-white">Crear presupuesto</a>` : `<a href="#/job/${j.id}/quote" class="rounded-lg bg-haze px-3 py-1 text-xs font-semibold text-uiBlue">Ver presupuesto</a><a href="#/claims/${j.id}" class="rounded-lg bg-haze px-3 py-1 text-xs font-semibold text-uiBlue">Reclamo</a><a href="#/review/${j.id}" class="rounded-lg bg-coral px-3 py-1 text-xs font-semibold text-white">Reseñar</a>`}</div></article>`).join('') || '<p>Sin solicitudes aún.</p>';

  return renderInternalLayout('Dashboard', `<label class="text-sm">Rol demo<select id="role-switch" class="ml-2 rounded-xl border border-slate-200 p-2 bg-white"><option value="cliente" ${role==='cliente'?'selected':''}>Cliente</option><option value="ingeniero" ${role==='ingeniero'?'selected':''}>Ingeniero/Técnico</option><option value="transportista" ${role==='transportista'?'selected':''}>Transportista</option></select></label><div class="mt-4 space-y-3">${cards}</div><div class="mt-4 rounded-xl bg-haze p-3 text-sm">Chat placeholder: próximamente.</div>`, '#/');
}

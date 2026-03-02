import { services } from '../data/services.js';
import { renderInternalLayout } from '../components/layout.js';
import { store } from '../store.js';

export function renderSearch(params) {
  const draft = store.getDraftRequest();
  const service = params.get('service') || draft.service || services[0].slug;
  return renderInternalLayout('Describe tu necesidad', `<form id="request-form" class="space-y-3"><label class="block text-sm">Servicio<select name="service" class="mt-1 w-full rounded-xl border border-slate-200 p-2 bg-white">${services.map((s) => `<option value="${s.slug}" ${s.slug===service?'selected':''}>${s.label}</option>`).join('')}</select></label><textarea name="description" required rows="4" class="w-full rounded-xl border border-slate-200 p-3" placeholder="¿Qué necesitas resolver?">${draft.description || ''}</textarea><label class="block text-sm">Fotos<input name="photos" type="file" multiple accept="image/*" class="mt-1 w-full rounded-xl border border-slate-200 p-2" /></label><button class="rounded-xl bg-uiBlue px-4 py-3 font-semibold text-white">Guardar y continuar</button></form>`, '#/');
}

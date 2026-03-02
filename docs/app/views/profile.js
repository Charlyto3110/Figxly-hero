import { pros } from '../data/pros.js';
import { renderInternalLayout } from '../components/layout.js';

export function renderProfile(id) {
  const pro = pros.find((p) => p.id === id);
  if (!pro) return renderInternalLayout('Perfil', '<p>No encontrado.</p>', '#/results');
  return renderInternalLayout(pro.name, `<p class="text-slateInk/70">${pro.bio}</p><p class="mt-2">⭐ ${pro.rating} · ${pro.city}</p><p class="mt-2 text-sm">Certificaciones: ${pro.certs.join(', ')}</p><ul class="mt-3 list-disc pl-5 text-sm">${pro.reviews.map((r) => `<li>${r}</li>`).join('')}</ul><a href="#/schedule/${pro.id}" class="mt-4 inline-block rounded-xl bg-coral px-4 py-3 font-semibold text-white">Agendar cita</a>`, '#/results');
}

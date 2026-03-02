import { renderInternalLayout } from '../components/layout.js';

export function renderSchedule(id) {
  return renderInternalLayout('Agenda de consulta ($500)', `<form id="schedule-form" data-pro-id="${id}" class="grid gap-3 sm:grid-cols-2"><input name="date" required type="date" class="rounded-xl border border-slate-200 p-2" /><select name="time" class="rounded-xl border border-slate-200 p-2 bg-white"><option>09:00</option><option>12:00</option><option>17:00</option></select><button class="sm:col-span-2 rounded-xl bg-uiBlue px-4 py-3 font-semibold text-white">Confirmar cita</button></form>`, `#/pro/${id}`);
}

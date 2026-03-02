import { renderInternalLayout } from '../components/layout.js';
import { store } from '../store.js';
import { calculateQuote, renderCostGeneratorUI } from '../../modules/cost-generator/index.js';

export function renderQuote(jobId) {
  const job = store.getJobs().find((j) => j.id === jobId);
  const rubro = job?.service || 'plomeria';
  const draft = store.getQuoteDrafts()[jobId] || { activities: [], extras: [] };
  const calc = calculateQuote(draft);
  return renderInternalLayout(`Presupuesto Job ${jobId.slice(-6)}`, `<form id="quote-form" data-job-id="${jobId}">${renderCostGeneratorUI(rubro, draft)}<div class="cost-breakdown mt-4 rounded-xl bg-haze p-3"><p>Subtotal actividades: $${calc.subtotalActivities}</p><p>Subtotal extras: $${calc.subtotalExtras}</p><p class="font-semibold">Total: $${calc.total}</p></div><div class="mt-4 flex flex-wrap gap-2"><button name="action" value="save" class="rounded-xl bg-haze px-4 py-2 font-semibold text-uiBlue">Guardar borrador</button><button name="action" value="send" class="rounded-xl bg-uiBlue px-4 py-2 font-semibold text-white">Enviar presupuesto</button>${job?.quoteStatus==='sent' ? '<button name="action" value="accept" class="rounded-xl bg-coral px-4 py-2 font-semibold text-white">Aceptar (cliente)</button><button name="action" value="reject" class="rounded-xl border border-slate-200 px-4 py-2 font-semibold">Rechazar</button>' : ''}</div></form>`, '#/dashboard');
}

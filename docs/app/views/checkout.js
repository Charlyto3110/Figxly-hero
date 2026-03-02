import { renderInternalLayout } from '../components/layout.js';

export function renderCheckout(jobId, params) {
  const finalType = params.get('type') === 'final';
  return renderInternalLayout(`Checkout ${finalType ? 'pago final' : 'consulta'}`, `<form id="pay-form" data-job-id="${jobId}" data-type="${finalType ? 'final' : 'consultation'}" class="grid gap-3 sm:grid-cols-2"><select name="method" class="rounded-xl border border-slate-200 p-2 bg-white"><option>Tarjeta</option><option>Apple Pay</option><option>Google Pay</option></select><input required name="holder" placeholder="Titular" class="rounded-xl border border-slate-200 p-2" /><div class="sm:col-span-2 rounded-xl bg-haze p-3 font-semibold">Monto: ${finalType ? 'Total de presupuesto' : '$500 MXN'}</div><button class="sm:col-span-2 rounded-xl bg-coral px-4 py-3 font-semibold text-white">Pagar</button></form>`, '#/dashboard');
}

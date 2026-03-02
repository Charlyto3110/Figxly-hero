import { getActivity } from './catalog.js';

export function calculateQuote({ activities = [], extras = [] }) {
  const activityRows = activities.map((a) => {
    const base = getActivity(a.activityId);
    const qty = Number(a.qty || 0);
    const total = qty * Number(base?.precio_unitario_base || 0);
    return { ...a, base, total };
  });
  const extraRows = extras.map((e) => ({ ...e, total: Number(e.qty || 0) * Number(e.unitPrice || 0) }));
  const subtotalActivities = activityRows.reduce((acc, r) => acc + r.total, 0);
  const subtotalExtras = extraRows.reduce((acc, r) => acc + r.total, 0);
  return { activityRows, extraRows, subtotalActivities, subtotalExtras, total: subtotalActivities + subtotalExtras };
}

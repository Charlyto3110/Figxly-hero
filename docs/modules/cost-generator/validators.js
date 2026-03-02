export function validateExtras(extras) {
  const invalid = extras.filter((e) => (Number(e.qty) > 0 || Number(e.unitPrice) > 0) && !e.evidence);
  return { ok: invalid.length === 0, invalid };
}

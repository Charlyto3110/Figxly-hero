const mk = (rubro, n, unit, price, dur) => ({ id: `${rubro}-${n}` , rubro, nombre: `${rubro} actividad ${n}`, unidad: unit, precio_unitario_base: price, incluye: 'Mano de obra estándar', duracion_estimada_min: dur });

const units = ['pza','ml','m2','h'];
const rubros = ['plomeria','electricidad','cerrajeria','albanileria'];

export const catalog = rubros.flatMap((r) => Array.from({ length: 10 }, (_, i) => mk(r, i + 1, units[i % units.length], 180 + (i * 35), 30 + i * 10)));

export const byRubro = (rubro) => catalog.filter((a) => a.rubro === rubro);
export const getActivity = (id) => catalog.find((a) => a.id === id);

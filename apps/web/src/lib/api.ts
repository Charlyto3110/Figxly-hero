const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, credentials: 'include' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

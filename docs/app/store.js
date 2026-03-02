const KEYS = {
  auth: 'figxly.auth',
  returnTo: 'figxly.returnTo',
  draftRequest: 'figxly.draftRequest',
  jobs: 'figxly.jobs',
  reviews: 'figxly.reviews',
  claims: 'figxly.claims',
  role: 'figxly.role',
  quoteDrafts: 'figxly.quoteDrafts',
  timeline: 'figxly.timeline',
  lastSearch: 'figxly.lastSearch',
};

const read = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const store = {
  keys: KEYS,
  getAuth: () => read(KEYS.auth, { loggedIn: false, token: '', user: null }),
  setAuth: (value) => write(KEYS.auth, value),
  clearAuth: () => localStorage.removeItem(KEYS.auth),
  getRole: () => read(KEYS.role, 'cliente'),
  setRole: (value) => write(KEYS.role, value),
  getDraftRequest: () => read(KEYS.draftRequest, {}),
  setDraftRequest: (value) => write(KEYS.draftRequest, value),
  getJobs: () => read(KEYS.jobs, []),
  setJobs: (value) => write(KEYS.jobs, value),
  upsertJob: (job) => {
    const jobs = read(KEYS.jobs, []);
    const idx = jobs.findIndex((j) => j.id === job.id);
    if (idx >= 0) jobs[idx] = job;
    else jobs.unshift(job);
    write(KEYS.jobs, jobs);
    return job;
  },
  getReviews: () => read(KEYS.reviews, []),
  setReviews: (value) => write(KEYS.reviews, value),
  getClaims: () => read(KEYS.claims, []),
  setClaims: (value) => write(KEYS.claims, value),
  getQuoteDrafts: () => read(KEYS.quoteDrafts, {}),
  setQuoteDrafts: (value) => write(KEYS.quoteDrafts, value),
  getLastSearch: () => read(KEYS.lastSearch, {}),
  setLastSearch: (value) => write(KEYS.lastSearch, value),
  setReturnTo: (value) => write(KEYS.returnTo, value),
  consumeReturnTo: () => {
    const value = read(KEYS.returnTo, '#/');
    localStorage.removeItem(KEYS.returnTo);
    return value;
  },
};

export const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

(function () {
  const KEYS = {
    users: 'figxly_users',
    session: 'figxly_session',
    currentUser: 'figxly_current_user',
    requests: 'figxly_requests',
    messages: 'figxly_messages',
    payments: 'figxly_payments',
    reviews: 'figxly_reviews',
    disputes: 'figxly_disputes',
  };

  const STATUS = {
    draft: 'draft',
    posted: 'posted',
    engineer_accepted: 'engineer_accepted',
    technician_accepted: 'technician_accepted',
    additional_techs_needed: 'additional_techs_needed',
    techs_confirmed: 'techs_confirmed',
    consult_scheduled: 'consult_scheduled',
    consult_payment_pending: 'consult_payment_pending',
    consult_paid: 'consult_paid',
    chat_opened: 'chat_opened',
    pickup_planned: 'pickup_planned',
    on_the_way: 'on_the_way',
    arrived: 'arrived',
    working: 'working',
    completed: 'completed',
    awaiting_review: 'awaiting_review',
    closed: 'closed',
    dispute_opened: 'dispute_opened',
    dispute_reviewing: 'dispute_reviewing',
    refund_issued: 'refund_issued',
    resolved: 'resolved',
  };

  const STATUS_LABEL = Object.fromEntries(Object.values(STATUS).map((s) => [s, s.replace(/_/g, ' ')]));

  const now = () => new Date().toISOString();
  const uid = (p) => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const services = [
    { slug: 'plomeria', label: 'Plomería', icon: '💧' },
    { slug: 'electricidad', label: 'Electricidad', icon: '⚡' },
    { slug: 'cerrajeria', label: 'Cerrajería', icon: '🔐' },
    { slug: 'albanileria', label: 'Albañilería', icon: '🧱' },
    { slug: 'limpieza', label: 'Limpieza', icon: '✨' },
  ];

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_e) {
      return fallback;
    }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  const storage = {
    get users() { return read(KEYS.users, []); },
    set users(v) { write(KEYS.users, v); },
    get session() { return read(KEYS.session, { loggedIn: false, role: 'cliente' }); },
    set session(v) { write(KEYS.session, v); },
    get currentUser() { return read(KEYS.currentUser, null); },
    set currentUser(v) { v ? write(KEYS.currentUser, v) : localStorage.removeItem(KEYS.currentUser); },
    get requests() { return read(KEYS.requests, []); },
    set requests(v) { write(KEYS.requests, v); },
    get messages() { return read(KEYS.messages, []); },
    set messages(v) { write(KEYS.messages, v); },
    get payments() { return read(KEYS.payments, []); },
    set payments(v) { write(KEYS.payments, v); },
    get reviews() { return read(KEYS.reviews, []); },
    set reviews(v) { write(KEYS.reviews, v); },
    get disputes() { return read(KEYS.disputes, []); },
    set disputes(v) { write(KEYS.disputes, v); },
  };

  function seedUsers() {
    if (storage.users.length) return;
    const users = [
      ['cliente', 'Ana López', 'CDMX', true], ['cliente', 'Luis Pérez', 'Guadalajara', false], ['cliente', 'María Solís', 'Monterrey', false],
      ['ingeniero', 'Ing. Carlos Vega', 'CDMX', true], ['ingeniero', 'Ing. Sofía Ruiz', 'Guadalajara', false], ['ingeniero', 'Ing. Mateo Díaz', 'Monterrey', true],
      ['tecnico', 'Tec. Alan Cruz', 'CDMX', false], ['tecnico', 'Tec. Nora Silva', 'CDMX', true], ['tecnico', 'Tec. Iván Mora', 'Guadalajara', false], ['tecnico', 'Tec. Erika Paz', 'Monterrey', true], ['tecnico', 'Tec. Diego León', 'Puebla', true],
      ['transportista', 'Trans. Rafa Ríos', 'CDMX', true], ['transportista', 'Trans. Elena Paz', 'Guadalajara', true], ['transportista', 'Trans. Omar Núñez', 'Monterrey', true],
    ].map((u, i) => ({
      id: `usr_seed_${i + 1}`,
      role: u[0],
      name: u[1],
      city: u[2],
      hasVehicle: u[3],
      email: `${u[1].toLowerCase().replace(/[^a-z]+/g, '.')}@figxly.mock`,
      phone: `+52 55 0000 ${1000 + i}`,
      rating: (4 + Math.random()).toFixed(1),
      favorites: [],
    }));
    storage.users = users;
  }

  function ensureSession() {
    seedUsers();
    if (!storage.currentUser) {
      const user = storage.users.find((u) => u.role === 'cliente');
      storage.currentUser = user;
      storage.session = { loggedIn: true, role: user.role, userId: user.id };
    }
  }

  function addTimeline(request, status, note) {
    request.timeline = request.timeline || [];
    request.timeline.push({ status, note: note || STATUS_LABEL[status], at: now() });
    request.status = status;
    return request;
  }

  function createRequest(payload) {
    const req = {
      id: uid('req'),
      createdAt: now(),
      serviceCategory: payload.serviceCategory,
      clientId: payload.clientId,
      description: payload.description,
      photos: payload.photos || [],
      address: payload.address,
      preferredEngineerId: payload.preferredEngineerId || null,
      status: STATUS.posted,
      assigned: { engineerId: null, technicianIds: [], transporterId: null, additionalTechSlots: 0 },
      schedule: { date: '', timeWindow: '' },
      consultFee: 500,
      consultPaid: false,
      requiresTransport: !!payload.requiresTransport,
      vehicleNeeded: !!payload.vehicleNeeded,
      timeline: [{ status: STATUS.posted, note: 'Solicitud publicada', at: now() }],
    };
    storage.requests = [req, ...storage.requests];
    return req;
  }

  window.FIGXLY_DATA = {
    KEYS, STATUS, STATUS_LABEL, services, storage, uid, now,
    ensureSession, addTimeline, createRequest,
  };
})();

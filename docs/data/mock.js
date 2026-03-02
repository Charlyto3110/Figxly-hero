(function () {
  const services = [
    { slug: 'electricidad', label: 'Electricidad', icon: '⚡' },
    { slug: 'plomeria', label: 'Plomería', icon: '💧' },
    { slug: 'cerrajeria', label: 'Cerrajería', icon: '🔐' },
    { slug: 'limpieza', label: 'Limpieza', icon: '✨' },
    { slug: 'pintura', label: 'Pintura', icon: '🎨' },
  ];

  const categories = services.map((s) => ({ slug: s.slug, name: s.label, icon: s.icon }));

  const technicians = [
    { id: 'pro-1', nombre: 'Diana Rojas', servicio: 'plomeria', ciudad: 'Ciudad de México', rating: 4.9, reviewsCount: 210, precioBase: 450, disponibilidad: ['Hoy', 'Mañana', 'Miércoles'], tags: ['Verificado', 'Rápido'], distanciaKm: 2.3, descripcion: 'Especialista en fugas, mantenimiento y presión de agua.', servicios: ['Fugas', 'Instalación de boiler', 'Drenaje'], disponibleHoy: true },
    { id: 'pro-2', nombre: 'Marco Soto', servicio: 'electricidad', ciudad: 'Ciudad de México', rating: 4.8, reviewsCount: 184, precioBase: 520, disponibilidad: ['Hoy', 'Jueves', 'Viernes'], tags: ['Verificado', '24/7'], distanciaKm: 4.1, descripcion: 'Tableros, cortos y modernización de instalaciones eléctricas.', servicios: ['Tablero', 'Cableado', 'Iluminación'], disponibleHoy: true },
    { id: 'pro-3', nombre: 'Lina Pardo', servicio: 'cerrajeria', ciudad: 'Guadalajara', rating: 4.7, reviewsCount: 132, precioBase: 390, disponibilidad: ['Mañana', 'Viernes'], tags: ['Rápido', '24/7'], distanciaKm: 5.2, descripcion: 'Apertura sin daño y cambio de cerraduras de alta seguridad.', servicios: ['Apertura', 'Cambio de chapa', 'Duplicado'], disponibleHoy: false },
    { id: 'pro-4', nombre: 'Jorge Vela', servicio: 'plomeria', ciudad: 'Monterrey', rating: 4.6, reviewsCount: 96, precioBase: 360, disponibilidad: ['Hoy', 'Sábado'], tags: ['Verificado'], distanciaKm: 1.7, descripcion: 'Reparaciones residenciales express con garantía escrita.', servicios: ['Tuberías', 'Lavabos', 'WC'], disponibleHoy: true },
    { id: 'pro-5', nombre: 'Valeria Cruz', servicio: 'limpieza', ciudad: 'Ciudad de México', rating: 4.9, reviewsCount: 302, precioBase: 300, disponibilidad: ['Hoy', 'Mañana'], tags: ['Verificado', 'Rápido'], distanciaKm: 3.4, descripcion: 'Limpieza profunda para casa y oficina con productos eco.', servicios: ['Profunda', 'Mudanza', 'Oficina'], disponibleHoy: true },
  ];

  const reviews = [
    { id: 'r-1', technicianId: 'pro-1', user: 'Paola M.', rating: 5, comment: 'Llegó puntual y resolvió todo en 30 minutos.' },
    { id: 'r-2', technicianId: 'pro-1', user: 'Alex C.', rating: 4, comment: 'Muy profesional y limpio al trabajar.' },
    { id: 'r-3', technicianId: 'pro-2', user: 'Marta P.', rating: 5, comment: 'Excelente en urgencias nocturnas.' },
  ];

  const labelByService = Object.fromEntries(services.map((s) => [s.slug, s.label]));

  function searchTechnicians({ q = '', loc = '', date = '', service = '', minRating = 0, maxPrice = 10000, verifiedOnly = false, todayOnly = false } = {}) {
    const query = q.trim().toLowerCase();
    return technicians
      .filter((t) => {
        const byQuery = !query || `${t.nombre} ${t.servicio} ${t.descripcion} ${t.servicios.join(' ')}`.toLowerCase().includes(query);
        const byLoc = !loc || t.ciudad.toLowerCase().includes(loc.toLowerCase());
        const byService = !service || t.servicio === service;
        const byDate = !date || t.disponibilidad.includes('Hoy') || t.disponibilidad.includes('Mañana');
        const byRating = Number(t.rating) >= Number(minRating || 0);
        const byPrice = Number(t.precioBase) <= Number(maxPrice || 10000);
        const byVerified = !verifiedOnly || t.tags.includes('Verificado');
        const byToday = !todayOnly || t.disponibleHoy;
        return byQuery && byLoc && byService && byDate && byRating && byPrice && byVerified && byToday;
      })
      .map((t) => ({ ...t, servicioLabel: labelByService[t.servicio] || t.servicio }));
  }

  function getTechnician(id) {
    const technician = technicians.find((t) => t.id === id);
    return technician ? { ...technician, servicioLabel: labelByService[technician.servicio] || technician.servicio } : null;
  }

  window.FIGXLY_MOCK = { services, categories, technicians, reviews, searchTechnicians, getTechnician };
})();

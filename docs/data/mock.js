(function () {
  const categories = [
    { slug: 'electricistas', name: 'Electricistas', icon: '⚡' },
    { slug: 'plomeros', name: 'Plomeros', icon: '💧' },
    { slug: 'cerrajeros', name: 'Cerrajeros', icon: '🔐' },
    { slug: 'limpieza', name: 'Limpieza', icon: '✨' },
  ];

  const technicians = [
    { id: 'tec-1', name: 'Diana Rojas', category: 'plomeros', rating: 4.9, jobs: 210, city: 'Ciudad de México', price: 450, bio: 'Especialista en fugas, presión de agua y mantenimiento residencial.', image: './assets/tech-1.jpg' },
    { id: 'tec-2', name: 'Marco Soto', category: 'plomeros', rating: 4.7, jobs: 184, city: 'Guadalajara', price: 390, bio: 'Instalaciones rápidas y soporte de urgencia 24/7.', image: './assets/tech-2.jpg' },
    { id: 'tec-3', name: 'Lina Pardo', category: 'electricistas', rating: 4.8, jobs: 260, city: 'Monterrey', price: 520, bio: 'Paneles, cableado y automatización de hogar.', image: './assets/tech-3.jpg' },
    { id: 'tec-4', name: 'Jorge Vela', category: 'cerrajeros', rating: 4.6, jobs: 122, city: 'Ciudad de México', price: 350, bio: 'Apertura sin daño y duplicado de llaves con garantía.', image: './assets/tech-4.jpg' },
  ];

  const reviews = [
    { id: 'r1', technicianId: 'tec-1', user: 'Paola M.', rating: 5, comment: 'Llegó puntual y resolvió todo en 30 minutos.' },
    { id: 'r2', technicianId: 'tec-1', user: 'Alex C.', rating: 4, comment: 'Muy profesional y limpio al trabajar.' },
    { id: 'r3', technicianId: 'tec-2', user: 'Marta P.', rating: 5, comment: 'Excelente en urgencias nocturnas.' },
  ];

  function searchTechnicians({ q = '', loc = '', date = '', category = '' } = {}) {
    const query = q.trim().toLowerCase();
    return technicians.filter((t) => {
      const byCategory = !category || t.category === category;
      const byQuery = !query || `${t.name} ${t.category} ${t.bio}`.toLowerCase().includes(query);
      const byLoc = !loc || t.city.toLowerCase().includes(loc.toLowerCase());
      const byDate = !date || date.length > 0;
      return byCategory && byQuery && byLoc && byDate;
    });
  }

  function getTechnician(id) {
    return technicians.find((t) => t.id === id) || null;
  }

  window.FIGXLY_MOCK = { categories, technicians, reviews, searchTechnicians, getTechnician };
})();

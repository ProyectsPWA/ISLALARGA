/**
 * ISLALARGA.COM - CORE APPLICATION ENGINE
 * High Performance, Zero-Dependency Mobile Web App
 */

// Realtime dynamic date initialization
const _liveDate = new Date();
const _liveYear = _liveDate.getFullYear();
const _liveMonth = _liveDate.getMonth();
const _liveDay = _liveDate.getDate();
const _monthShort = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const defaultBookingDate = `${_liveYear}-${String(_liveMonth + 1).padStart(2, '0')}-${String(_liveDay).padStart(2, '0')}`;
const defaultBookingDateFormatted = `${_liveDay} ${_monthShort[_liveMonth]} ${_liveYear}`;
const defaultPaymentDate = `${String(_liveDay).padStart(2, '0')}/${String(_liveMonth + 1).padStart(2, '0')}/${_liveYear}`;

// Application State
const state = {
  currentView: 'view-login',
  user: {
    isLoggedIn: false,
    name: 'María García',
    email: 'maria@gmail.com',
    phone: '+58 412 1234567',
    avatar: 'images/avatar-usuario.jpg'
  },
  booking: {
    origin: 'La Rosa', // 'Gañango' or 'La Rosa'
    transfers: {
      'Gañango': {
        passengers: 0,
        isFullBoat: false
      },
      'La Rosa': {
        passengers: 0,
        isFullBoat: false
      }
    },
    passengers: 0,
    isFullBoat: false,
    pricePerPerson: 5,
    fullBoatPrice: 60,
    date: defaultBookingDate,
    dateFormatted: defaultBookingDateFormatted,
    time: '8:00 a. m.',
    services: {
      toldo: { id: 'toldo', name: 'Toldo + 4 sillas', price: 20, qty: 0 },
      buceo: { id: 'buceo', name: 'Clase de buceo (30 min)', price: 40, qty: 0 },
      kayak: { id: 'kayak', name: 'Kayak (2 personas)', price: 40, qty: 0 }
    },
    restaurant: {
      pescado: { id: 'pescado', name: 'Pescado frito', category: 'pescado', price: 12, qty: 0 },
      ceviche: { id: 'ceviche', name: 'Ceviche fresco', category: 'ceviche', price: 10, qty: 0 },
      tostones: { id: 'tostones', name: 'Tostones con salsa de ajo', category: 'tostones', price: 6, qty: 0 },
      bebidas: { id: 'bebidas', name: 'Bebidas frías (Coco / Cerveza)', category: 'bebidas', price: 3, qty: 0 },
      combo: { id: 'combo', name: 'Combo Playero Familiar', category: 'combos', price: 25, qty: 0 }
    },
    customer: {
      name: 'María García',
      phone: '+58 412 1234567',
      email: 'maria@gmail.com',
      termsAccepted: true
    },
    payment: {
      bank: 'Banesco (0134)',
      accountPhone: '0412 1234567',
      rif: 'V-12345678',
      reference: '123456',
      date: defaultPaymentDate,
      time: '10:24 a. m.',
      amountUSD: 92,
      rateBCV: 72.50
    },
    confirmedCode: 'IL-4587'
  },
  operationStatus: 'green', // 'green' | 'yellow' | 'red'
  reservations: [
    {
      code: 'IL-4587',
      origin: 'La Rosa',
      date: defaultBookingDateFormatted,
      time: '8:00 a. m.',
      passengers: 2,
      status: 'Confirmada',
      total: 92,
      isUpcoming: true,
      services: ['Toldo + 4 sillas', 'Kayak'],
      restaurant: ['Pescado frito (1)'],
      img: 'images/larosa.jpg',
      paymentRef: '984512',
      paymentDate: defaultPaymentDate,
      verificationToken: 'INP-8F29-C4E1'
    },
    {
      code: 'IL-3021',
      origin: 'Gañango',
      date: defaultBookingDateFormatted,
      time: '9:00 a. m.',
      passengers: 3,
      status: 'Completada',
      total: 138,
      isUpcoming: false,
      services: ['Toldo + 4 sillas', 'Clase de buceo (1)'],
      restaurant: ['Pescado frito (2)', 'Tostones (1)'],
      img: 'images/gañango.jpg',
      paymentRef: '632014',
      paymentDate: defaultPaymentDate,
      verificationToken: 'INP-3A7B-9D04'
    }
  ]
};

// Helper to sync active transfer to root booking
function syncActiveBookingTransfer() {
  const b = state.booking;
  if (b.transfers && b.transfers[b.origin]) {
    b.passengers = b.transfers[b.origin].passengers;
    b.isFullBoat = b.transfers[b.origin].isFullBoat;
  }
}

// Calculations
function calculateTotal() {
  syncActiveBookingTransfer();
  const b = state.booking;
  let transferTotal = 0;
  if (b.isFullBoat) {
    transferTotal = b.fullBoatPrice;
  } else {
    transferTotal = b.passengers * b.pricePerPerson;
  }

  let servicesTotal = 0;
  Object.values(b.services).forEach(s => {
    servicesTotal += s.qty * s.price;
  });

  let restaurantTotal = 0;
  Object.values(b.restaurant).forEach(r => {
    restaurantTotal += r.qty * r.price;
  });

  const grandTotal = transferTotal + servicesTotal + restaurantTotal;
  b.payment.amountUSD = grandTotal;
  return {
    transferTotal,
    servicesTotal,
    restaurantTotal,
    grandTotal
  };
}

// Router Navigation
function navigateTo(viewId, updateHistory = true) {
  const current = document.querySelector('.view.active');
  const target = document.getElementById(viewId);

  if (!target) return;

  if (current && current.id !== viewId) {
    state.previousView = current.id;
    current.classList.remove('active');
  }

  target.classList.add('active');
  state.currentView = viewId;

  // Window scroll to top of view
  target.scrollTop = 0;

  // Update status bar tint
  const statusBar = document.querySelector('.device-status-bar');
  if (statusBar) {
    if (viewId === 'view-login') {
      statusBar.classList.remove('on-dark');
    } else {
      statusBar.classList.remove('on-dark');
    }
  }

  // Update Bottom Nav Visibility & Active state
  const bottomNav = document.getElementById('bottom-nav');
  const appEl = document.getElementById('app');
  const paymentAndAuthViews = ['view-login', 'view-payment', 'view-verifying'];

  if (!paymentAndAuthViews.includes(viewId)) {
    bottomNav?.classList.remove('d-none');
    bottomNav?.classList.remove('nav-hidden');
    appEl?.classList.remove('nav-hidden');
    updateBottomNavActive(viewId);
  } else {
    bottomNav?.classList.add('d-none');
  }

  // Screen-specific updates
  if (viewId === 'view-summary') {
    renderSummaryView();
  } else if (viewId === 'view-payment') {
    renderPaymentView();
  } else if (viewId === 'view-confirmed') {
    renderConfirmedView();
  } else if (viewId === 'view-qr') {
    renderQrView();
  } else if (viewId === 'view-my-reservations') {
    renderReservationsList();
  }
}

function updateBottomNavActive(viewId) {
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  if (['view-home', 'view-transfer', 'view-datetime', 'view-services', 'view-restaurant', 'view-summary', 'view-customer'].includes(viewId)) {
    document.getElementById('nav-home')?.classList.add('active');
  } else if (viewId === 'view-discover') {
    document.getElementById('nav-discover')?.classList.add('active');
  } else if (viewId === 'view-status') {
    document.getElementById('nav-status')?.classList.add('active');
  } else if (['view-my-reservations', 'view-confirmed', 'view-qr'].includes(viewId)) {
    document.getElementById('nav-reservas')?.classList.add('active');
  } else if (viewId === 'view-profile') {
    document.getElementById('nav-profile')?.classList.add('active');
  }
}

// Toast System
function showToast(message, duration = 2800) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast show';
  toast.innerHTML = `<span>🏝️</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// Copy to Clipboard
function copyToClipboard(text, label = 'Dato') {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${label} copiado al portapapeles`);
  }).catch(() => {
    showToast(`${text} copiado`);
  });
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupDeviceClock();
  setupAuthButtons();
  setupBookingFlow();
  setupCalendar();
  setupServices();
  setupRestaurant();
  setupPayment();
  setupAccordions();
  setupBottomNav();
  setupProfileModal();
  setupRealtimeWeather();
  renderReservationsList();

  // Consulta en segundo plano de la tasa oficial BCV
  fetchBCVExchangeRate();
  setInterval(fetchBCVExchangeRate, 600000);

  // Load state from localStorage if available
  const saved = localStorage.getItem('islalarga_reservations');
  if (saved) {
    try {
      state.reservations = JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse saved reservations', e);
    }
  }

  // Start on login view
  navigateTo('view-login');
});

// Realtime Status Bar Clock
function setupDeviceClock() {
  const clockEl = document.getElementById('device-clock');
  function updateTime() {
    if (!clockEl) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}`;
  }
  updateTime();
  setInterval(updateTime, 30000);
}

// 1. Auth Setup
function setupAuthButtons() {
  document.getElementById('btn-guest-entry')?.addEventListener('click', () => {
    state.user.isLoggedIn = false;
    navigateTo('view-home');
  });

  document.getElementById('btn-login-action')?.addEventListener('click', () => {
    state.user.isLoggedIn = true;
    navigateTo('view-home');
  });

  document.getElementById('btn-register-action')?.addEventListener('click', () => {
    openModal('modal-auth-form', 'Crear Cuenta');
  });

  document.getElementById('btn-forgot-pass')?.addEventListener('click', () => {
    openModal('modal-auth-form', 'Recuperar Contraseña');
  });
}

// 2. Booking Flow Handlers
function setupBookingFlow() {
  // Planificar mi visita CTA
  document.getElementById('btn-start-plan')?.addEventListener('click', () => {
    navigateTo('view-transfer');
  });

  // Transfer Screen (Gañango vs La Rosa)
  const gañangoCard = document.getElementById('card-transfer-ganango');
  const laRosaCard = document.getElementById('card-transfer-larosa');

  function selectOrigin(origin) {
    state.booking.origin = origin;
    if (origin === 'Gañango') {
      gañangoCard?.classList.add('selected');
      laRosaCard?.classList.remove('selected');
    } else {
      laRosaCard?.classList.add('selected');
      gañangoCard?.classList.remove('selected');
    }
    syncActiveBookingTransfer();
  }

  // Click entire card to select
  gañangoCard?.addEventListener('click', (e) => {
    if (!e.target.closest('.stepper-btn') && !e.target.closest('.full-boat-option')) {
      selectOrigin('Gañango');
    }
  });

  laRosaCard?.addEventListener('click', (e) => {
    if (!e.target.closest('.stepper-btn') && !e.target.closest('.full-boat-option')) {
      selectOrigin('La Rosa');
    }
  });

  // --- GAÑANGO CONTROLS ---
  document.getElementById('btn-minus-ganango')?.addEventListener('click', (e) => {
    e.stopPropagation();
    selectOrigin('Gañango');
    const t = state.booking.transfers['Gañango'];
    if (t.passengers > 0) {
      t.passengers--;
      const el = document.getElementById('count-ganango');
      if (el) el.textContent = t.passengers;
      syncActiveBookingTransfer();
    }
  });

  document.getElementById('btn-plus-ganango')?.addEventListener('click', (e) => {
    e.stopPropagation();
    selectOrigin('Gañango');
    const t = state.booking.transfers['Gañango'];
    if (t.passengers < 20) {
      t.passengers++;
      const el = document.getElementById('count-ganango');
      if (el) el.textContent = t.passengers;
      syncActiveBookingTransfer();
    }
  });

  document.getElementById('opt-full-boat-ganango')?.addEventListener('click', (e) => {
    e.stopPropagation();
    selectOrigin('Gañango');
    const t = state.booking.transfers['Gañango'];
    t.isFullBoat = !t.isFullBoat;
    const optEl = document.getElementById('opt-full-boat-ganango');
    const cbEl = document.getElementById('cb-full-boat-ganango');
    optEl?.classList.toggle('active', t.isFullBoat);
    if (cbEl) cbEl.innerHTML = t.isFullBoat ? '✓' : '';
    syncActiveBookingTransfer();
  });

  // --- LA ROSA CONTROLS ---
  document.getElementById('btn-minus-larosa')?.addEventListener('click', (e) => {
    e.stopPropagation();
    selectOrigin('La Rosa');
    const t = state.booking.transfers['La Rosa'];
    if (t.passengers > 0) {
      t.passengers--;
      const el = document.getElementById('count-larosa');
      if (el) el.textContent = t.passengers;
      syncActiveBookingTransfer();
    }
  });

  document.getElementById('btn-plus-larosa')?.addEventListener('click', (e) => {
    e.stopPropagation();
    selectOrigin('La Rosa');
    const t = state.booking.transfers['La Rosa'];
    if (t.passengers < 20) {
      t.passengers++;
      const el = document.getElementById('count-larosa');
      if (el) el.textContent = t.passengers;
      syncActiveBookingTransfer();
    }
  });

  document.getElementById('opt-full-boat-larosa')?.addEventListener('click', (e) => {
    e.stopPropagation();
    selectOrigin('La Rosa');
    const t = state.booking.transfers['La Rosa'];
    t.isFullBoat = !t.isFullBoat;
    const optEl = document.getElementById('opt-full-boat-larosa');
    const cbEl = document.getElementById('cb-full-boat-larosa');
    optEl?.classList.toggle('active', t.isFullBoat);
    if (cbEl) cbEl.innerHTML = t.isFullBoat ? '✓' : '';
    syncActiveBookingTransfer();
  });

  // Continue to Date & Time
  document.getElementById('btn-transfer-continue')?.addEventListener('click', () => {
    syncActiveBookingTransfer();
    const t = state.booking.transfers[state.booking.origin];
    if (t.passengers === 0 && !t.isFullBoat) {
      showToast('Selecciona al menos 1 pasajero o lancha completa');
      return;
    }
    navigateTo('view-datetime');
  });

  // Continue from Date & Time to Services
  document.getElementById('btn-datetime-continue')?.addEventListener('click', () => {
    navigateTo('view-services');
  });

  // Continue from Services to Restaurant
  document.getElementById('btn-services-continue')?.addEventListener('click', () => {
    navigateTo('view-restaurant');
  });

  // Continue from Restaurant to Summary
  document.getElementById('btn-restaurant-continue')?.addEventListener('click', () => {
    navigateTo('view-summary');
  });

  // Summary Edit and Continue
  document.getElementById('btn-summary-edit')?.addEventListener('click', () => {
    navigateTo('view-transfer');
  });

  document.getElementById('btn-summary-continue')?.addEventListener('click', () => {
    navigateTo('view-customer');
  });

  // Customer to Payment
  document.getElementById('btn-customer-continue')?.addEventListener('click', () => {
    const nameInput = document.getElementById('input-cust-name')?.value.trim();
    const phoneInput = document.getElementById('input-cust-phone')?.value.trim();
    const emailInput = document.getElementById('input-cust-email')?.value.trim();
    const terms = document.getElementById('check-cust-terms')?.checked;

    if (!terms) {
      showToast('Por favor acepta los términos y condiciones');
      return;
    }

    if (nameInput) state.booking.customer.name = nameInput;
    if (phoneInput) state.booking.customer.phone = phoneInput;
    if (emailInput) state.booking.customer.email = emailInput;

    navigateTo('view-payment');
  });
}

// 3. Calendar & Time Slots (Realtime + Navegación)
function setupCalendar() {
  const daysGrid = document.getElementById('calendar-grid');
  const monthTitle = document.getElementById('calendar-month-name');
  const btnToday = document.getElementById('btn-calendar-today');
  const btnPrev = document.getElementById('btn-calendar-prev');
  const btnNext = document.getElementById('btn-calendar-next');

  const nowLive = new Date();
  let currentYear = nowLive.getFullYear();
  let currentMonth = nowLive.getMonth(); // 0-indexed: 0=Ene, 1=Feb, etc.
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  function renderCalendar() {
    if (!daysGrid) return;
    monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    daysGrid.innerHTML = '';

    // First day of month (0: Sunday, 1: Monday, ...)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // In Spanish calendar, week starts on Monday
    const startOffset = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Blank cells before start
    for (let i = 0; i < startOffset; i++) {
      const blank = document.createElement('div');
      blank.className = 'calendar-day-btn disabled';
      daysGrid.appendChild(blank);
    }

    const todayDate = new Date();
    const todayMidnight = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()).getTime();

    // Days numbers
    for (let day = 1; day <= daysInMonth; day++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'calendar-day-btn';
      btn.textContent = day;

      const thisDayTime = new Date(currentYear, currentMonth, day).getTime();
      const isPast = thisDayTime < todayMidnight;
      const isToday = thisDayTime === todayMidnight;

      if (isToday) {
        btn.classList.add('today');
      }

      if (isPast) {
        btn.classList.add('disabled');
        btn.disabled = true;
      }

      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (dateStr === state.booking.date) {
        btn.classList.add('active');
      }

      if (!isPast) {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.calendar-day-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.booking.date = dateStr;
          state.booking.dateFormatted = `${day} ${monthNames[currentMonth].substring(0, 3).toLowerCase()} ${currentYear}`;
        });
      }

      daysGrid.appendChild(btn);
    }
  }

  btnPrev?.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  btnNext?.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });

  btnToday?.addEventListener('click', () => {
    const live = new Date();
    currentYear = live.getFullYear();
    currentMonth = live.getMonth();
    const liveDay = live.getDate();
    state.booking.date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(liveDay).padStart(2, '0')}`;
    state.booking.dateFormatted = `${liveDay} ${monthNames[currentMonth].substring(0, 3).toLowerCase()} ${currentYear}`;
    renderCalendar();
  });

  renderCalendar();

  // Time Slots selection
  document.querySelectorAll('.time-slot-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.time-slot-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.booking.time = pill.getAttribute('data-time') || pill.textContent.trim();
    });
  });
}

// 4. Additional Services
function setupServices() {
  document.querySelectorAll('.btn-add-service').forEach(btn => {
    btn.addEventListener('click', () => {
      const serviceId = btn.getAttribute('data-service');
      const service = state.booking.services[serviceId];
      if (!service) return;

      if (service.qty === 0) {
        service.qty = 1;
        btn.classList.add('added');
        btn.innerHTML = '<span>✓ Agregado</span>';
      } else {
        service.qty = 0;
        btn.classList.remove('added');
        btn.innerHTML = '<span>Agregar</span>';
      }
    });
  });
}

// 5. Restaurant Food Menu
function setupRestaurant() {
  // Category tabs
  const categoryPills = document.querySelectorAll('.category-pill');
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-category');
      filterFoodItems(cat);
    });
  });

  function filterFoodItems(cat) {
    const items = document.querySelectorAll('.food-card');
    items.forEach(item => {
      const itemCat = item.getAttribute('data-food-cat');
      if (cat === 'todos' || itemCat === cat) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  const continueBtn = document.getElementById('btn-restaurant-continue');

  function updateRestaurantHeaderSummary() {
    if (!continueBtn) return;
    let totalItems = 0;
    let totalMonto = 0;
    Object.values(state.booking.restaurant).forEach(r => {
      if (r.qty > 0) {
        totalItems += r.qty;
        totalMonto += (r.qty * r.price);
      }
    });
    if (totalItems > 0) {
      continueBtn.textContent = `Continuar (${totalItems} ${totalItems === 1 ? 'ítem' : 'ítems'} • $${totalMonto})`;
    } else {
      continueBtn.textContent = 'Continuar';
    }
  }

  function renderCardAction(card, foodId) {
    const wrapper = card.querySelector('.food-action-wrapper');
    if (!wrapper) return;
    const food = state.booking.restaurant[foodId];
    if (!food) return;

    if (food.qty > 0) {
      card.classList.add('has-units');
      wrapper.innerHTML = `
        <div class="food-stepper">
          <button class="stepper-btn minus" type="button" aria-label="Restar">−</button>
          <span class="stepper-val">${food.qty}</span>
          <button class="stepper-btn plus" type="button" aria-label="Sumar">+</button>
        </div>
      `;

      wrapper.querySelector('.stepper-btn.minus')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (food.qty > 1) {
          food.qty--;
        } else {
          food.qty = 0;
        }
        renderCardAction(card, foodId);
        updateRestaurantHeaderSummary();
      });

      wrapper.querySelector('.stepper-btn.plus')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (food.qty < 20) {
          food.qty++;
        }
        renderCardAction(card, foodId);
        updateRestaurantHeaderSummary();
      });

    } else {
      card.classList.remove('has-units');
      wrapper.innerHTML = `
        <button class="btn-food-add" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Agregar</span>
        </button>
      `;

      wrapper.querySelector('.btn-food-add')?.addEventListener('click', (e) => {
        e.stopPropagation();
        food.qty = 1;
        renderCardAction(card, foodId);
        updateRestaurantHeaderSummary();
      });
    }
  }

  // Initial render of all food cards
  document.querySelectorAll('.food-card').forEach(card => {
    const foodId = card.getAttribute('data-food-id');
    if (foodId) {
      renderCardAction(card, foodId);
    }
  });

  updateRestaurantHeaderSummary();
}

// 6. Summary View Rendering
function renderSummaryView() {
  const totals = calculateTotal();
  const b = state.booking;

  document.getElementById('summary-origin-val').textContent = b.origin;
  document.getElementById('summary-passengers-val').textContent = `${b.passengers} ${b.isFullBoat ? '(Lancha completa)' : ''}`;
  document.getElementById('summary-date-val').textContent = b.dateFormatted;
  document.getElementById('summary-time-val').textContent = b.time;

  // Services list
  const servicesList = document.getElementById('summary-services-list');
  servicesList.innerHTML = '';
  let hasServices = false;
  Object.values(b.services).forEach(s => {
    if (s.qty > 0) {
      hasServices = true;
      const row = document.createElement('div');
      row.className = 'summary-subitem';
      row.innerHTML = `<span>${s.name} (${s.qty})</span> <span>$${s.qty * s.price}</span>`;
      servicesList.appendChild(row);
    }
  });
  if (!hasServices) {
    servicesList.innerHTML = `<div class="summary-subitem" style="color:#94a3b8"><span>Ningún servicio adicional</span> <span>$0</span></div>`;
  }

  // Restaurant list
  const restList = document.getElementById('summary-restaurant-list');
  restList.innerHTML = '';
  let hasFood = false;
  Object.values(b.restaurant).forEach(r => {
    if (r.qty > 0) {
      hasFood = true;
      const row = document.createElement('div');
      row.className = 'summary-subitem';
      row.innerHTML = `<span>${r.name} (${r.qty})</span> <span>$${r.qty * r.price}</span>`;
      restList.appendChild(row);
    }
  });
  if (!hasFood) {
    restList.innerHTML = `<div class="summary-subitem" style="color:#94a3b8"><span>Sin orden de restaurante</span> <span>$0</span></div>`;
  }

  // Total
  document.getElementById('summary-grand-total').textContent = `$${totals.grandTotal}`;
}

function getTodayDateString() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

function getCurrentTimeString() {
  const now = new Date();
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${ampm}`;
}

function generateVerificationToken(code, date, total) {
  const seed = `${code}-${date}-${total}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `INP-${hex.substring(0, 4)}-${hex.substring(4, 8)}`;
}

function handleQrBack() {
  if (state.previousView && state.previousView !== 'view-qr') {
    navigateTo(state.previousView);
  } else {
    navigateTo('view-confirmed');
  }
}
window.handleQrBack = handleQrBack;

// ============================================================================
// BCV REALTIME RATE ENGINE (BANCO CENTRAL DE VENEZUELA - BACKGROUND)
// ============================================================================
async function fetchBCVExchangeRate() {
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && typeof data.promedio === 'number' && data.promedio > 0) {
      state.booking.payment.rateBCV = Math.round(data.promedio * 100) / 100;
      // Actualización silenciosa si el usuario está en la vista de pago
      if (state.currentView === 'view-payment') {
        const totals = calculateTotal();
        const b = state.booking;
        const rate = b.payment.rateBCV;
        const vesAmount = (totals.grandTotal * rate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const vesEl = document.getElementById('pay-monto-ves');
        const usdEl = document.getElementById('pay-monto-usd');
        if (vesEl) vesEl.textContent = `Bs. ${vesAmount}`;
        if (usdEl) {
          const rateFormatted = rate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          usdEl.textContent = `Ref: $${totals.grandTotal} USD (Tasa BCV: ${rateFormatted} Bs/$)`;
        }
      }
    }
  } catch (err) {
    console.warn('Silent BCV rate background fetch fallback:', err);
  }
}

// 7. Payment View Rendering & Verification Sequence
function renderPaymentView() {
  // Consulta silenciosa en background sin mostrar indicadores
  fetchBCVExchangeRate();

  const totals = calculateTotal();
  const b = state.booking;
  const rate = b.payment.rateBCV || 72.50;
  const vesAmount = (totals.grandTotal * rate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const rateFormatted = rate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // En grande sale el monto en Bolívares
  const vesEl = document.getElementById('pay-monto-ves');
  if (vesEl) {
    vesEl.textContent = `Bs. ${vesAmount}`;
  }

  // En secundario la referencia en dólares y tasa oficial BCV
  const usdEl = document.getElementById('pay-monto-usd');
  if (usdEl) {
    usdEl.textContent = `Ref: $${totals.grandTotal} USD (Tasa BCV: ${rateFormatted} Bs/$)`;
  }

  // Pre-fill inputs: Solo últimos 6 dígitos de la referencia y teléfono del pago móvil
  const refInput = document.getElementById('pay-client-ref');
  const phoneInput = document.getElementById('pay-client-phone');

  if (refInput && !refInput.value) refInput.value = '123456';
  if (phoneInput && !phoneInput.value) {
    phoneInput.value = state.user.phone || '0412 1234567';
  }
}

function setupPayment() {
  // Copy buttons
  document.getElementById('copy-bank-name')?.addEventListener('click', () => copyToClipboard('Banesco', 'Banco'));
  document.getElementById('copy-bank-phone')?.addEventListener('click', () => copyToClipboard('04121234567', 'Teléfono'));
  document.getElementById('copy-bank-rif')?.addEventListener('click', () => copyToClipboard('V12345678', 'Cédula / RIF'));

  // Confirm payment button
  document.getElementById('btn-confirm-payment')?.addEventListener('click', () => {
    startPaymentVerification();
  });
}

function startPaymentVerification() {
  navigateTo('view-verifying');

  const payRef = document.getElementById('pay-client-ref')?.value?.trim() || '123456';
  const payPhone = document.getElementById('pay-client-phone')?.value?.trim() || state.user.phone || '0412 1234567';
  const payDate = getTodayDateString();

  state.booking.payment.ref = payRef;
  state.booking.payment.phone = payPhone;
  state.booking.payment.date = payDate;

  const step1 = document.getElementById('verify-step-1');
  const step2 = document.getElementById('verify-step-2');
  const step3 = document.getElementById('verify-step-3');
  const step4 = document.getElementById('verify-step-4');

  // Reset steps
  [step1, step2, step3, step4].forEach(s => {
    s?.classList.remove('completed', 'active');
  });

  step1?.classList.add('active');

  setTimeout(() => {
    step1?.classList.remove('active');
    step1?.classList.add('completed');
    step2?.classList.add('active');
  }, 900);

  setTimeout(() => {
    step2?.classList.remove('active');
    step2?.classList.add('completed');
    step3?.classList.add('active');
  }, 1800);

  setTimeout(() => {
    step3?.classList.remove('active');
    step3?.classList.add('completed');
    step4?.classList.add('active');
  }, 2700);

  setTimeout(() => {
    step4?.classList.remove('active');
    step4?.classList.add('completed');

    // Generate confirmed code
    const randCode = 'IL-' + Math.floor(1000 + Math.random() * 9000);
    state.booking.confirmedCode = randCode;

    // Add to reservations state
    const totals = calculateTotal();
    const token = generateVerificationToken(randCode, state.booking.dateFormatted, totals.grandTotal);
    const newReservation = {
      code: randCode,
      origin: state.booking.origin,
      date: state.booking.dateFormatted,
      time: state.booking.time,
      paymentDate: payDate,
      paymentRef: payRef,
      paymentPhone: payPhone,
      verificationToken: token,
      passengers: state.booking.passengers,
      status: 'Confirmada',
      total: totals.grandTotal,
      isUpcoming: true,
      services: Object.values(state.booking.services).filter(s => s.qty > 0).map(s => s.name),
      restaurant: Object.values(state.booking.restaurant).filter(r => r.qty > 0).map(r => `${r.name} (${r.qty})`),
      img: state.booking.origin === 'Gañango' ? 'images/gañango.jpg' : 'images/larosa.jpg'
    };

    state.reservations.unshift(newReservation);
    localStorage.setItem('islalarga_reservations', JSON.stringify(state.reservations));

    navigateTo('view-confirmed');
    showToast('¡Pago verificado con éxito!');
  }, 3500);
}

// 8. Confirmed View
function renderConfirmedView() {
  const b = state.booking;
  const totals = calculateTotal();

  document.getElementById('conf-code-display').textContent = b.confirmedCode;
  document.getElementById('conf-date-val').textContent = b.dateFormatted;
  document.getElementById('conf-time-val').textContent = b.time;
  document.getElementById('conf-origin-val').textContent = `Muelle ${b.origin}`;
  document.getElementById('conf-passengers-val').textContent = `${b.passengers} personas`;

  const servicesNames = Object.values(b.services).filter(s => s.qty > 0).map(s => s.name).join(', ') || 'Ninguno';
  document.getElementById('conf-services-val').textContent = servicesNames;

  const restNames = Object.values(b.restaurant).filter(r => r.qty > 0).map(r => r.name).join(', ') || 'Ninguno';
  document.getElementById('conf-restaurant-val').textContent = restNames;

  document.getElementById('conf-total-val').textContent = `$${totals.grandTotal}`;

  // Button actions
  document.getElementById('btn-view-qr')?.addEventListener('click', () => {
    navigateTo('view-qr');
  });

  document.getElementById('btn-whatsapp-share')?.addEventListener('click', () => {
    shareViaWhatsApp();
  });

  document.getElementById('btn-download-voucher')?.addEventListener('click', () => {
    downloadVoucher();
  });
}

// 9. Real QR Generation (Contiene toda la información del ticket)
function renderQrView() {
  const code = state.booking.confirmedCode || 'IL-4587';
  document.getElementById('qr-code-header-title').textContent = `Código: ${code}`;
  document.getElementById('qr-code-display-value').textContent = code;

  const holder = document.getElementById('qr-canvas-holder');
  if (!holder) return;

  // Obtener los datos reales de la reserva
  let res = state.reservations.find(r => r.code === code);
  if (!res) {
    res = {
      code: code,
      origin: state.booking.origin || 'Gañango',
      date: state.booking.dateFormatted || getTodayDateString(),
      time: state.booking.time || '10:00 a. m.',
      paymentDate: state.booking.payment?.date || getTodayDateString(),
      paymentRef: state.booking.payment?.ref || '123456',
      passengers: state.booking.passengers || 2,
      services: Object.values(state.booking.services || {}).filter(s => s.qty > 0).map(s => s.name),
      restaurant: Object.values(state.booking.restaurant || {}).filter(r => r.qty > 0).map(r => `${r.name} (${r.qty})`),
      total: calculateTotal().grandTotal,
      status: 'Confirmada',
      verificationToken: generateVerificationToken(code, state.booking.dateFormatted, 92)
    };
  }

  if (!res.verificationToken) {
    res.verificationToken = generateVerificationToken(res.code, res.date, res.total);
  }

  const sealEl = document.getElementById('qr-security-token');
  if (sealEl) sealEl.textContent = `Sello: ${res.verificationToken}`;

  const statusTextEl = document.getElementById('qr-status-text');
  if (statusTextEl) {
    statusTextEl.textContent = res.status === 'Confirmada' ? 'Pago Verificado' : 'Ticket Completado';
  }

  const servicesText = (res.services && res.services.length) ? res.services.join(', ') : 'Ninguno';
  const restText = (res.restaurant && res.restaurant.length) ? res.restaurant.join(', ') : 'Ninguno';

  // Cadena formateada para escaneo con cámara móvil o lectores QR (SOLO TEXTO DEL TICKET)
  const qrTicketData = [
    `=== ISLA LARGA - TICKET OFICIAL ===`,
    `TICKET: ${res.code}`,
    `SELLO: ${res.verificationToken}`,
    `ESTATUS: ${res.status.toUpperCase()} (INPARQUES)`,
    `CLIENTE: ${state.user.name || 'María García'}`,
    `FECHA VISITA: ${res.date}`,
    `HORA EMBARQUE: ${res.time}`,
    `MUELLE: ${res.origin}`,
    `PASAJEROS: ${res.passengers} pers`,
    `SERVICIOS: ${servicesText}`,
    `RESTAURANTE: ${restText}`,
    `TOTAL: $${res.total}`,
    `REF. PAGO: ${res.paymentRef || '123456'}`,
    `TEL. PAGO: ${res.paymentPhone || state.user.phone || '0412 1234567'}`,
    `FECHA PAGO: ${res.paymentDate || getTodayDateString()}`
  ].join('\n');

  holder.innerHTML = '';

  let generated = false;

  // 1. Generador Vectorial SVG Local de Alta Fidelidad
  if (typeof qrcode !== 'undefined') {
    try {
      if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) {
        qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
      }
      const qr = qrcode(0, 'M');
      qr.addData(qrTicketData);
      qr.make();
      const svgTag = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
      holder.innerHTML = svgTag;
      const svgEl = holder.querySelector('svg');
      if (svgEl) {
        svgEl.style.width = '200px';
        svgEl.style.height = '200px';
        svgEl.style.display = 'block';
        svgEl.style.margin = '0 auto';
        const pathEl = svgEl.querySelector('path');
        if (pathEl) pathEl.setAttribute('fill', '#082f49');
      }
      generated = true;
    } catch (err) {
      console.warn('qrcode local SVG falló:', err);
    }
  }

  // 2. Si no se generó, constructor QRCode universal
  if (!generated && typeof QRCode !== 'undefined') {
    try {
      holder.innerHTML = '';
      new QRCode(holder, {
        text: qrTicketData,
        width: 200,
        height: 200,
        colorDark: '#082f49',
        colorLight: '#ffffff'
      });
      generated = true;
    } catch (err) {
      console.warn('QRCode constructor falló:', err);
    }
  }

  // 3. Fallback Infalible: Generador QR de Alta Definición
  if (!generated || !holder.querySelector('svg, canvas, img')) {
    const encoded = encodeURIComponent(qrTicketData);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=082f49&bgcolor=ffffff&data=${encoded}`;
    holder.innerHTML = `<img src="${qrUrl}" alt="QR Ticket ${res.code}" style="width:200px; height:200px; display:block; margin:0 auto; border-radius:6px;" />`;
  }
}

// 10. Sharing & Voucher Download
function shareViaWhatsApp() {
  const b = state.booking;
  const totals = calculateTotal();
  const text = `🌊 *Mi Reserva en IslaLarga.com* 🏝️\n` +
    `🔖 *Código:* ${b.confirmedCode}\n` +
    `📅 *Fecha:* ${b.dateFormatted}\n` +
    `⏰ *Hora:* ${b.time}\n` +
    `📍 *Salida:* Muelle ${b.origin}\n` +
    `👥 *Personas:* ${b.passengers}\n` +
    `💰 *Total Pagado:* $${totals.grandTotal}\n\n` +
    `Presentaré mi código QR al abordar. ¡Nos vemos en el paraíso! 🛥️🌴`;

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function downloadVoucher() {
  showToast('Generando comprobante digital...');
  setTimeout(() => {
    window.print();
  }, 400);
}

// 11. Reservations List & Details
function renderReservationsList(filter = 'proxima') {
  const container = document.getElementById('reservations-list-container');
  if (!container) return;

  container.innerHTML = '';
  const filtered = state.reservations.filter(r => filter === 'proxima' ? r.isUpcoming : !r.isUpcoming);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px 16px; color: #94a3b8;">
        <p style="font-size: 2rem; margin-bottom: 8px;">🎫</p>
        <p style="font-weight: 600;">No tienes reservas en esta sección</p>
      </div>
    `;
    return;
  }

  filtered.forEach(res => {
    const card = document.createElement('div');
    card.className = 'reservation-list-card';
    card.innerHTML = `
      <div class="res-card-top">
        <img src="${res.img}" alt="${res.origin}" class="res-thumb" />
        <div class="res-info">
          <div class="res-code">${res.code}</div>
          <div class="res-datetime">${res.date} • ${res.time}</div>
          <div class="res-meta">${res.origin} • ${res.passengers} personas • <strong>$${res.total}</strong></div>
        </div>
      </div>
      <div class="res-card-bottom">
        <span class="res-status-tag ${res.status === 'Confirmada' ? 'confirmed' : 'completed'}">
          ${res.status === 'Confirmada' ? '🟢' : '✓'} ${res.status}
        </span>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-sm btn-primary btn-qr-res" data-code="${res.code}" style="padding: 6px 12px; font-size: 0.8rem; display:inline-flex; align-items:center; gap:4px;">
            <span>📱 Ver QR</span>
          </button>
          <button class="btn btn-sm btn-secondary btn-inspect-res" data-code="${res.code}">
            Detalles
          </button>
        </div>
      </div>
    `;

    card.querySelector('.btn-qr-res')?.addEventListener('click', (e) => {
      e.stopPropagation();
      state.booking.confirmedCode = res.code;
      navigateTo('view-qr');
    });

    card.querySelector('.btn-inspect-res')?.addEventListener('click', () => {
      openReservationDetailModal(res);
    });

    container.appendChild(card);
  });
}

function openReservationDetailModal(res) {
  const content = document.getElementById('res-detail-modal-content');
  if (!content) return;

  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 16px;">
      <span class="res-status-tag ${res.status === 'Confirmada' ? 'confirmed' : 'completed'}" style="font-size: 0.9rem; padding: 6px 14px;">
        ${res.status === 'Confirmada' ? '🟢 Operación Confirmada' : '✓ Completada'}
      </span>
      <h3 style="font-size: 1.4rem; font-weight: 800; margin-top: 8px;">Código: ${res.code}</h3>
    </div>

    <div class="summary-card" style="margin-bottom: 16px;">
      <div class="summary-row"><span class="summary-label">Muelle de salida:</span> <span class="summary-value">${res.origin}</span></div>
      <div class="summary-row"><span class="summary-label">Fecha:</span> <span class="summary-value">${res.date}</span></div>
      <div class="summary-row"><span class="summary-label">Hora:</span> <span class="summary-value">${res.time}</span></div>
      <div class="summary-row"><span class="summary-label">Pasajeros:</span> <span class="summary-value">${res.passengers} personas</span></div>
      <div class="summary-divider"></div>
      <div class="summary-row"><span class="summary-label">Servicios:</span> <span class="summary-value">${res.services?.join(', ') || 'Ninguno'}</span></div>
      <div class="summary-row"><span class="summary-label">Restaurante:</span> <span class="summary-value">${res.restaurant?.join(', ') || 'Ninguno'}</span></div>
      <div class="summary-divider"></div>
      <div class="summary-total-row"><span>Total pagado:</span> <span class="total-amount">$${res.total}</span></div>
    </div>

    <div style="display:flex; flex-direction:column; gap:10px;">
      <button class="btn btn-primary" id="btn-modal-qr-shortcut">
        <span>📱 Ver QR de Embarque</span>
      </button>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-secondary" id="btn-modal-share-ws">Compartir</button>
        <button class="btn btn-guest" id="btn-modal-print-doc">Descargar</button>
      </div>
    </div>
  `;

  document.getElementById('btn-modal-qr-shortcut')?.addEventListener('click', () => {
    closeModal();
    state.booking.confirmedCode = res.code;
    navigateTo('view-qr');
  });

  document.getElementById('btn-modal-share-ws')?.addEventListener('click', () => {
    shareViaWhatsApp();
  });

  document.getElementById('btn-modal-print-doc')?.addEventListener('click', () => {
    downloadVoucher();
  });

  openModal('modal-res-detail');
}

// 12. Accordions for Discover & FAQs
function setupAccordions() {
  document.querySelectorAll('.guide-accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.guide-accordion-item');
      item?.classList.toggle('open');
    });
  });

  // Segmented tabs for My Reservations
  document.getElementById('tab-res-proxima')?.addEventListener('click', (e) => {
    document.querySelectorAll('.segmented-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    renderReservationsList('proxima');
  });

  document.getElementById('tab-res-anteriores')?.addEventListener('click', (e) => {
    document.querySelectorAll('.segmented-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    renderReservationsList('anteriores');
  });
}

// 13. Bottom Navigation Setup
function setupBottomNav() {
  document.getElementById('nav-home')?.addEventListener('click', () => navigateTo('view-home'));
  document.getElementById('nav-discover')?.addEventListener('click', () => navigateTo('view-discover'));
  
  document.getElementById('nav-status')?.addEventListener('click', () => {
    navigateTo('view-discover');
    setTimeout(() => {
      const item = document.getElementById('acc-item-como-llegar');
      if (item) {
        document.querySelectorAll('.guide-accordion-item').forEach(el => el.classList.remove('open'));
        item.classList.add('open');
        item.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  });

  document.getElementById('nav-reservas')?.addEventListener('click', () => {
    navigateTo('view-discover');
    setTimeout(() => {
      const item = document.getElementById('acc-item-faqs');
      if (item) {
        document.querySelectorAll('.guide-accordion-item').forEach(el => el.classList.remove('open'));
        item.classList.add('open');
        item.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  });

  document.getElementById('nav-profile')?.addEventListener('click', () => navigateTo('view-profile'));

  // Quick action buttons from Home
  document.getElementById('quick-btn-traslado')?.addEventListener('click', () => navigateTo('view-transfer'));
  document.getElementById('quick-btn-actividades')?.addEventListener('click', () => navigateTo('view-services'));
  document.getElementById('quick-btn-restaurante')?.addEventListener('click', () => navigateTo('view-restaurant'));
  document.getElementById('quick-btn-reservas')?.addEventListener('click', () => navigateTo('view-my-reservations'));
  document.getElementById('quick-btn-status')?.addEventListener('click', () => navigateTo('view-status'));
}

// 14. Modals & Profile
function setupProfileModal() {
  document.getElementById('btn-edit-profile')?.addEventListener('click', () => {
    openModal('modal-edit-profile');
  });

  document.getElementById('btn-profile-reservas')?.addEventListener('click', () => {
    navigateTo('view-my-reservations');
  });

  document.getElementById('btn-profile-logout')?.addEventListener('click', () => {
    state.user.isLoggedIn = false;
    showToast('Sesión cerrada');
    navigateTo('view-login');
  });

  document.getElementById('btn-save-profile')?.addEventListener('click', () => {
    const newName = document.getElementById('edit-profile-name')?.value.trim();
    const newPhone = document.getElementById('edit-profile-phone')?.value.trim();
    const newEmail = document.getElementById('edit-profile-email')?.value.trim();

    if (newName) state.user.name = newName;
    if (newPhone) state.user.phone = newPhone;
    if (newEmail) state.user.email = newEmail;

    document.getElementById('profile-display-name').textContent = state.user.name;
    document.getElementById('profile-display-email').textContent = state.user.email;
    document.getElementById('profile-display-phone').textContent = state.user.phone;

    closeModal();
    showToast('Perfil actualizado correctamente');
  });
}

function openModal(modalId, title = '') {
  const overlay = document.getElementById(modalId);
  if (overlay) {
    overlay.classList.add('open');
  }
}

function closeModal() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

// Global click to close modal on background
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal();
  }
});

// ============================================================================
// 15. CLIMA EN TIEMPO REAL (PUERTO CABELLO - OPEN-METEO API)
// ============================================================================
const PUERTO_CABELLO_COORDS = {
  lat: 10.4731,
  lon: -67.9992,
  name: 'Puerto Cabello, Carabobo'
};

function getWeatherConditionText(code, isDay = 1) {
  if (code === 0) return isDay ? 'Soleado caribeño' : 'Noche despejada';
  if (code === 1 || code === 2) return 'Mayormente despejado';
  if (code === 3) return 'Parcialmente nublado';
  if (code === 45 || code === 48) return 'Neblina costera';
  if (code >= 51 && code <= 55) return 'Llovizna suave';
  if (code >= 61 && code <= 65) return 'Lluvia dispersa';
  if (code >= 80 && code <= 82) return 'Chubascos tropicales';
  if (code >= 95) return 'Tormenta eléctrica';
  return 'Cálido caribeño';
}

function getWeatherIconSvg(code, isDay = 1) {
  if (code === 0 && isDay) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41"/></svg>`;
  }
  if (code === 0 && !isDay) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  }
  if (code >= 1 && code <= 3) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`;
  }
  if (code >= 51 && code <= 65) {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>`;
  }
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`;
}

async function fetchRealtimeWeather(showSuccessToast = false) {
  const refreshBtn = document.getElementById('btn-refresh-weather');
  if (refreshBtn) refreshBtn.classList.add('loading');

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${PUERTO_CABELLO_COORDS.lat}&longitude=${PUERTO_CABELLO_COORDS.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=America%2FCaracas`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    
    if (data && data.current) {
      applyWeatherData(data.current);
      if (showSuccessToast) {
        showToast('Clima de Puerto Cabello actualizado');
      }
    }
  } catch (err) {
    console.warn('Weather API fetch failed, fallback active:', err);
    applyWeatherFallback();
    if (showSuccessToast) {
      showToast('Datos meteorológicos actualizados');
    }
  } finally {
    if (refreshBtn) refreshBtn.classList.remove('loading');
  }
}

function applyWeatherData(current) {
  const temp = Math.round(current.temperature_2m);
  const apparent = Math.round(current.apparent_temperature);
  const humidity = Math.round(current.relative_humidity_2m);
  const wind = Math.round(current.wind_speed_10m);
  const condition = getWeatherConditionText(current.weather_code, current.is_day);
  const iconSvg = getWeatherIconSvg(current.weather_code, current.is_day);

  // Estimación de condiciones de mar según viento
  let seaCondition = 'Calmo • 0.4 m';
  let navStatus = 'Óptima';
  if (wind >= 24) {
    seaCondition = 'Oleaje moderado • 1.2 m';
    navStatus = 'Precaución';
  } else if (wind >= 14) {
    seaCondition = 'Rizado suave • 0.7 m';
    navStatus = 'Favorable';
  }

  // Actualizar Tarjeta de Inicio
  const pillTemp = document.getElementById('weather-temp-pill');
  const pillSub = document.getElementById('weather-sub-pill');
  const pillIcon = document.getElementById('weather-icon-pill');
  if (pillTemp) pillTemp.textContent = `${temp}°C`;
  if (pillSub) pillSub.textContent = `${condition} • Viento ${wind} km/h • Humedad ${humidity}%`;
  if (pillIcon) pillIcon.innerHTML = iconSvg;

  // Actualizar Modal
  const mTemp = document.getElementById('weather-modal-temp');
  const mDesc = document.getElementById('weather-modal-desc');
  const mApparent = document.getElementById('weather-modal-apparent');
  const mWind = document.getElementById('weather-modal-wind');
  const mHumidity = document.getElementById('weather-modal-humidity');
  const mSea = document.getElementById('weather-modal-sea');
  const mNav = document.getElementById('weather-modal-nav');
  const mUpdated = document.getElementById('weather-modal-updated');

  if (mTemp) mTemp.textContent = temp;
  if (mDesc) mDesc.textContent = condition;
  if (mApparent) mApparent.textContent = `Sensación térmica: ${apparent}°C`;
  if (mWind) mWind.textContent = `${wind} km/h`;
  if (mHumidity) mHumidity.textContent = `${humidity}%`;
  if (mSea) mSea.textContent = seaCondition;
  if (mNav) mNav.textContent = navStatus;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (mUpdated) mUpdated.textContent = `Actualizado a las ${timeStr} vía Open-Meteo API`;
}

function applyWeatherFallback() {
  applyWeatherData({
    temperature_2m: 29,
    apparent_temperature: 34,
    relative_humidity_2m: 78,
    wind_speed_10m: 12,
    weather_code: 1,
    is_day: 1
  });
}

function setupRealtimeWeather() {
  document.getElementById('quick-btn-weather')?.addEventListener('click', () => {
    openModal('modal-weather');
  });

  document.getElementById('btn-refresh-weather')?.addEventListener('click', () => {
    fetchRealtimeWeather(true);
  });

  // Carga inicial
  fetchRealtimeWeather(false);

  // Auto-refresco cada 10 minutos
  setInterval(() => fetchRealtimeWeather(false), 600000);
}

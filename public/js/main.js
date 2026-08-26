// ---- Abertura animada ----
document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('introOverlay');
  if (intro) {
    setTimeout(() => intro.classList.add('intro-done'), 2400);
  }

  // Navbar: fundo sólido ao fazer scroll
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // Menu hambúrguer (mobile)
  const hamburger = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  const navScrim = document.getElementById('navScrim');
  function closeMobileMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    navScrim.classList.remove('open');
  }
  if (hamburger && navLinks && navScrim) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      navScrim.classList.toggle('open', isOpen);
    });
    navScrim.addEventListener('click', closeMobileMenu);
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
  }

  // Fade-in ao scroll (secções)
  const sections = document.querySelectorAll('.fade-section');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  sections.forEach(s => sectionObserver.observe(s));

  // Fade-in em cascata (galeria e cards de serviço)
  const staggerItems = document.querySelectorAll('.stagger-item');
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const siblings = Array.from(el.parentElement.children);
        const idx = siblings.indexOf(el);
        setTimeout(() => el.classList.add('visible'), idx * 70);
        staggerObserver.unobserve(el);
      }
    });
  }, { threshold: 0.1 });
  staggerItems.forEach(el => staggerObserver.observe(el));

  // Data mínima = hoje
  const dateInput = document.getElementById('dateInput');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.addEventListener('change', loadSlots);
  }
  const serviceSelect = document.getElementById('serviceSelect');
  if (serviceSelect) serviceSelect.addEventListener('change', () => { updateProgress(); loadSlots(); });

  // Destaca o dia de hoje na secção de Horários
  const todayWeekday = new Date().getDay();
  const todayRow = document.querySelector(`.hours-day-row[data-weekday="${todayWeekday}"]`);
  if (todayRow) {
    todayRow.classList.add('is-today');
    const tag = todayRow.querySelector('.today-tag');
    if (tag) tag.style.display = 'inline-block';
  }
});

// ---- Modal login/registo ----
function openModal(form) {
  document.getElementById('authModal').classList.add('active');
  switchForm(form);
}
function closeModal() {
  document.getElementById('authModal').classList.remove('active');
}
function switchForm(form) {
  document.getElementById('loginForm').style.display = form === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = form === 'register' ? 'block' : 'none';
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.style.color = isHidden ? 'var(--wine)' : '';
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.style.display = 'none';
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; errEl.style.display = 'block'; return; }
    location.reload();
  } catch (e) { errEl.textContent = 'Erro de ligação.'; errEl.style.display = 'block'; }
}

async function doRegister() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const phone = document.getElementById('regPhone').value;
  const password = document.getElementById('regPassword').value;
  const errEl = document.getElementById('regError');
  errEl.style.display = 'none';
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; errEl.style.display = 'block'; return; }
    location.reload();
  } catch (e) { errEl.textContent = 'Erro de ligação.'; errEl.style.display = 'block'; }
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  location.reload();
}

// ---- Sistema de marcações ----
let selectedTime = null;

function updateProgress() {
  const serviceId = document.getElementById('serviceSelect')?.value;
  const date = document.getElementById('dateInput')?.value;
  const d1 = document.getElementById('progDot1');
  const d2 = document.getElementById('progDot2');
  const d3 = document.getElementById('progDot3');
  if (!d1) return;
  d1.classList.toggle('done', !!serviceId);
  d2.classList.toggle('done', !!serviceId && !!date);
  d3.classList.toggle('done', !!serviceId && !!date && !!selectedTime);
}

async function loadSlots() {
  const serviceId = document.getElementById('serviceSelect').value;
  const date = document.getElementById('dateInput').value;
  const grid = document.getElementById('slotsGrid');
  const confirmBtn = document.getElementById('confirmBtn');
  grid.innerHTML = '';
  selectedTime = null;
  confirmBtn.disabled = true;
  updateProgress();

  if (!serviceId || !date) return;

  try {
    const res = await fetch(`/api/availability/${date}?service_id=${serviceId}`);
    const data = await res.json();
    if (!data.slots.length) {
      grid.innerHTML = `<p style="grid-column:1/-1; color:rgba(251,244,234,0.5);">${MSG_NO_SLOTS}</p>`;
      return;
    }
    data.slots.forEach(slot => {
      const btn = document.createElement('button');
      btn.className = 'slot-btn';
      btn.type = 'button';
      btn.textContent = slot;
      btn.onclick = () => {
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedTime = slot;
        confirmBtn.disabled = false;
        updateProgress();
      };
      grid.appendChild(btn);
    });
  } catch (e) {
    console.error(e);
  }
}

async function confirmBooking() {
  if (!IS_LOGGED_IN) { openModal('login'); return; }
  const serviceId = document.getElementById('serviceSelect').value;
  const date = document.getElementById('dateInput').value;
  if (!serviceId || !date || !selectedTime) return;

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: serviceId, date, time: selectedTime })
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    alert(MSG_SUCCESS);
    location.reload();
  } catch (e) {
    console.error(e);
  }
}

// ---- Minhas marcações ----
async function openMyBookings() {
  const modal = document.getElementById('myBookingsModal');
  const list = document.getElementById('myBookingsList');
  modal.classList.add('active');
  list.innerHTML = '<p style="color:var(--text-soft); font-size:0.9rem;">…</p>';
  try {
    const res = await fetch('/api/my-bookings');
    const data = await res.json();
    if (!data.bookings || !data.bookings.length) {
      list.innerHTML = `<p style="color:var(--text-soft); font-size:0.9rem;">${NO_BOOKINGS_YET}</p>`;
      return;
    }
    list.innerHTML = '';
    data.bookings.forEach(b => {
      const name = LANG === 'pt' ? b.name_pt : b.name_en;
      const dateStr = new Date(b.booking_date).toLocaleDateString(LANG === 'pt' ? 'pt-PT' : 'en-GB');
      const timeStr = b.start_time.slice(0, 5);
      const div = document.createElement('div');
      div.className = 'mybooking-item';
      const canCancel = b.status === 'pending' || b.status === 'confirmed';
      div.innerHTML = `
        <div class="row1">
          <span class="service-name">${name}</span>
          <span class="status-badge ${b.status}">${STATUS_LABELS[b.status] || b.status}</span>
        </div>
        <div class="meta">${dateStr} · ${timeStr}</div>
        ${canCancel ? `<span class="cancel-link" data-id="${b.id}">${CANCEL_LABEL}</span>` : ''}
      `;
      if (canCancel) {
        div.querySelector('.cancel-link').onclick = () => cancelBooking(b.id);
      }
      list.appendChild(div);
    });
  } catch (e) {
    console.error(e);
    list.innerHTML = '<p style="color:var(--danger); font-size:0.9rem;">Erro ao carregar.</p>';
  }
}
function closeMyBookings() {
  document.getElementById('myBookingsModal').classList.remove('active');
}
async function cancelBooking(id) {
  try {
    await fetch(`/api/bookings/${id}/cancel`, { method: 'POST' });
    openMyBookings();
  } catch (e) {
    console.error(e);
  }
}

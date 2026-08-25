// ---- Fade-in ao scroll ----
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.fade-section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  sections.forEach(s => observer.observe(s));

  // Data mínima = hoje
  const dateInput = document.getElementById('dateInput');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.addEventListener('change', loadSlots);
  }
  const serviceSelect = document.getElementById('serviceSelect');
  if (serviceSelect) serviceSelect.addEventListener('change', loadSlots);
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

async function loadSlots() {
  const serviceId = document.getElementById('serviceSelect').value;
  const date = document.getElementById('dateInput').value;
  const grid = document.getElementById('slotsGrid');
  const confirmBtn = document.getElementById('confirmBtn');
  grid.innerHTML = '';
  selectedTime = null;
  confirmBtn.disabled = true;

  if (!serviceId || !date) return;

  try {
    const res = await fetch(`/api/availability/${date}?service_id=${serviceId}`);
    const data = await res.json();
    if (!data.slots.length) {
      grid.innerHTML = `<p style="grid-column:1/-1; color:#999;">${MSG_NO_SLOTS}</p>`;
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

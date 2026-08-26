require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcrypt');
const path = require('path');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  store: new pgSession({ pool, tableName: 'session', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'gleyci-hair-studio-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, secure: false }
}));

// ---- Idioma (cookie-based, como nos outros projetos) ----
const translations = {
  pt: {
    nav_home: "Início", nav_gallery: "Galeria", nav_services: "Serviços", nav_location: "Localização", nav_booking: "Marcações",
    login: "Entrar", logout: "Sair", my_bookings: "As minhas marcações",
    hero_tag: "Especialista em Loiros · Lisboa",
    hero_title: "Beleza e cor com técnica Toni&Guy",
    hero_sub: "Especialista em loiros e correções de cor. Transformo o teu cabelo com precisão e cuidado.",
    hero_btn: "Marcar agora",
    gallery_tag: "Trabalhos",
    gallery_title: "O que fazemos",
    services_tag: "Preços",
    services_title: "Os nossos serviços",
    booking_tag: "Marcações",
    booking_title: "Reserva o teu horário",
    step_service: "1. Escolhe o serviço",
    step_date: "2. Escolhe o dia",
    step_time: "3. Escolhe o horário",
    confirm: "Confirmar marcação",
    login_title: "Entrar",
    register_title: "Criar Conta",
    name: "Nome", email: "Email", phone: "Telemóvel", password: "Palavra-passe",
    no_account: "Não tens conta? Regista-te", have_account: "Já tens conta? Entra",
    select_placeholder: "-- selecionar --",
    no_slots: "Sem horários disponíveis neste dia.",
    booking_success: "Pedido de marcação enviado! Vais receber confirmação assim que a Gleyci aceitar.",
    booking_note: "O teu pedido fica pendente até a Gleyci confirmar.",
    footer_rights: "Todos os direitos reservados.",
    my_bookings_title: "As minhas marcações",
    status_pending: "Pendente", status_confirmed: "Confirmada", status_cancelled: "Cancelada", status_rejected: "Recusada",
    no_bookings_yet: "Ainda não tens marcações.",
    cancel_booking: "Cancelar",
    show_password: "Mostrar palavra-passe",
    location_tag: "Onde estamos", location_title: "Localização & Horários",
    hours_title: "Horário", day_tue_sat: "Terça — Sábado", day_sun_mon: "Domingo e Segunda", closed: "Encerrado",
    address_title: "Morada", address_placeholder: "R. das Pedralvas 15, Lj 12, 1500-487 Lisboa",
    open_maps: "Abrir no Google Maps"
  },
  en: {
    nav_home: "Home", nav_gallery: "Gallery", nav_services: "Services", nav_location: "Location", nav_booking: "Booking",
    login: "Login", logout: "Logout", my_bookings: "My bookings",
    hero_tag: "Blonde Specialist · Lisbon",
    hero_title: "Beauty and color with Toni&Guy technique",
    hero_sub: "Specialist in blonde tones and color correction. Transforming your hair with precision and care.",
    hero_btn: "Book now",
    gallery_tag: "Portfolio",
    gallery_title: "What we do",
    services_tag: "Pricing",
    services_title: "Our services",
    booking_tag: "Booking",
    booking_title: "Reserve your slot",
    step_service: "1. Choose the service",
    step_date: "2. Choose the day",
    step_time: "3. Choose the time",
    confirm: "Confirm booking",
    login_title: "Login",
    register_title: "Create Account",
    name: "Name", email: "Email", phone: "Phone", password: "Password",
    no_account: "No account? Sign up", have_account: "Already have an account? Login",
    select_placeholder: "-- select --",
    no_slots: "No available times on this day.",
    booking_success: "Booking request sent! You'll be confirmed once Gleyci accepts it.",
    booking_note: "Your request stays pending until Gleyci confirms it.",
    footer_rights: "All rights reserved.",
    my_bookings_title: "My bookings",
    status_pending: "Pending", status_confirmed: "Confirmed", status_cancelled: "Cancelled", status_rejected: "Rejected",
    no_bookings_yet: "You don't have any bookings yet.",
    cancel_booking: "Cancel",
    show_password: "Show password",
    location_tag: "Where we are", location_title: "Location & Hours",
    hours_title: "Hours", day_tue_sat: "Tuesday — Saturday", day_sun_mon: "Sunday & Monday", closed: "Closed",
    address_title: "Address", address_placeholder: "R. das Pedralvas 15, Lj 12, 1500-487 Lisboa",
    open_maps: "Open in Google Maps"
  }
};

app.use((req, res, next) => {
  const lang = req.cookies.lang === 'en' ? 'en' : 'pt';
  res.locals.lang = lang;
  res.locals.T = translations[lang];
  res.locals.user = req.session.user || null;
  next();
});

app.get('/set-lang/:lang', (req, res) => {
  const lang = req.params.lang === 'en' ? 'en' : 'pt';
  res.cookie('lang', lang, { maxAge: 1000 * 60 * 60 * 24 * 365 });
  res.redirect(req.get('referer') || '/');
});

// ---- Middlewares de auth ----
function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'not_authenticated' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user || !req.session.user.is_admin) return res.status(403).send('Acesso negado');
  next();
}

// ---- Health check (para o cron-job.org) ----
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ---- Home ----
app.get('/', async (req, res) => {
  try {
    const { rows: services } = await pool.query('SELECT * FROM services WHERE active = TRUE ORDER BY display_order');
    res.render('index', { services });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar a página.');
  }
});

// ---- Auth: registo ----
app.post('/api/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash) VALUES ($1,$2,$3,$4) RETURNING id, name, email, is_admin`,
      [name, email, phone, hash]
    );
    req.session.user = rows[0];
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Este email já está registado.' });
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// ---- Auth: login ----
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas.' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Credenciais inválidas.' });

    // Garante que a conta definida em ADMIN_EMAIL é sempre admin, mesmo que
    // a conta tenha sido criada depois da última promoção no arranque.
    let isAdmin = user.is_admin;
    if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL && !user.is_admin) {
      await pool.query('UPDATE users SET is_admin = TRUE WHERE id = $1', [user.id]);
      isAdmin = true;
    }

    req.session.user = { id: user.id, name: user.name, email: user.email, is_admin: isAdmin };
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// ---- Disponibilidade: devolve slots livres para uma data ----
app.get('/api/availability/:date', async (req, res) => {
  const { date } = req.params;
  const { service_id } = req.query;
  try {
    const d = new Date(date + 'T00:00:00');
    const weekday = d.getDay();

    const { rows: rules } = await pool.query(
      'SELECT * FROM availability_rules WHERE weekday = $1 AND active = TRUE',
      [weekday]
    );
    if (rules.length === 0) return res.json({ slots: [] });

    let duration = 60;
    if (service_id) {
      const { rows: svc } = await pool.query('SELECT duration_minutes FROM services WHERE id = $1', [service_id]);
      if (svc.length) duration = svc[0].duration_minutes;
    }

    const { rows: booked } = await pool.query(
      `SELECT start_time FROM bookings WHERE booking_date = $1 AND status IN ('confirmed','pending')`,
      [date]
    );
    const bookedTimes = new Set(booked.map(b => b.start_time.slice(0, 5)));

    const { rows: blocked } = await pool.query(
      'SELECT * FROM blocked_dates WHERE blocked_date = $1',
      [date]
    );
    const fullyBlocked = blocked.some(b => !b.start_time);

    const slots = [];
    if (!fullyBlocked) {
      for (const rule of rules) {
        let [h, m] = rule.start_time.slice(0, 5).split(':').map(Number);
        const [endH, endM] = rule.end_time.slice(0, 5).split(':').map(Number);
        while (h < endH || (h === endH && m < endM)) {
          const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          const slotEndMinutes = h * 60 + m + duration;
          const ruleEndMinutes = endH * 60 + endM;
          if (slotEndMinutes <= ruleEndMinutes && !bookedTimes.has(timeStr)) {
            const isBlocked = blocked.some(b => b.start_time && timeStr >= b.start_time.slice(0,5) && timeStr < b.end_time.slice(0,5));
            if (!isBlocked) slots.push(timeStr);
          }
          m += 30;
          if (m >= 60) { m -= 60; h += 1; }
        }
      }
    }
    res.json({ slots, duration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao calcular disponibilidade.' });
  }
});

// ---- Criar marcação ----
app.post('/api/bookings', requireLogin, async (req, res) => {
  const { service_id, date, time } = req.body;
  try {
    const { rows: svc } = await pool.query('SELECT * FROM services WHERE id = $1', [service_id]);
    if (!svc.length) return res.status(400).json({ error: 'Serviço inválido.' });
    const duration = svc[0].duration_minutes;

    const [h, m] = time.split(':').map(Number);
    const endMinutes = h * 60 + m + duration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

    const { rows } = await pool.query(
      `INSERT INTO bookings (user_id, service_id, booking_date, start_time, end_time, status)
       VALUES ($1,$2,$3,$4,$5,'pending') RETURNING *`,
      [req.session.user.id, service_id, date, time, endTime]
    );
    res.json({ success: true, booking: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Este horário acabou de ser reservado. Escolhe outro.' });
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar marcação.' });
  }
});

// ---- Minhas marcações ----
app.get('/api/my-bookings', requireLogin, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT b.*, s.name_pt, s.name_en, s.price FROM bookings b
     JOIN services s ON s.id = b.service_id
     WHERE b.user_id = $1 ORDER BY b.booking_date DESC, b.start_time DESC`,
    [req.session.user.id]
  );
  res.json({ bookings: rows });
});

app.post('/api/bookings/:id/cancel', requireLogin, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2', [req.params.id, req.session.user.id]);
  if (!rows.length) return res.status(404).json({ error: 'Marcação não encontrada.' });
  await pool.query(`UPDATE bookings SET status = 'cancelled' WHERE id = $1`, [req.params.id]);
  res.json({ success: true });
});

// ---- Admin: gestão de marcações ----
app.get('/gestao', requireAdmin, async (req, res) => {
  const { rows: bookings } = await pool.query(
    `SELECT b.*, s.name_pt, u.name AS client_name, u.phone, u.email FROM bookings b
     JOIN services s ON s.id = b.service_id
     JOIN users u ON u.id = b.user_id
     WHERE b.status IN ('pending','confirmed')
     ORDER BY (b.status = 'pending') DESC, b.booking_date ASC, b.start_time ASC`
  );
  const { rows: services } = await pool.query('SELECT * FROM services ORDER BY display_order');
  res.render('admin', { bookings, services });
});

app.post('/api/admin/bookings/:id/accept', requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE bookings SET status = 'confirmed' WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Marcação não encontrada.' });
  res.json({ success: true, booking: rows[0] });
});

app.post('/api/admin/bookings/:id/reject', requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE bookings SET status = 'rejected' WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Marcação não encontrada.' });
  res.json({ success: true, booking: rows[0] });
});

app.post('/api/admin/block-date', requireAdmin, async (req, res) => {
  const { date, reason } = req.body;
  await pool.query('INSERT INTO blocked_dates (blocked_date, reason) VALUES ($1,$2)', [date, reason]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;

// Corre a migração automaticamente no arranque (útil em planos free sem Shell)
async function ensureDatabase() {
  try {
    const migrate = require('./db/migrate-inline');
    await migrate(pool);
  } catch (err) {
    console.error('Erro ao preparar base de dados:', err);
  }
}

// Torna admin a conta cujo email está em ADMIN_EMAIL (definido nas variáveis de ambiente do Render)
async function promoteAdmin() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) return;
  try {
    const { rows } = await pool.query(
      `UPDATE users SET is_admin = TRUE WHERE email = $1 AND is_admin = FALSE RETURNING id, email`,
      [email]
    );
    if (rows.length) console.log(`Conta promovida a admin: ${rows[0].email}`);
  } catch (err) {
    console.error('Erro ao promover admin:', err);
  }
}

ensureDatabase().then(promoteAdmin).finally(() => {
  app.listen(PORT, () => console.log(`Gleyci Hair Studio a correr na porta ${PORT}`));
});

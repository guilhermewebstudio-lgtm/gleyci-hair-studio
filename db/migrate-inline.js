// Versão da migração que corre automaticamente no arranque do servidor,
// usando a mesma pool de ligação já criada pelo server.js.
module.exports = async function ensureDatabase(pool) {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(30),
        password_hash VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name_pt VARCHAR(150) NOT NULL,
        name_en VARCHAR(150) NOT NULL,
        description_pt TEXT,
        description_en TEXT,
        price NUMERIC(10,2) NOT NULL,
        duration_minutes INT NOT NULL DEFAULT 60,
        active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS availability_rules (
        id SERIAL PRIMARY KEY,
        weekday INT NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        active BOOLEAN DEFAULT TRUE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS blocked_dates (
        id SERIAL PRIMARY KEY,
        blocked_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        reason VARCHAR(255)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        service_id INT REFERENCES services(id),
        booking_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(booking_date, start_time)
      );
    `);

    const { rows } = await client.query('SELECT COUNT(*) FROM availability_rules');
    if (parseInt(rows[0].count) === 0) {
      const weekdays = [2, 3, 4, 5, 6];
      for (const day of weekdays) {
        await client.query(
          `INSERT INTO availability_rules (weekday, start_time, end_time) VALUES ($1, '09:00', '19:00')`,
          [day]
        );
      }
      console.log('Horários base inseridos (Ter-Sáb, 9h-19h).');
    }

    const { rows: svcRows } = await client.query('SELECT COUNT(*) FROM services');
    if (parseInt(svcRows[0].count) === 0) {
      const services = [
        ['Corte', 'Haircut', 'Corte personalizado ao estilo do cliente', 'Personalized haircut tailored to you', 25, 45],
        ['Corte + Escova', 'Haircut + Blow-dry', 'Corte com escova modeladora final', 'Haircut with finishing blow-dry', 35, 60],
        ['Coloração Global', 'Global Color', 'Coloração completa do cabelo', 'Full hair coloring', 65, 120],
        ['Loiro - Iluminação', 'Blonde Highlights', 'Técnica de iluminação para loiros', 'Highlighting technique for blonde tones', 90, 150],
        ['Loiro - Balayage', 'Blonde Balayage', 'Técnica de balayage especializada', 'Specialized balayage technique', 120, 180],
        ['Correção de Cor', 'Color Correction', 'Correção profissional de cor mal feita', 'Professional fix for previous color mistakes', 150, 210],
        ['Hidratação Profunda', 'Deep Conditioning', 'Tratamento intensivo de hidratação', 'Intensive hydration treatment', 30, 45],
        ['Toni&Guy Cutting', 'Toni&Guy Creative Cutting', 'Corte criativo técnica Toni&Guy', 'Creative cutting - Toni&Guy technique', 40, 60]
      ];
      for (let i = 0; i < services.length; i++) {
        const [name_pt, name_en, desc_pt, desc_en, price, duration] = services[i];
        await client.query(
          `INSERT INTO services (name_pt, name_en, description_pt, description_en, price, duration_minutes, display_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [name_pt, name_en, desc_pt, desc_en, price, duration, i]
        );
      }
      console.log('Serviços (com preços de exemplo) inseridos.');
    }

    console.log('Base de dados pronta.');
  } finally {
    client.release();
  }
};

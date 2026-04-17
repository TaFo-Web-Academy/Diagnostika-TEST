const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && key.trim()) {
      let val = value.join('=').trim().replace(/^"|"$/g, '');
      process.env[key.trim()] = val;
    }
  });
}

async function check() {
  try {
    const res = await sql`SELECT COUNT(*) as count FROM sessions`;
    console.log('REAL_SESSIONS_COUNT:', res.rows[0].count);
    const recent = await sql`SELECT id, user_name FROM sessions LIMIT 5`;
    console.log('RECENT_SAMPLES:', JSON.stringify(recent.rows, null, 2));
  } catch (e) {
    console.error('DB_CHECK_ERROR:', e);
  } finally {
    process.exit(0);
  }
}

check();

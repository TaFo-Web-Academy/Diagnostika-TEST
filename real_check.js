const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

// Load .env.local strictly
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split(/\r?\n/).forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key && !key.startsWith('#')) {
        process.env[key] = val;
      }
    }
  });
}

async function check() {
  try {
    if (!process.env.POSTGRES_URL) {
      console.log('MISSING_ENV: POSTGRES_URL');
      process.exit(1);
    }
    const res = await sql`SELECT COUNT(*) as count FROM sessions`;
    console.log('REAL_SESSIONS_COUNT:', res.rows[0].count);
    const results = await sql`SELECT COUNT(*) as count FROM results`;
    console.log('REAL_RESULTS_COUNT:', results.rows[0].count);
    const clicks = await sql`SELECT COUNT(*) as count FROM clicks`;
    console.log('REAL_CLICKS_COUNT:', clicks.rows[0].count);
  } catch (e) {
    console.error('DB_CHECK_ERROR:', e.message);
  } finally {
    process.exit(0);
  }
}

check();

const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

// Load .env.local strictly to connect to the live DB
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

const resultMapping = {
  'Тарси радшавӣ': 1,
  'Ҷудоӣ аз худ': 2,
  'Беқадрии амиқ': 3
};

async function restore() {
  try {
    const csvPath = path.resolve(process.cwd(), 'src/lib/diagnostics_export (1).csv');
    if (!fs.existsSync(csvPath)) {
      console.error('CSV file not found at:', csvPath);
      process.exit(1);
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split(/\r?\n/);
    
    console.log(`Starting restoration of ${lines.length - 1} lines...`);

    let successCount = 0;
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parser for quoted fields: "v1","v2","v3"
      const matches = line.match(/"([^"]*)"/g);
      if (!matches || matches.length < 6) {
        console.log(`Skipping invalid line ${i}: ${line}`);
        continue;
      }

      const id = matches[0].replace(/"/g, '');
      const name = matches[1].replace(/"/g, '');
      const current_q = parseInt(matches[2].replace(/"/g, '')) || 0;
      const status = matches[3].replace(/"/g, '');
      const resultName = matches[4].replace(/"/g, '');
      const dateStr = matches[5].replace(/"/g, '');

      const resultType = resultMapping[resultName] || null;
      
      // Convert date string to valid TIMESTAMP
      // Example: "Fri Apr 17 2026 15:11:09 GMT+0000 (Coordinated Universal Time)"
      // JS Date can handle this, then we convert to ISO for PG
      const date = new Date(dateStr);
      const pgDate = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();

      try {
        await sql`
          INSERT INTO sessions (id, user_name, current_q, status, result_type, created_at, updated_at, answers)
          VALUES (${id}, ${name}, ${current_q}, ${status}, ${resultType}, ${pgDate}, ${pgDate}, '[]')
          ON CONFLICT (id) DO UPDATE SET
            user_name = EXCLUDED.user_name,
            current_q = EXCLUDED.current_q,
            status = EXCLUDED.status,
            result_type = EXCLUDED.result_type,
            updated_at = EXCLUDED.updated_at
        `;
        successCount++;
      } catch (dbErr) {
        console.error(`Error inserting ID ${id}:`, dbErr.message);
      }
    }

    console.log(`Restoration complete! Successfully restored/updated ${successCount} sessions.`);
  } catch (error) {
    console.error('Restoration failed:', error);
  } finally {
    process.exit(0);
  }
}

restore();

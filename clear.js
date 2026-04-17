const { sql } = require('@vercel/postgres');

async function clearDb() {
  try {
    console.log('Clearing database...');
    await sql`TRUNCATE sessions, results, clicks CASCADE`;
    console.log('Database cleared perfectly.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to clear DB:', error);
    process.exit(1);
  }
}

clearDb();

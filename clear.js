const { sql } = require('@vercel/postgres');

async function clearDb() {
  try {
    console.log('Clearing database...');
    // Truncate all tables including new ones
    await sql`TRUNCATE users, assignment_templates, assignments, user_answers, user_progress, sessions, results, clicks CASCADE`;
    console.log('Database cleared perfectly.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to clear DB:', error);
    process.exit(1);
  }
}

clearDb();


const { sql } = require('@vercel/postgres');

async function fixTemplates() {
  try {
    console.log('Fixing templates...');
    await sql`
      UPDATE assignment_templates 
      SET title = REPLACE(title, 'КҲАДАМИ', 'КАДАМИ'),
          content = REPLACE(content, 'КҲАДАМИ', 'КАДАМИ')
    `;
    console.log('Done fixing templates.');
  } catch (e) {
    console.error('Error:', e);
  }
}

fixTemplates();

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    await sql`TRUNCATE sessions, results, clicks CASCADE`;
    return NextResponse.json({ message: 'Database successfully cleared' });
  } catch (error) {
    console.error('Clear DB Error:', error);
    return NextResponse.json({ error: 'Failed to clear database' }, { status: 500 });
  }
}

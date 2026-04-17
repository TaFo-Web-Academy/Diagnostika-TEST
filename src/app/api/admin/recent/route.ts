import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Последние сессии для админки
export async function GET() {
  try {
    const result = await sql`
      SELECT id, user_name, current_q, answers, status, result_type, created_at, updated_at
      FROM sessions 
      ORDER BY created_at DESC 
      LIMIT 100
    `;
    
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Recent sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
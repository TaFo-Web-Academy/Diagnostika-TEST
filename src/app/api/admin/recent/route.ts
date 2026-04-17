import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Последние сессии для админки
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 5000);
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await sql`
      SELECT id, user_name, current_q, answers, status, result_type, created_at, updated_at
      FROM sessions 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Recent sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await sql`
      SELECT id, user_name, user_note, created_at, result_type
      FROM sessions 
      WHERE user_note IS NOT NULL AND user_note != ''
      ORDER BY updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Fetch notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

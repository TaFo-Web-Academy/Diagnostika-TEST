import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Поиск по пользователям
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }
    
    const result = await sql`
      SELECT id, name, phone, telegram_id, subscription_status, created_at
      FROM users 
      WHERE name ILIKE ${'%' + query + '%'} 
         OR id::TEXT LIKE ${'%' + query + '%'}
         OR phone LIKE ${'%' + query + '%'}
      ORDER BY created_at DESC 
      LIMIT 15
    `;
    
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET: Поиск по ID или имени
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }
    
    const result = await sql`
      SELECT * FROM sessions 
      WHERE id LIKE ${'%' + query + '%'} OR user_name LIKE ${'%' + query + '%'}
      ORDER BY created_at DESC 
      LIMIT 20
    `;
    
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
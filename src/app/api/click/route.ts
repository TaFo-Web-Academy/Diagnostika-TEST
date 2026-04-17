import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// POST: Записать клик по ссылке (Telegram)
export async function POST(request: Request) {
  try {
    const { sessionId, linkType } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }
    
    await sql`
      INSERT INTO clicks (session_id, link_type) VALUES (${sessionId}, ${linkType || 'telegram'})
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Click error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { sessionId, note } = await request.json();

    if (!sessionId || note === undefined) {
      return NextResponse.json({ error: 'sessionId and note required' }, { status: 400 });
    }

    await sql`
      UPDATE sessions 
      SET user_note = ${note}, 
          updated_at = NOW()
      WHERE id = ${sessionId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

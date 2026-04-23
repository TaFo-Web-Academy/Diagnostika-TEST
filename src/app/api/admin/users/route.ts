import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Список пользователей
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const result = await sql`
      SELECT 
        u.*,
        up.current_streak,
        up.longest_streak,
        up.total_points,
        up.total_days_completed,
        up.level
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      ORDER BY u.created_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

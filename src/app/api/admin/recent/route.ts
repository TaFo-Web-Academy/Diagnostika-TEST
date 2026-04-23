import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Последние активные пользователи для админки
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Получаем пользователей с их последней активностью
    const result = await sql`
      SELECT 
        u.*,
        up.current_streak,
        up.total_points,
        up.total_days_completed,
        a.assigned_date,
        a.status as last_assignment_status,
        COUNT(ua.id) as recent_answers_count
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN assignments a ON a.user_id = u.id AND a.assigned_date = CURRENT_DATE
      LEFT JOIN user_answers ua ON ua.user_id = u.id AND ua.created_at >= NOW() - INTERVAL '1 day'
      GROUP BY u.id, up.id, a.id
      ORDER BY GREATEST(u.created_at, a.assigned_date) DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Recent users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

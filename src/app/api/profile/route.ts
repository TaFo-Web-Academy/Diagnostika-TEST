import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Получить прогресс и историю пользователя
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    // Получаем профиль пользователя
    const userResult = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = userResult.rows[0];

    // Получаем прогресс
    const progressResult = await sql`SELECT * FROM user_progress WHERE user_id = ${userId}`;
    const progress = progressResult.rows[0] || {
      current_streak: 0,
      longest_streak: 0,
      total_points: 0,
      total_days_completed: 0,
      level: 1
    };

    // Получаем историю заданий
    const assignmentsResult = await sql`
      SELECT a.*, at.title, at.content,
             (SELECT COUNT(*) FROM user_answers ua WHERE ua.assignment_id = a.id) as answers_count
      FROM assignments a
      JOIN assignment_templates at ON a.template_id = at.id
      WHERE a.user_id = ${userId}
      ORDER BY a.assigned_date DESC
      LIMIT 30
    `;

    // Получаем последние ответы
    const lastAnswersResult = await sql`
      SELECT ua.*, a.assigned_date
      FROM user_answers ua
      JOIN assignments a ON ua.assignment_id = a.id
      WHERE ua.user_id = ${userId}
      ORDER BY a.assigned_date DESC, ua.created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({
      user,
      progress,
      assignments: assignmentsResult.rows,
      recentAnswers: lastAnswersResult.rows
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

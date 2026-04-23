import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Полная информация о пользователе
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);

    const userResult = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const progressResult = await sql`SELECT * FROM user_progress WHERE user_id = ${userId}`;
    const assignmentsResult = await sql`
      SELECT a.*, at.title, at.content
      FROM assignments a
      JOIN assignment_templates at ON a.template_id = at.id
      WHERE a.user_id = ${userId}
      ORDER BY a.assigned_date DESC
      LIMIT 30
    `;

    const answersResult = await sql`
      SELECT ua.*, a.assigned_date
      FROM user_answers ua
      JOIN assignments a ON ua.assignment_id = a.id
      WHERE ua.user_id = ${userId}
      ORDER BY a.assigned_date DESC, ua.created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({
      user: userResult.rows[0],
      progress: progressResult.rows[0],
      assignments: assignmentsResult.rows,
      recentAnswers: answersResult.rows
    });
  } catch (error) {
    console.error('Admin user detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

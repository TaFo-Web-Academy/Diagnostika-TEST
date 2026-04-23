import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Статистика для админ-панели (новая модель)
export async function GET() {
  try {
    // Total users
    const totalResult = await sql`SELECT COUNT(*) as count FROM users`;
    const totalUsers = Number(totalResult.rows[0]?.count || 0);

    // Premium users
    const premiumResult = await sql`
      SELECT COUNT(*) as count FROM users WHERE subscription_status = 'premium'
    `;
    const premiumUsers = Number(premiumResult.rows[0]?.count || 0);

    // Completed assignments
    const completedResult = await sql`
      SELECT COUNT(*) as count FROM assignments WHERE status = 'completed'
    `;
    const completedAssignments = Number(completedResult.rows[0]?.count || 0);

    // Total points
    const pointsResult = await sql`
      SELECT COALESCE(SUM(total_points), 0) as sum FROM user_progress
    `;
    const totalPoints = Number(pointsResult.rows[0]?.sum || 0);

    // Average streak
    const avgStreakResult = await sql`
      SELECT COALESCE(AVG(current_streak), 0) as avg FROM user_progress
    `;
    const avgStreak = Number(avgStreakResult.rows[0]?.avg || 0);

    // Daily activity (last 10 days)
    const dailyResult = await sql`
      SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as active_users
      FROM assignments
      WHERE created_at >= NOW() - INTERVAL '10 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const dailyActivity = dailyResult.rows.map(row => ({
      date: row.date,
      active: Number(row.active_users)
    }));

    // Most completed assignments
    const topAssignmentsResult = await sql`
      SELECT at.title, COUNT(*) as count
      FROM assignments a
      JOIN assignment_templates at ON a.template_id = at.id
      WHERE a.status = 'completed'
      GROUP BY at.title
      ORDER BY count DESC
      LIMIT 5
    `;

    return NextResponse.json({
      totalUsers,
      premiumUsers,
      completedAssignments,
      totalPoints,
      avgStreak: Math.round(avgStreak * 10) / 10,
      dailyActivity,
      topAssignments: topAssignmentsResult.rows
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

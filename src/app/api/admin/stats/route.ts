import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET: Статистика для админ-панели
export async function GET() {
  try {
    // Total sessions
    const totalResult = await sql`SELECT COUNT(*) as count FROM sessions`;
    const totalSessions = Number(totalResult.rows[0]?.count || 0);

    // Finished sessions
    const finishedResult = await sql`
      SELECT COUNT(*) as count FROM sessions WHERE status = 'finished'
    `;
    const finishedSessions = Number(finishedResult.rows[0]?.count || 0);

    // Not finished (active)
    const activeResult = await sql`
      SELECT COUNT(*) as count FROM sessions WHERE status = 'active'
    `;
    const notFinishedSessions = Number(activeResult.rows[0]?.count || 0);

    // Results breakdown
    const resultsBreakdownResult = await sql`
      SELECT result_type, COUNT(*) as count 
      FROM sessions 
      WHERE status = 'finished' AND result_type IS NOT NULL
      GROUP BY result_type
    `;
    const resultsBreakdown = resultsBreakdownResult.rows.map(row => ({
      result_type: row.result_type,
      count: Number(row.count)
    }));

    // Clicks count
    const clicksResult = await sql`SELECT COUNT(*) as count FROM clicks`;
    const clicksCount = Number(clicksResult.rows[0]?.count || 0);

    // Daily stats (last 10 days)
    const dailyStatsResult = await sql`
      SELECT DATE(s.created_at) as date, 
             COUNT(DISTINCT s.id) as sessions, 
             COUNT(DISTINCT CASE WHEN s.status = 'finished' THEN s.id END) as finished
      FROM sessions s
      WHERE s.created_at >= NOW() - INTERVAL '10 days'
      GROUP BY DATE(s.created_at)
      ORDER BY date ASC
    `;
    const dailyStats = dailyStatsResult.rows.map(row => ({
      date: row.date,
      sessions: Number(row.sessions),
      finished: Number(row.finished)
    }));

    // Both finished and clicked
    const bothResult = await sql`
      SELECT COUNT(DISTINCT s.id) as count 
      FROM sessions s 
      INNER JOIN clicks c ON s.id = c.session_id 
      WHERE s.status = 'finished'
    `;
    const bothFinishedAndClicked = Number(bothResult.rows[0]?.count || 0);

    return NextResponse.json({
      totalSessions,
      finishedSessions,
      notFinishedSessions,
      resultsBreakdown,
      clicksCount,
      dailyStats,
      bothFinishedAndClicked
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
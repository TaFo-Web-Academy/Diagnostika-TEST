import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    const result = await sql`
      WITH RecentAnswers AS (
        SELECT 
          user_id,
          question_key,
          answer_text,
          ROW_NUMBER() OVER (PARTITION BY user_id, question_key ORDER BY created_at DESC) as rn
        FROM user_answers
      )
      SELECT 
        u.id,
        u.name,
        up.current_streak as streak,
        MAX(CASE WHEN ra.question_key = 'q1' AND ra.rn = 1 THEN ra.answer_text END) as q1,
        MAX(CASE WHEN ra.question_key = 'q2' AND ra.rn = 1 THEN ra.answer_text END) as q2,
        MAX(CASE WHEN ra.question_key = 'q3' AND ra.rn = 1 THEN ra.answer_text END) as q3,
        MAX(CASE WHEN ra.question_key = 'q4' AND ra.rn = 1 THEN ra.answer_text END) as q4,
        MAX(CASE WHEN ra.question_key = 'q5' AND ra.rn = 1 THEN ra.answer_text END) as q5,
        MAX(CASE WHEN ra.question_key = 'note' AND ra.rn = 1 THEN ra.answer_text END) as note
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN RecentAnswers ra ON u.id = ra.user_id
      GROUP BY u.id, u.name, up.current_streak
      ORDER BY u.id DESC
    `;

    const data = result.rows;

    if (format === 'csv') {
      const headers = [
        'ID', 'Номи корбар', 'Стрик', 
        'Савол 1', 'Савол 2', 'Савол 3', 'Савол 4', 'Савол 5', 'Дарс чи омухтед'
      ];
      
      let csv = '\uFEFF' + headers.join(',') + '\n';
      
      data.forEach((u: any) => {
        const row = [
          u.id,
          u.name || '',
          u.streak || 0,
          u.q1 || '0',
          u.q2 || '0',
          u.q3 || '0',
          u.q4 || '0',
          u.q5 || '0',
          u.note || '-'
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
        csv += row + '\n';
      });
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename=users_answers.csv'
        }
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

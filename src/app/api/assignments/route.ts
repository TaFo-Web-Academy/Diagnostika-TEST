import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Получить текущее задание для пользователя
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Получаем или создаём assignment на сегодня
    let assignmentResult = await sql`
      SELECT a.*, at.title, at.content 
      FROM assignments a
      JOIN assignment_templates at ON a.template_id = at.id
      WHERE a.user_id = ${userId} AND a.assigned_date = ${today}
    `;

    if (assignmentResult.rows.length === 0) {
      // Получаем текущий шаблон (по дню недели или по порядку)
      const dayOfWeek = new Date().getDay() || 7; // 1-7 понедельник-воскресенье
      
      const templateResult = await sql`
        SELECT * FROM assignment_templates 
        WHERE is_active = true 
        ORDER BY day_number 
        LIMIT 1 OFFSET ${dayOfWeek - 1}
      `;

      if (templateResult.rows.length === 0) {
        // Если нет шаблона на этот день, берём первый активный
        const fallbackResult = await sql`
          SELECT * FROM assignment_templates 
          WHERE is_active = true 
          ORDER BY day_number 
          LIMIT 1
        `;
        if (fallbackResult.rows.length === 0) {
          return NextResponse.json({ error: 'No assignment template found' }, { status: 404 });
        }
        assignmentResult = await sql`
          INSERT INTO assignments (user_id, template_id, assigned_date, status)
          VALUES (${userId}, ${fallbackResult.rows[0].id}, ${today}, 'pending')
          ON CONFLICT (user_id, assigned_date) DO NOTHING
          RETURNING *
        `;
      } else {
        assignmentResult = await sql`
          INSERT INTO assignments (user_id, template_id, assigned_date, status)
          VALUES (${userId}, ${templateResult.rows[0].id}, ${today}, 'pending')
          ON CONFLICT (user_id, assigned_date) DO NOTHING
          RETURNING *
        `;
      }
    }

    const assignment = assignmentResult.rows[0];

    // Получаем ответы пользователя
    const answersResult = await sql`
      SELECT * FROM user_answers 
      WHERE user_id = ${userId} AND assignment_id = ${assignment.id}
    `;

    return NextResponse.json({
      assignment,
      answers: answersResult.rows
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

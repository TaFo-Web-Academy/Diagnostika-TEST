import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// POST: Сохранить ответ пользователя на задание
export async function POST(request: Request) {
  try {
    const { userId, assignmentId, questionKey, answerText, answerScore = 0 } = await request.json();

    if (!userId || !assignmentId || !questionKey) {
      return NextResponse.json({ error: 'userId, assignmentId and questionKey required' }, { status: 400 });
    }

    // Сохраняем/обновляем ответ
    const result = await sql`
      INSERT INTO user_answers (user_id, assignment_id, question_key, answer_text, answer_score, is_completed, updated_at)
      VALUES (${userId}, ${assignmentId}, ${questionKey}, ${answerText}, ${answerScore}, ${answerText.trim().length > 0}, NOW())
      ON CONFLICT (user_id, assignment_id, question_key) 
      DO UPDATE SET 
        answer_text = EXCLUDED.answer_text,
        answer_score = EXCLUDED.answer_score,
        is_completed = EXCLUDED.is_completed,
        updated_at = NOW()
      RETURNING *
    `;

    // Если все ответы заполнены (проверяем наличие q1-q5), то отмечаем assignment как completed
    const answersCheck = await sql`
      SELECT COUNT(*) as total, SUM(CASE WHEN answer_text IS NOT NULL AND answer_text != '' THEN 1 ELSE 0 END) as filled
      FROM user_answers 
      WHERE user_id = ${userId} AND assignment_id = ${assignmentId}
    `;

    const { total, filled } = answersCheck.rows[0];
    if (total === 5 && filled === 5) {
      await sql`
        UPDATE assignments 
        SET status = 'completed', 
            completed_at = NOW(),
            score = ${answerScore || 10} -- можно усложнить подсчёт
        WHERE id = ${assignmentId}
      `;

      // Обновляем прогресс пользователя
      await sql`
        INSERT INTO user_progress (user_id, total_points, total_days_completed, last_completed_date, current_streak, longest_streak)
        VALUES (${userId}, ${answerScore || 10}, 1, CURRENT_DATE, 1, 1)
        ON CONFLICT (user_id) DO UPDATE SET
          total_points = user_progress.total_points + ${answerScore || 10},
          total_days_completed = user_progress.total_days_completed + 1,
          last_completed_date = CURRENT_DATE,
          current_streak = CASE 
            WHEN user_progress.last_completed_date = CURRENT_DATE - INTERVAL '1 day' 
            THEN user_progress.current_streak + 1 
            ELSE 1 
          END,
          longest_streak = GREATEST(user_progress.longest_streak, 
            CASE 
              WHEN user_progress.last_completed_date = CURRENT_DATE - INTERVAL '1 day' 
              THEN user_progress.current_streak + 1 
              ELSE 1 
            END),
          updated_at = NOW()
      `;
    }

    return NextResponse.json({ success: true, answer: result.rows[0] });
  } catch (error) {
    console.error('Save answer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

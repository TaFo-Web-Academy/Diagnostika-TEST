import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// POST: Отправить ответ на текущий вопрос
export async function POST(request: Request) {
  try {
    const { sessionId, answerIndex } = await request.json();
    
    if (!sessionId || answerIndex === undefined) {
      return NextResponse.json({ error: 'sessionId and answerIndex required' }, { status: 400 });
    }

    // Получаем текущую сессию
    const result = await sql`
      SELECT * FROM sessions WHERE id = ${sessionId} AND status = 'active'
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Session not found or already finished' }, { status: 404 });
    }

    const session = result.rows[0];
    let answers = typeof session.answers === 'string' ? JSON.parse(session.answers) : session.answers;
    const currentQ = session.current_q;
    
    // Если ответ для текущего вопроса уже был, заменяем, иначе добавляем
    if (answers.length > currentQ) {
      answers[currentQ] = answerIndex;
    } else {
      answers.push(answerIndex);
    }

    const nextQ = currentQ + 1;
    const totalQuestions = 7;
    let newStatus = 'active';
    let resultType = null;

    // Проверка, завершён ли тест
    if (nextQ >= totalQuestions) {
      newStatus = 'finished';
      
      // Подсчёт результатов
      const counts = { A: 0, B: 0, V: 0 };
      answers.forEach((idx: number) => {
        if (idx === 0) counts.A++;
        else if (idx === 1) counts.B++;
        else if (idx === 2) counts.V++;
      });
      
      // Определяем тип результата
      let maxType = 'A';
      if (counts.B > counts.A && counts.B > counts.V) maxType = 'B';
      else if (counts.V > counts.A && counts.V > counts.B) maxType = 'V';
      
      const typeMap: Record<string, number> = { 'A': 1, 'B': 2, 'V': 3 };
      resultType = typeMap[maxType] || 1;
    }

    // Обновляем сессию
    await sql`
      UPDATE sessions 
      SET answers = ${JSON.stringify(answers)}, 
          current_q = ${nextQ}, 
          status = ${newStatus}, 
          result_type = ${resultType},
          updated_at = NOW()
      WHERE id = ${sessionId}
    `;

    // Если тест завершён — записать результат в отдельную таблицу
    if (newStatus === 'finished') {
      await sql`
        INSERT INTO results (session_id, result_type) VALUES (${sessionId}, ${resultType})
      `;
    }

    return NextResponse.json({
      success: true,
      nextQuestion: nextQ,
      status: newStatus,
      resultType: resultType
    });
  } catch (error) {
    console.error('Answer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
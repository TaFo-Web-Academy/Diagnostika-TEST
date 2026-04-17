import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';

function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

// POST: Начать новую сессию или получить существующую
export async function POST(request: Request) {
  try {
    const { sessionId, userName } = await request.json();
    
    if (sessionId) {
      // Проверить существование сессии
      const result = await sql`
        SELECT * FROM sessions WHERE id = ${sessionId}
      `;
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        // Обновить имя если новое
        if (userName && !row.user_name) {
          await sql`
            UPDATE sessions SET user_name = ${userName} WHERE id = ${sessionId}
          `;
          row.user_name = userName;
        }
        
        return NextResponse.json({
          sessionId: row.id,
          userName: row.user_name,
          currentQuestion: row.current_q,
          answers: row.answers,
          status: row.status,
          resultType: row.result_type
        });
      } else {
        // Сессия не найдена — создаём новую
        const newId = generateSessionId();
        await sql`
          INSERT INTO sessions (id, user_name) VALUES (${newId}, ${userName || null})
        `;
        
        return NextResponse.json({
          sessionId: newId,
          userName: userName,
          currentQuestion: 0,
          answers: [],
          status: 'active'
        });
      }
    } else {
      // Нет sessionId — создаём новую
      const newId = generateSessionId();
      await sql`
        INSERT INTO sessions (id, user_name, current_q, answers, status) 
        VALUES (${newId}, ${userName || null}, 0, '[]', 'active')
      `;
      
      return NextResponse.json({
        sessionId: newId,
        userName: userName,
        currentQuestion: 0,
        answers: [],
        status: 'active'
      });
    }
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Инициализируем БД
    await initDb().catch(e => console.error('DB Init error:', e));
    
    const body = await request.json();
    const { name, surname, age, maritalStatus, promoCode } = body;

    // Валидация
    if (!name || !promoCode) {
      return NextResponse.json({ error: 'Name and Promo are required' }, { status: 400 });
    }

    const safeAge = parseInt(age) || 0;

    const result = await sql`
      INSERT INTO users (name, surname, age, marital_status, promo_code)
      VALUES (${name}, ${surname || ''}, ${safeAge}, ${maritalStatus || ''}, ${promoCode})
      RETURNING id, name, created_at;
    `;

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('CRITICAL API ERROR:', error);
    return NextResponse.json({ 
      error: 'Ошибка сервера', 
      details: error.message 
    }, { status: 500 });
  }
}

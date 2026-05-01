import { sql, initDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Гарантируем наличие таблиц перед регистрацией
    await initDb();
    
    const body = await request.json();
    console.log('Registration attempt:', body);

    const { name, surname, age, maritalStatus, gender, promoCode } = body;

    // Базовая валидация
    if (!name) {
      return NextResponse.json({ error: 'Исм ҳатмист' }, { status: 400 });
    }
    
    if (!promoCode) {
      return NextResponse.json({ error: 'Промокод ҳатмист' }, { status: 400 });
    }

    const safeAge = parseInt(String(age)) || 0;
    const safeSurname = String(surname || '');
    const safeStatus = String(maritalStatus || '');
    const safeGender = String(gender || '');

    // Вставка данных
    const result = await sql`
      INSERT INTO ravoni_users (name, surname, age, marital_status, gender, promo_code)
      VALUES (${name}, ${safeSurname}, ${safeAge}, ${safeStatus}, ${safeGender}, ${promoCode})
      RETURNING id, name, surname, age, marital_status, gender, promo_code, created_at;
    `;

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Database failed to return the created user');
    }

    return NextResponse.json({ 
      user: result.rows[0],
      message: 'Registration successful' 
    }, { status: 201 });

  } catch (error: any) {
    console.error('CRITICAL Registration Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code // Postgres error code if available
    });

    return NextResponse.json({ 
      error: 'Registration failed', 
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 });
  }
}
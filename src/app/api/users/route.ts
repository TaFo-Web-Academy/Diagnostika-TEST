import { sql, initDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Гарантируем наличие таблиц перед регистрацией
    await initDb();
    
    const body = await request.json();
    const { name, surname, age, maritalStatus, gender, promoCode } = body;

    // Базовая валидация
    if (!name || !promoCode) {
      return NextResponse.json({ error: 'Name and Promo Code are required' }, { status: 400 });
    }

    const safeAge = parseInt(age) || 0;
    const safeSurname = surname || '';
    const safeStatus = maritalStatus || '';
    const safeGender = gender || '';

    // Вставка данных
    const result = await sql`
      INSERT INTO ravoni_users (name, surname, age, marital_status, gender, promo_code)
      VALUES (${name}, ${safeSurname}, ${safeAge}, ${safeStatus}, ${safeGender}, ${promoCode})
      RETURNING id, name, surname, age, marital_status, gender, promo_code, created_at;
    `;

    if (!result.rows[0]) {
      throw new Error('Database insert failed');
    }

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('CRITICAL Registration Error:', error);
    return NextResponse.json({ 
      error: 'Registration failed', 
      details: error.message 
    }, { status: 500 });
  }
}
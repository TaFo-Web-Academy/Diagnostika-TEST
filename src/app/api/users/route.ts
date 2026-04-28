import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await initDb(); // Убедимся, что таблицы созданы
    
    const body = await request.json();
    const { name, surname, age, maritalStatus, promoCode } = body;

    const result = await sql`
      INSERT INTO users (name, surname, age, marital_status, promo_code)
      VALUES (${name}, ${surname}, ${parseInt(age)}, ${maritalStatus}, ${promoCode})
      RETURNING id, name;
    `;

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('User registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

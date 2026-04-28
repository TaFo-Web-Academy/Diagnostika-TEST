import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await initDb();
    
    const body = await request.json();
    const { name, surname, age, maritalStatus, promoCode } = body;

    const result = await sql`
      INSERT INTO ravoni_users (name, surname, age, marital_status, promo_code)
      VALUES (${name}, ${surname || ''}, ${parseInt(age) || 0}, ${maritalStatus || ''}, ${promoCode})
      RETURNING id, name, created_at;
    `;

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

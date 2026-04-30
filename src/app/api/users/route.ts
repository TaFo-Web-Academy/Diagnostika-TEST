import { sql, initDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await initDb();
    
    const body = await request.json();
    const { name, surname, age, maritalStatus, gender, promoCode } = body;

    const result = await sql`
      INSERT INTO ravoni_users (name, surname, age, marital_status, gender, promo_code)
      VALUES (${name}, ${surname || ''}, ${parseInt(age) || 0}, ${maritalStatus || ''}, ${gender || ''}, ${promoCode})
      RETURNING id, name, surname, age, marital_status, gender, promo_code, created_at;
    `;

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
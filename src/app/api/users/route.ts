import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, surname, age, maritalStatus, gender, promoCode } = body;

    // Validate essential data
    if (!name || !promoCode) {
      return NextResponse.json({ error: 'Name and Promo Code are required' }, { status: 400 });
    }

    const safeAge = parseInt(age) || 0;
    const safeSurname = surname || '';
    const safeStatus = maritalStatus || '';
    const safeGender = gender || '';

    // Insert into ravoni_users
    const result = await sql`
      INSERT INTO ravoni_users (name, surname, age, marital_status, gender, promo_code)
      VALUES (${name}, ${safeSurname}, ${safeAge}, ${safeStatus}, ${safeGender}, ${promoCode})
      RETURNING id, name, surname, age, marital_status, gender, promo_code, created_at;
    `;

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error Details:', error);
    return NextResponse.json({ 
      error: 'Registration failed', 
      details: error.message 
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// POST: Создать/обновить пользователя
export async function POST(request: Request) {
  try {
    const { name, phone, telegramId, email } = await request.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO users (name, phone, telegram_id, email) 
      VALUES (${name.trim()}, ${phone || null}, ${telegramId || null}, ${email || null})
      ON CONFLICT (telegram_id) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        phone = COALESCE(EXCLUDED.phone, users.phone),
        email = COALESCE(EXCLUDED.email, users.email),
        updated_at = NOW()
        RETURNING *
    `;

    const user = result.rows[0];

    return NextResponse.json({
      user,
      message: 'User created/updated successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Получить пользователя по telegram_id или id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegram_id');
    const id = searchParams.get('id');

    let result;
    if (telegramId) {
      result = await sql`SELECT * FROM users WHERE telegram_id = ${telegramId}`;
    } else if (id) {
      result = await sql`SELECT * FROM users WHERE id = ${id}`;
    } else {
      return NextResponse.json({ error: 'telegram_id or id required' }, { status: 400 });
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

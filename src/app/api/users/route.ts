import { NextResponse } from 'next/server';
import { sql, initializeDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST: Создать/обновить пользователя
export async function POST(request: Request) {
  try {
    // Lazy initialization of database
    try {
      await initializeDatabase();
    } catch (dbInitError) {
      console.error('Database initialization error:', dbInitError);
      // Continue anyway, maybe tables already exist
    }

    const body = await request.json();
    console.log('Registration request body:', body);
    
    const { name, phone, telegramId, email } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name is required (min 2 chars)' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // INSERT with conflict handling
    const result = await sql`
      INSERT INTO users (name, phone, telegram_id, email) 
      VALUES (${trimmedName}, ${phone || null}, ${telegramId || null}, ${email || null})
      ON CONFLICT (telegram_id) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        phone = COALESCE(EXCLUDED.phone, users.phone),
        email = COALESCE(EXCLUDED.email, users.email),
        updated_at = NOW()
      RETURNING *
    `;

    console.log('DB INSERT/UPDATE Result rows:', result.rows);

    if (!result.rows || result.rows.length === 0) {
      console.error('DB Error: result.rows is empty after INSERT');
      return NextResponse.json(
        { error: 'Failed to create user in database (no rows returned)' }, 
        { status: 500 }
      );
    }

    const user = result.rows[0];
    console.log('USER CREATED/UPDATED:', user);

    return NextResponse.json({
      user,
      message: 'User created/updated successfully'
    });
  } catch (error: any) {
    console.error('CRITICAL: Create user error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message,
      code: error.code // PG error code if available
    }, { status: 500 });
  }
}

// GET: Получить пользователя по telegram_id или id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegram_id');
    const id = searchParams.get('id');

    console.log('GET user searchParams:', { telegramId, id });

    let result;
    if (telegramId) {
      result = await sql`SELECT * FROM users WHERE telegram_id = ${telegramId}`;
    } else if (id) {
      result = await sql`SELECT * FROM users WHERE id = ${id}`;
    } else {
      return NextResponse.json({ error: 'telegram_id or id required' }, { status: 400 });
    }

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}


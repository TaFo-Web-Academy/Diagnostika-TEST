import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, dayNumber, questionIndex, selectedOption } = body;

    await sql`
      INSERT INTO ravoni_answers (user_id, day_number, question_index, selected_option)
      VALUES (${userId}, ${dayNumber}, ${questionIndex}, ${selectedOption});
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { rows } = await sql`
      SELECT * FROM ravoni_answers 
      WHERE user_id = ${parseInt(userId)}
      ORDER BY day_number ASC, question_index ASC;
    `;

    return NextResponse.json({ answers: rows }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

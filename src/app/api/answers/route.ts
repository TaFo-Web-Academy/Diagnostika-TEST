import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, dayNumber, questionIndex, selectedOption } = body;

    await sql`
      INSERT INTO answers (user_id, day_number, question_index, selected_option)
      VALUES (${userId}, ${dayNumber}, ${questionIndex}, ${selectedOption});
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Answer saving error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

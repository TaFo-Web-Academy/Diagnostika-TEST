import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Удаляем все данные из таблиц
    await sql`TRUNCATE ravoni_users, ravoni_answers RESTART IDENTITY CASCADE;`;
    
    return NextResponse.json({ 
      message: 'Базаи маълумот бо муваффақият тоза карда шуд. Акнун шумо метавонед аз сифр оғоз кунед.' 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Хатогӣ дар тозакунии база', 
      details: error.message 
    }, { status: 500 });
  }
}

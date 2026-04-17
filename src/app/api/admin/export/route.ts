import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET: Экспорт данных (CSV или JSON)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    const result = await sql`
      SELECT id, user_name, current_q, status, result_type, created_at, updated_at
      FROM sessions 
      ORDER BY created_at DESC
    `;
    
    const sessions = result.rows;
    
    if (format === 'csv') {
      const headers = ['ID', 'Имя', 'Вопрос', 'Статус', 'Результат', 'Дата'];
      const resultNames: Record<number, string> = { 
        1: 'Тарси радшавӣ', 
        2: 'Ҷудоӣ аз худ', 
        3: 'Беқадрии амиқ' 
      };
      
      let csv = headers.join(',') + '\n';
      
      sessions.forEach((s: any) => {
        const row = [
          s.id,
          s.user_name || '',
          s.current_q,
          s.status,
          resultNames[s.result_type] || '',
          s.created_at || ''
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
        csv += row + '\n';
      });
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=diagnostics_export.csv'
        }
      });
    }
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
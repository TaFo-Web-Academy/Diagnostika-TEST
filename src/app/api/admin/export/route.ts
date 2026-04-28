import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    // Обновленный запрос под новую схему RAVONI
    const result = await sql`
      SELECT 
        u.id,
        u.name,
        u.surname,
        u.age,
        u.marital_status,
        u.promo_code,
        u.created_at,
        COUNT(a.id) as total_answers
      FROM users u
      LEFT JOIN answers a ON u.id = a.user_id
      GROUP BY u.id, u.name, u.surname, u.age, u.marital_status, u.promo_code, u.created_at
      ORDER BY u.id DESC
    `;

    const data = result.rows;

    if (format === 'csv') {
      const headers = ['ID', 'Name', 'Surname', 'Age', 'Marital Status', 'Promo', 'Created At'];
      let csv = '\uFEFF' + headers.join(',') + '\n';
      
      data.forEach((u: any) => {
        const row = [
          u.id,
          u.name || '',
          u.surname || '',
          u.age || '',
          u.marital_status || '',
          u.promo_code || '',
          u.created_at || ''
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
        csv += row + '\n';
      });
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename=ravoni_users.csv'
        }
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

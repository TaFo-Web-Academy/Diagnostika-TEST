import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Экспорт данных (CSV или JSON)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    // Получаем полные данные: пользователи + их прогресс + завершённые задания
    const result = await sql`
      SELECT 
        u.id as user_id,
        u.name,
        u.phone,
        u.email,
        u.subscription_status,
        u.created_at as user_created,
        up.current_streak,
        up.longest_streak,
        up.total_points,
        up.total_days_completed,
        up.level,
        COUNT(DISTINCT a.id) as total_assignments,
        COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_assignments
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN assignments a ON u.id = a.user_id
      GROUP BY u.id, up.id
      ORDER BY u.created_at DESC
    `;

    const users = result.rows;

    if (format === 'csv') {
      const headers = [
        'ID', 'Название', 'Номер телефона', 'Email', 
        'Статус подписки', 'Дата регистрации',
        'Текущий стрик', 'Макс. стрик', 'Всего баллов',
        'Завершено дней', 'Уровень', 'Всего заданий', 'Завершено заданий'
      ];
      
      let csv = headers.join(',') + '\n';
      
      users.forEach((u: any) => {
        const row = [
          u.user_id,
          u.name || '',
          u.phone || '',
          u.email || '',
          u.subscription_status || 'free',
          u.user_created || '',
          u.current_streak || 0,
          u.longest_streak || 0,
          u.total_points || 0,
          u.total_days_completed || 0,
          u.level || 1,
          u.total_assignments || 0,
          u.completed_assignments || 0
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
        csv += row + '\n';
      });
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=course_users_export.csv'
        }
      });
    }
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { sql, initDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Гарантируем наличие таблиц перед регистрацией
    await initDb();
    
    const body = await request.json();
    console.log('Registration attempt:', body);

    const { name, surname, age, maritalStatus, gender, promoCode, deviceId } = body;

    // Базовая валидация
    if (!name || !promoCode) {
      return NextResponse.json({ error: 'Ном ва Промокод ҳатмист' }, { status: 400 });
    }

    // 1. Проверяем, существует ли уже такой пользователь
    const existingUser = await sql`
      SELECT * FROM ravoni_users 
      WHERE name = ${name} AND surname = ${surname || ''} AND promo_code = ${promoCode}
      LIMIT 1;
    `;

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      
      // 2. Проверка на ОДНО устройство (One Device Policy)
      if (user.device_id && user.device_id !== deviceId) {
        return NextResponse.json({ 
          error: 'Ин аккаунт аллакай дар дигар телефон фаъол аст. Танҳо дар 1 таҷҳизот истифода бурдан мумкин аст.' 
        }, { status: 403 });
      }

      // Если device_id еще не был привязан, привязываем его сейчас
      if (!user.device_id && deviceId) {
        await sql`UPDATE ravoni_users SET device_id = ${deviceId} WHERE id = ${user.id}`;
      }

      return NextResponse.json({ 
        user: { ...user, device_id: user.device_id || deviceId },
        message: 'Хуш омадед! Шумо вориди аккаунт шудед.' 
      }, { status: 200 });
    }

    // 3. Если пользователя нет - создаем нового
    const safeAge = parseInt(String(age)) || 0;
    const safeSurname = String(surname || '');
    const safeStatus = String(maritalStatus || '');
    const safeGender = String(gender || '');

    const result = await sql`
      INSERT INTO ravoni_users (name, surname, age, marital_status, gender, promo_code, device_id)
      VALUES (${name}, ${safeSurname}, ${safeAge}, ${safeStatus}, ${safeGender}, ${promoCode}, ${deviceId})
      RETURNING *;
    `;

    return NextResponse.json({ 
      user: result.rows[0],
      message: 'Бақайдгирӣ бо муваффақият анҷом ёфт!' 
    }, { status: 201 });

  } catch (error: any) {
    console.error('CRITICAL Registration/Login Error:', error);
    return NextResponse.json({ error: 'Хатогӣ дар система', details: error.message }, { status: 500 });
  }
}
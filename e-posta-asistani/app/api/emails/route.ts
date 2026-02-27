import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchLatestEmails } from '@/lib/mail-service';

/**
 * GET isteği geldiğinde (örneğin sayfa yüklendiğinde) çalışan fonksiyon.
 */
export async function GET() {
  // 1. Tarayıcı çerezlerine (Cookies) erişim sağla.
  const cookieStore = await cookies();
  
  // 2. Daha önce 'callback' aşamasında kaydettiğimiz token'ları oku.
  const accessToken = cookieStore.get('google_access_token')?.value;
  const refreshToken = cookieStore.get('google_refresh_token')?.value;

  // Güvenlik Duvarı: Eğer token'lar yoksa, isteği reddet (401 Unauthorized).
  if (!accessToken || !refreshToken) {
    return NextResponse.json(
      { error: 'Oturum bulunamadı, lütfen tekrar giriş yapın.' }, 
      { status: 401 }
    );
  }

  try {
    // 3. 'lib/mail-service' içindeki fonksiyonu çağırarak verileri getir.
    // Fonksiyonun içine çerezlerden aldığımız token'ları parametre olarak veriyoruz.
    const emails = await fetchLatestEmails(accessToken, refreshToken);

    // 4. Verileri JSON formatında frontend'e (Dashboard) gönder.
    return NextResponse.json(emails);

  } catch (error) {
    // Beklenmedik bir hata (API kotası dolması, internet kopması vb.) durumunda log tut ve hata dön.
    console.error('Gmail Veri Çekme Hatası:', error);
    return NextResponse.json(
      { error: 'E-postalar alınırken teknik bir sorun oluştu.' }, 
      { status: 500 }
    );
  }
}
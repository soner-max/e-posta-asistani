import { NextRequest, NextResponse } from 'next/server';
import { oauth2Client, SCOPES } from '@/app/config/google-auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  // 1. Google'dan gelen kodun kontrolü
  if (!code) {
    return NextResponse.json({ error: 'Yetkilendirme kodu bulunamadı.' }, { status: 400 });
  }

  try {
    // 2. Kodu tokenlar ile takas et
    const { tokens } = await oauth2Client.getToken(code);
    
    // Çerez deposunu hazırla
    const cookieStore = await cookies();

    // 3. Access Token'ı kaydet (Genelde 1 saat ömrü vardır)
    if (tokens.access_token) {
      cookieStore.set('google_access_token', tokens.access_token, {
        httpOnly: true, // JS ile erişilemez, güvenli
        secure: process.env.NODE_ENV === 'production', // Sadece HTTPS'de çalışır (Localhost hariç)
        path: '/', // Tüm sitede geçerli
        maxAge: 60 * 60, // 1 saat (saniye cinsinden)
        sameSite: 'lax', // CSRF koruması için
      });
    }

    // 4. Refresh Token'ı kaydet (Kritik veri!)
    if (tokens.refresh_token) {
        try{
            cookieStore.set('google_refresh_token', tokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 gün boyunca geçerli
            sameSite: 'lax',
         });
            
        }
        catch(err){
            console.error('Refresh Token Kaydetme Hatası:', err);
        }
        
    }

    // 5. İşlem başarılı, kullanıcıyı dashboard'a yönlendir
    return NextResponse.redirect(new URL('/', request.url));

  } catch (error) {
    console.error('Token Hatası:', error);
    return NextResponse.json({ error: 'Kimlik doğrulama başarısız.' }, { status: 500 });
  }
}
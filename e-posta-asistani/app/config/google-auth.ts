import { google } from 'googleapis';
import { NextResponse } from 'next/server';
//import { oauth2Client, SCOPES } from '@/config/google-config';

/**
 * Google OAuth2 istemcisini yapılandırıyoruz.
 * Değerleri .env.local dosyasından çekiyoruz.
 */
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // Bu değer image_5f5356'daki URI ile aynı olmalı!
);

// Kullanılacak yetki alanları (Scope)
export const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email', // Kullanıcı kimliği için eklemeni öneririm
];

export async function GET() {
  const url = oauth2Client.generateAuthUrl({ //notlarda yazığım gibi bir url oluşturuluyor. içinde redirect uri, client id vs var. 
    access_type: 'offline', // Refresh token almak için şart!
    prompt: 'consent',      // Her seferinde refresh token almak için zorunlu kılabiliriz
    scope: SCOPES,
  });

  return NextResponse.redirect(url);
}


//- authClient2 nesnesi ile bir Authorization URL oluşturulur. bunun içinde `client_id` (kimliğin), `redirect_uri` (Google'ın dönüş adresi), `scope` (hangi verilere erişmek istediğin; örn: `gmail.readonly`) ve `response_type=code` bulunur.
import { NextResponse } from 'next/server';
import { oauth2Client } from '@/app/config/google-auth';

export async function GET() {
  // Google'dan hangi izinleri istediğimizi belirtiyoruz
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Refresh token alabilmek için şart
    scope: scopes,
    prompt: 'consent', // Her seferinde izin ekranını göster (test için iyi olur)
  });

  // Kullanıcıyı Google'ın sayfasına yönlendiriyoruz
  return NextResponse.redirect(url);
}
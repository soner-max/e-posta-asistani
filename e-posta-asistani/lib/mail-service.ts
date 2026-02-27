import { google, gmail_v1 } from 'googleapis';
import { oauth2Client } from '@/app/config/google-auth';
import { CleanEmail } from '@/types/email';

/**
 * Gmail'den gelen karmaşık mesaj objesini temiz bir yapıya dönüştürür.
 */
function parseEmail(message: gmail_v1.Schema$Message): CleanEmail {
  const headers = message.payload?.headers || [];
  
  // Başlıklar arasından ihtiyacımız olanları buluyoruz
  const getHeader = (name: string) => headers.find(h => h.name === name)?.value || '';

  // Gövde metnini (body) bulma ve Base64 formatından düz metne çevirme
  // Gmail API gövdeyi parçalar (parts) halinde veya doğrudan body içinde sunabilir.
  let rawBody = '';
  if (message.payload?.parts) {
    // Genellikle ilk parça text/plain içeriğidir
    const textPart = message.payload.parts.find(p => p.mimeType === 'text/plain');
    rawBody = textPart?.body?.data || '';
  } else {
    rawBody = message.payload?.body?.data || '';
  }

  // Base64URL formatını standart metne çeviriyoruz
  const decodedBody = rawBody 
    ? Buffer.from(rawBody, 'base64').toString('utf-8') 
    : 'İçerik bulunamadı';

  return {
    id: message.id || '',
    from: getHeader('From'),
    subject: getHeader('Subject'),
    date: getHeader('Date'),
    text: decodedBody,
  };
}

/**
 * Temizlenmiş e-posta listesini döner.
 */
export const fetchLatestEmails = async (accessToken: string, refreshToken: string, limit: number = 10): Promise<CleanEmail[]> => {
  oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // 1. Mesaj listesini al
  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults: limit,
  });

  const messages = response.data.messages || [];

  // 2. Her mesajın detayını çek ve parse et
  const cleanEmails = await Promise.all(
    messages.map(async (msg) => {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
      });
      // Ham veriyi temiz fonksiyona gönderiyoruz
      return parseEmail(details.data);
    })
  );

  return cleanEmails;
};
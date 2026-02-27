/**
 * Uygulama genelinde kullanılacak temizlenmiş e-posta veri yapısı.
 * Gmail API'den gelen karmaşık JSON yerine bu sade yapıyı kullanacağız.
 */
export interface CleanEmail {
  id: string;      // E-postanın benzersiz kimliği
  from: string;    // Gönderen kişi (Örn: "John Doe <john@example.com>")
  subject: string; // E-posta konusu
  date: string;    // Gönderilme tarihi
  text: string;    // E-postanın düz metin içeriği (AI analizi için burası kullanılacak)
}
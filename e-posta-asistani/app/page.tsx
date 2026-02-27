"use client";

import React, { useEffect, useState } from "react";
// Shadcn bileşenlerini kök dizindeki yerinden çağırıyoruz
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CleanEmail } from "@/types/email"; // Tanımladığımız tip

export default function HomePage() {
  // Başlangıçta boş bir dizi vererek .map hatasını önceden engelliyoruz
  const [emails, setEmails] = useState<CleanEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getEmails() {
      try {
        setLoading(true);
        const response = await fetch("/api/emails"); // API rotana istek atar
        const data = await response.json();

        // KRİTİK KONTROL: Veri dizi mi yoksa hata objesi mi?
        if (Array.isArray(data)) {
          setEmails(data);
        } else if (data.error) {
          // Eğer backend hata döndüyse (örn: login olunmamışsa)
          setError(data.error);
        } else {
          setError("Beklenmedik bir veri formatı alındı.");
        }
      } catch (err) {
        console.error("Bağlantı Hatası:", err);
        setError("Sunucuya bağlanılamadı. Lütfen Google girişini kontrol edin.");
      } finally {
        setLoading(false);
      }
    }

    getEmails();
  }, []);

  // 1. Yükleme Ekranı
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg animate-pulse">E-postalarınız hazırlanıyor...</p>
      </div>
    );
  }

  // 2. Hata Ekranı (Oturum kapalıysa burası görünür)
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Hata Oluştu</h2>
        <p className="mb-4 text-gray-600">{error}</p>
        <a 
          href="/api/auth/google" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Google ile Tekrar Giriş Yap
        </a>
      </div>
    );
  }

  // 3. Başarılı Liste Ekranı
  return (
    <main className="p-4 md:p-10 max-w-5xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">E-posta Asistanı</h1>
        <p className="text-muted-foreground mt-2">Gmail kutunuzdaki son 10 mesaj</p>
      </header>

      <ScrollArea className="h-[750px] w-full rounded-xl border bg-card p-6 shadow-lg">
        <div className="flex flex-col gap-6">
          {emails.length === 0 ? (
            <p className="text-center py-10 text-gray-500">Görüntülenecek e-posta bulunamadı.</p>
          ) : (
            emails.map((email) => (
              <Card key={email.id} className="group hover:border-primary transition-all duration-300">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="grid gap-1">
                    <CardTitle className="text-xl font-bold line-clamp-1">
                      {email.subject || "(Konu Yok)"}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-blue-500">
                      {email.from}
                    </CardDescription>
                  </div>
                  {/* Tarih sağ tarafta */}
                  <div className="text-xs text-muted-foreground font-mono">
                    {new Date(email.date).toLocaleDateString('tr-TR')}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 italic">
                    {email.text}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </main>
  );
}


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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CleanEmail } from "@/types/email"; // Tanımladığımız tip
import { Button } from "@/components/ui/button";
import { analyzeEmail } from "@/lib/gemini";
import { Send, Bot, User, Sparkles } from "lucide-react";

export default function HomePage() {
  // Başlangıçta boş bir dizi vererek .map hatasını önceden engelliyoruz
  const [emails, setEmails] = useState<CleanEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

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

  const runAnalysis = async (email: CleanEmail) => {
    setAnalyzingId(email.id);
    
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      setResults(prev => ({ ...prev, [email.id]: data.analysis }));
    } catch (err) {
      console.error("Hata:", err);
    } finally {
      setAnalyzingId(null);
    }
  };

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* ANA İÇERİK ALANI */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-5xl mx-auto">
            <header className="mb-10 flex items-center justify-between">
              <div className="flex-1 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight">E-posta Asistanı</h1>
                <p className="text-muted-foreground mt-2">Gmail kutunuzdaki son 10 mesaj</p>
              </div>
              <SidebarTrigger className="ml-4" />
            </header>

            <ScrollArea className="h-[calc(100vh-250px)] w-full rounded-xl border bg-card p-6 shadow-lg">
              <div className="flex flex-col gap-6">
                {emails.length === 0 ? (
                  <p className="text-center py-10 text-gray-500">Görüntülenecek e-posta bulunamadı.</p>
                ) : (
                  emails.map((email) => (
                    <Card key={email.id} className="group hover:border-primary transition-all duration-300">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="grid gap-1 flex-1">
                          <CardTitle className="text-xl font-bold line-clamp-1">
                            {email.subject || "(Konu Yok)"}
                          </CardTitle>
                          <CardDescription className="text-sm font-medium text-blue-500">
                            {email.from}
                          </CardDescription>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <div className="text-xs text-muted-foreground font-mono">
                            {new Date(email.date).toLocaleDateString('tr-TR')}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => runAnalysis(email)}
                            disabled={analyzingId === email.id}
                            className="whitespace-nowrap"
                          >
                            {analyzingId === email.id ? "Analiz Ediliyor..." : "🪄 AI Analizi"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 italic">
                          {email.text}
                        </p>
                        {results[email.id] && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                            <div className="flex items-center gap-2 mb-1 font-bold">
                              <Sparkles className="w-4 h-4" /> AI Özeti:
                            </div>
                            {results[email.id]}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </main>

        {/* SAĞ SIDEBAR (CHATBOT) */}
        <Sidebar side="right" variant="sidebar" className="border-l shadow-xl">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Bot className="w-5 h-5 text-primary" />
              AI Asistan
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted p-3 rounded-2xl rounded-tl-none text-sm">
                    Merhaba! Size e-postalarınız hakkında nasıl yardımcı olabilirim?
                  </div>
                </div>
                {/* Chat mesajları buraya gelecek */}
              </div>
            </ScrollArea>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t">
            <div className="flex gap-2">
              <Input placeholder="Bir şeyler sorun..." className="flex-1" />
              <Button size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>
    </SidebarProvider>
  );
}

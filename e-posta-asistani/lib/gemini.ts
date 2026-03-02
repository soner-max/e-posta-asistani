import { GoogleGenerativeAI } from "@google/generative-ai";
import { CleanEmail } from "@/types/email"; // Tanımladığımız tip

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeEmail(email: CleanEmail): Promise<string> {
  // En hızlı ve verimli model olan flash modelini seçiyoruz
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Sen profesyonel bir e-posta asistanisin. Aşağidaki maili analiz et:
    
    FROM: ${email.from}
    KONU: ${email.subject}
    İÇERİK: ${email.text}
    TARİH: ${email.date}


    Lütfen bana şu formatta cevap ver:
    - ÖZET: (Maksimum 3 cümle)
    - ÖNEM: (Düşük/Orta/Yüksek)
    - AKSİYON: (Eğer bir şey yapılması gerekiyorsa belirt, yoksa 'Gerekmiyor' de)
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Hatası:", error);
    return "Maalesef şu an bu maili analiz edemiyorum.";
  }
}
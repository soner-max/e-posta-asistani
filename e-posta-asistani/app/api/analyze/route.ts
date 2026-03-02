import { NextResponse } from "next/server";
import { analyzeEmail } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    // Body içinden doğrudan email objesini alıyoruz
    const { email } = await req.json(); 
    
    // Servise objeyi olduğu gibi paslıyoruz
    const analysis = await analyzeEmail(email); 
    
    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json({ error: "Analiz başarısız" }, { status: 500 });
  }
}
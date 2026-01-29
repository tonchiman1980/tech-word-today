import * as GoogleAI from "@google/generative-ai";

export default async (req: Request) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "APIキーが設定されていません。" }), { status: 500, headers });
    }

    const genAI = new GoogleAI.GoogleGenerativeAI(apiKey);
    
    // モデル名を 'gemini-1.5-flash-latest' に変更（より確実に動く名前です）
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest" 
    });

    const prompt = "IT・テック用語を1つ選び、その『用語名』と『30文字程度の解説』を日本語のJSON形式で返してください。例: {\"term\": \"API\", \"description\": \"機能を共有する仕組み。\"}";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(text, { status: 200, headers });

  } catch (error: any) {
    console.error("Error details:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestion: "Google AI StudioでAPIキーが有効か確認してください。"
    }), { status: 500, headers });
  }
};

import * as GoogleAI from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `あなたはテック投資の専門家です。今日知っておくべき用語を1つ選び、JSON形式 {"word": "用語名", "meaning": "意味", "invest_tip": "投資への活かし方"} で返してください。`;

export default async (req: Request) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers });

  try {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) throw new Error("APIキーが設定されていません");

    // ライブラリの読み込み方を最も安全な方法に変更
    const genAI = new GoogleAI.GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // より安定しているモデル名に変更
      systemInstruction: SYSTEM_INSTRUCTION 
    });

    const result = await model.generateContent("テック用語を1つ出力してください。");
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonData = jsonMatch ? jsonMatch[0] : text;

    return new Response(jsonData, { headers });
  } catch (error: any) {
    // エラーの内容を画面に表示するようにしました
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};

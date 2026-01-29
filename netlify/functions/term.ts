import * as GoogleAI from "@google/generative-ai";

export default async (req: Request) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers });

  console.log("--- Functions 実行開始 ---"); // これがログに出るはず

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("エラー: APIキーがNetlifyに設定されていません");
      return new Response(JSON.stringify({ error: "API_KEY_MISSING" }), { status: 500, headers });
    }

    const genAI = new GoogleAI.GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent("テック用語を1つJSON形式で返して。");
    const text = result.response.text();
    
    console.log("Geminiからの回答:", text); // これがログに出るはず

    return new Response(text, { headers });
  } catch (error: any) {
    // ここでエラーの内容をログ（黒い画面）に書き出します
    console.error("実行中にエラーが発生しました:", error.message);
    console.error("エラーの詳細:", error);
    
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};

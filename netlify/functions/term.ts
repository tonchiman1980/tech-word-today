export default async (req: Request) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers });

  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "APIキーが設定されていません。" }), { status: 500, headers });
    }

    // ★ 修正ポイント: URLを「v1beta」から「v1」に変更
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const body = {
      contents: [{
        parts: [{ text: "IT用語を1つ選び、その『用語名』と『30文字程度の解説』を日本語のJSON形式で返してください。例: {\"term\": \"API\", \"description\": \"機能を共有する仕組み。\"}" }]
      }]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      // エラーが発生した場合は、Googleからのメッセージをそのまま返す
      const errorMessage = data.error?.message || "Google APIエラー";
      return new Response(JSON.stringify({ error: errorMessage }), { status: response.status, headers });
    }

    // 成功時：AIの回答（テキスト）を取り出す
    const aiText = data.candidates[0].content.parts[0].text;
    
    // AIが ```json ... ``` のような装飾をつけてきた場合、それを取り除く
    const cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();

    return new Response(cleanJson, { status: 200, headers });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};

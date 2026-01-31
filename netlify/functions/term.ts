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

    // 1. まず、今のAPIキーで「本当に使えるモデル名」をGoogleに問い合わせます
    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();

    if (!listResponse.ok) {
       return new Response(JSON.stringify({ error: "APIキーが無効、または権限がありません。" }), { status: 401, headers });
    }

    // 2. リストの中から「gemini-1.5-flash」を探し、なければ一番上のモデルを使います
    // これにより「not found」エラーを物理的に回避します
    const models = listData.models || [];
    const targetModel = models.find((m: any) => m.name.includes("gemini-1.5-flash"))?.name 
                        || models[0]?.name;

    if (!targetModel) {
      return new Response(JSON.stringify({ error: "利用可能なAIモデルが見つかりませんでした。" }), { status: 500, headers });
    }

    // 3. 確定したモデル名でAIに質問を投げます
    const url = `https://generativelanguage.googleapis.com/v1/${targetModel}:generateContent?key=${apiKey}`;
    
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
      return new Response(JSON.stringify({ error: data.error?.message || "AI応答エラー" }), { status: response.status, headers });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    const cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();

    return new Response(cleanJson, { status: 200, headers });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};

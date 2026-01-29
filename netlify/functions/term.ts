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

    // ★ 修正ポイント: v1beta ではなく v1（安定版）を使用します
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const body = {
      contents: [{
        parts: [{ text: "IT・テック用語を1つ選び、その『用語名』と『30文字程度の解説』を日本語のJSON形式で返してください。例: {\"term\": \"API\", \"description\": \"機能を共有する仕組み。\"}" }]
      }]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google API Error (v1):", data);
      return new Response(JSON.stringify({ error: "Google APIエラー", details: data }), { status: response.status, headers });
    }

    // AIの回答を取り出す
    const aiText = data.candidates[0].content.parts[0].text;
    return new Response(aiText, { status: 200, headers });

  } catch (error: any) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};

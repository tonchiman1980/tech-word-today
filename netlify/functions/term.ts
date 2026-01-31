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
      return new Response(JSON.stringify({ error: "APIキーがNetlifyに設定されていません。" }), { status: 500, headers });
    }

    // チェッカーで成功したのと同じ「v1」のURLを使用
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const body = {
      contents: [{
        parts: [{ text: "IT・テック用語を1つ選び、その『用語名』と『30文字程度の解説』を日本語のJSON形式で返してください。返答は純粋なJSONのみにしてください。" }]
      }]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google Error:", data);
      return new Response(JSON.stringify({ error: "Google APIエラー", details: data }), { status: response.status, headers });
    }

    // AIの回答を取り出す
    const aiText = data.candidates[0].content.parts[0].text;

    // もしAIが余計な記号（```jsonなど）をつけてきた場合のお掃除
    const cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();

    return new Response(cleanJson, { status: 200, headers });

  } catch (error: any) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};

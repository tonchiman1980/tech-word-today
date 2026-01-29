import { GoogleGenAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `あなたは最先端テクノロジーと株式投資の専門家です。今日知っておくべき重要なテック用語を1つ厳選して、JSON形式で返してください。`;

export default async (req: Request) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers });
  try {
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_INSTRUCTION 
    });
    const result = await model.generateContent("新しいテック用語を1つ厳選して出力してください。");
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonData = jsonMatch ? jsonMatch[0] : text;
    return new Response(jsonData, { headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};

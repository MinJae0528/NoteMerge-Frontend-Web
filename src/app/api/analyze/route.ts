// src/app/api/analyze/route.ts
import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const text = (form.get("text") as string | null)?.trim() || ""; // (옵션) 원문 본문 직접 입력
    const instruction =
      (form.get("instruction") as string | null)?.trim() || ""; // (옵션) 분석 지침
    const tauRaw = (form.get("tau") as string | null) ?? "";
    const TAU = clamp(Number(tauRaw), 0, 1) || 0.6;
    const MIN_CHARS = 10;

    if (!file && !text)
      return json({ error: "file 또는 text 중 하나는 필요합니다." }, 400);

    // 1) 텍스트 추출 (지시문은 추출 단계에 섞지 않음)
    let extracted = text;
    if (file) {
      if (!ALLOWED.has(file.type)) {
        return json(
          { error: `허용되지 않은 파일 형식: ${file.type || "(알 수 없음)"}` },
          415
        );
      }
      const arrayBuf = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuf).toString("base64");

      const extract = await ai.models.generateContent({
        model: process.env.MODEL_ID || "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "다음 파일에서 텍스트를 최대한 정확히 추출해줘. 표/각주/머리말도 가능하면 포함.",
              },
              { inlineData: { mimeType: file.type, data: base64 } },
            ],
          },
        ],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
      });

      const rawExtract = await getText(extract);
      const extractedText = rawExtract.trim();
      if (!extractedText) return json({ error: "텍스트 추출 실패" }, 422);
      extracted = extractedText;
    }

    // 2) 문장 분할 → 모델은 문장 id별 점수만 반환 (지시문은 이 단계 프롬프트에 반영)
    const sents = splitIntoSentences(extracted);
    const numbered = sents.map((s) => `${s.id}. ${s.text}`).join("\n");

    const header = [
      "아래는 번호가 매겨진 문장 목록입니다.",
      instruction ? `분석 지침: ${instruction}` : null,
      "핵심을 요약하고, 각 문장의 중요도를 0~1로 점수화하세요.",
      "반환은 JSON으로만 하며, 스키마를 반드시 지키세요.",
      `{
        "summary": string,
        "scores": [ { "id": number, "score": number } ]
      }`,
      "설명/코드펜스 금지, 오직 JSON.",
    ]
      .filter(Boolean)
      .join("\n");

    const r = await ai.models.generateContent({
      model: process.env.MODEL_ID || "gemini-2.5-pro",
      contents: [
        {
          role: "user",
          parts: [{ text: header + "\n\n문장 목록:\n" + numbered }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            scores: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  score: { type: "number" },
                },
                required: ["id", "score"],
              },
            },
          },
          required: ["summary", "scores"],
        },
      },
    });

    const raw = await getText(r);
    let parsed: { summary: string; scores: { id: number; score: number }[] };
    try {
      parsed = JSON.parse(sanitizeToJson(raw));
    } catch {
      return json({ error: "JSON 파싱 실패", raw }, 502);
    }

    // 3) 임계치 이상 문장만 문장 경계 전체 하이라이트
    const keep = new Set(
      (parsed.scores || [])
        .filter(
          (x) =>
            typeof x.id === "number" &&
            typeof x.score === "number" &&
            x.score >= TAU
        )
        .map((x) => x.id)
    );

    const spans = sents
      .filter((s) => keep.has(s.id) && s.end - s.start >= MIN_CHARS)
      .map((s) => ({ start: s.start, end: s.end, score: 1 }));

    const highlightedHtml = highlightByOffsets(extracted, spans);

    return json({
      summary: parsed.summary,
      highlightedHtml,
      sentences: sents,
      scores: parsed.scores,
      tau: TAU,
    });
  } catch (e: any) {
    return json({ error: e?.message || "서버 오류" }, e?.status || 500);
  }
}

// ===== Utilities =====
function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function getText(res: any): Promise<string> {
  try {
    if (res?.response?.text) return await res.response.text();
    if (typeof res?.text === "function") return await res.text();
    if (typeof res?.text === "string") return res.text;
  } catch {}
  return "";
}

function sanitizeToJson(s: string) {
  let t = (s || "").trim();
  t = t
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) t = t.slice(first, last + 1);
  return t;
}

function splitIntoSentences(text: string) {
  const out: { id: number; text: string; start: number; end: number }[] = [];
  const regex = /([^.!?…~\n]+[.!?…~]*\n?)/g;
  let m: RegExpExecArray | null;
  let pos = 0,
    id = 0;
  while ((m = regex.exec(text)) !== null) {
    const raw = m[0];
    const start = text.indexOf(raw, pos);
    const end = start + raw.length;
    out.push({ id: id++, text: raw, start, end });
    pos = end;
  }
  if (out.length === 0 && text.trim())
    out.push({ id: 0, text, start: 0, end: text.length });
  return out;
}

function highlightByOffsets(
  source: string,
  spans: { start: number; end: number; score: number }[]
) {
  const sorted = spans
    .filter(
      (s) =>
        Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start
    )
    .sort((a, b) => a.start - b.start);

  let html = "";
  let cursor = 0;

  for (const s of sorted) {
    const safeStart = clamp(s.start, 0, source.length);
    const safeEnd = clamp(s.end, 0, source.length);

    if (cursor < safeStart) html += escapeHtml(source.slice(cursor, safeStart));
    const frag = source.slice(safeStart, safeEnd);
    const bg = `rgba(255, 235, 59, 1)`; // 문장 전체 강조
    html += `<span data-score="${s.score.toFixed(
      2
    )}" style="background:${bg}">${escapeHtml(frag)}</span>`;
    cursor = safeEnd;
  }

  if (cursor < source.length) html += escapeHtml(source.slice(cursor));
  return html.replace(/\n/g, "<br/>");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

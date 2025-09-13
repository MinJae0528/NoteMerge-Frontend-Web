"use client";

import { useMemo, useState } from "react";

export default function Home() {
  // 탭 상태: "summarize" | "highlight"
  const [tab, setTab] = useState<"summarize" | "highlight">("summarize");

  // ===== 요약 탭 상태 =====
  const [input, setInput] = useState("");
  const [style, setStyle] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const summarize = async () => {
    if (!input.trim()) return;
    try {
      setLoading(true);
      setSummary("");
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, style }),
      });
      const data = await res.json();
      setSummary(data.summary || data.error || "");
    } catch (e: any) {
      setSummary(`에러: ${e?.message ?? "요약 실패"}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== 파일/이미지 하이라이트 탭 상태 =====
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState(""); // 파일과 함께 보낼 추가 메모/텍스트(옵션)
  const [anaSummary, setAnaSummary] = useState("");
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const [anaLoading, setAnaLoading] = useState(false);
  const [anaError, setAnaError] = useState("");

  // 임계치 슬라이더 (0~1)
  const [tau, setTau] = useState(0.6);

  const fileLabel = useMemo(() => {
    if (!file) return "파일을 선택하세요 (PDF, DOCX, TXT, PNG, JPG)";
    const kb = Math.round(file.size / 1024);
    return `${file.name} • ${kb.toLocaleString()} KB`;
  }, [file]);

  const allowed = new Set([
    "image/png",
    "image/jpeg",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ]);

  const analyze = async () => {
    setAnaError("");
    setAnaSummary("");
    setHighlightedHtml("");

    if (!file && !note.trim()) {
      setAnaError("파일 또는 텍스트 중 하나는 필요합니다.");
      return;
    }
    if (file && !allowed.has(file.type)) {
      setAnaError(`허용되지 않은 파일 형식: ${file.type || "(알 수 없음)"}`);
      return;
    }

    try {
      setAnaLoading(true);
      const fd = new FormData();
      if (file) fd.append("file", file);
      if (note.trim()) fd.append("instruction", note.trim()); // ← 변경 포인트
      fd.append("tau", String(tau));
      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setAnaError(data?.error || "분석 중 오류가 발생했습니다.");
        return;
      }
      setAnaSummary(data.summary || "");
      setHighlightedHtml(data.highlightedHtml || "");
    } catch (e: any) {
      setAnaError(e?.message || "요청 실패");
    } finally {
      setAnaLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        요약 자판기 feat. Gemini (Alpha Version)
      </h1>

      {/* 탭 헤더 */}
      <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-1 mb-6">
        <button
          onClick={() => setTab("summarize")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm md:text-base transition ${
            tab === "summarize"
              ? "bg-white text-black shadow font-semibold"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          텍스트 요약
        </button>
        <button
          onClick={() => setTab("highlight")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm md:text-base transition ${
            tab === "highlight"
              ? "bg-white text-black shadow font-semibold"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          파일/이미지 요약+하이라이트
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {tab === "summarize" ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">★ 요약하기</h2>

          <div>
            <label className="block text-sm mb-1">1. 요약 스타일(옵션)</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="예: 2~3줄로 요약 / 한문장 요약 / 옆집 잼민이도 따라할 수 있게 / 우리집 강아지도 알아들을 수 있게  등등"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">­2. 원문</label>
            <textarea
              className="w-full h-48 border rounded px-3 py-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="여기에 긴 글을 붙여넣고 아래 버튼을 눌러보세요."
            />
          </div>

          <button
            onClick={summarize}
            className="rounded bg-black border-1 text-white px-4 py-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "요약 중…" : "요약하기"}
          </button>

          {summary && (
            <section className="mt-4">
              <h3 className="text-lg font-semibold mb-2">요약 결과</h3>
              <pre className="whitespace-pre-wrap border text-black rounded p-3 bg-gray-50">
                {summary}
              </pre>
            </section>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            ★ 파일/이미지에서 텍스트 추출 → 요약 & 중요 문장 하이라이트
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">1. 파일 업로드</label>
                <label className="flex items-center justify-between gap-3 border rounded px-3 py-2 cursor-pointer hover:bg-gray-50">
                  <span className="truncate text-sm">{fileLabel}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <span className="text-xs text-gray-500">찾기</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  허용: PDF, DOCX, TXT, PNG, JPG
                </p>
              </div>

              <div>
                <label className="block text-sm mb-1">
                  2. 분석 가이드라인(옵션)
                </label>
                <textarea
                  className="w-full h-28 border rounded px-3 py-2"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="예: '마케팅 전략 관련 핵심만 강조', 'A지역 수치 위주로 요약' 등"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  3. 하이라이트 정도 설정 (tau: {tau.toFixed(2)})
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={tau}
                  onChange={(e) => setTau(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  값이 높을수록 덜 칠해지고, 낮을수록 많이 칠해집니다. (추천 :
                  0.8 )
                </p>
              </div>

              <button
                onClick={analyze}
                className="rounded bg-black border-1 text-white px-4 py-2 disabled:opacity-50"
                disabled={anaLoading}
              >
                {anaLoading ? "분석 중…" : "분석하기"}
              </button>

              {anaError && <p className="text-red-600 text-sm">{anaError}</p>}

              {anaSummary && (
                <section className="mt-2">
                  <h3 className="text-lg font-semibold mb-2">요약</h3>
                  <pre className="whitespace-pre-wrap border text-black rounded p-3 bg-gray-50">
                    {anaSummary}
                  </pre>
                </section>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm">하이라이트 결과</label>
              <div
                className="border rounded p-3 min-h-[12rem] bg-white text-black prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    highlightedHtml ||
                    '<span class="text-gray-400">하이라이트 결과가 여기 표시됩니다.</span>',
                }}
              />
              <p className="text-xs text-gray-500">
                * 서버에서 생성된 신뢰 가능한 HTML만 렌더링합니다.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

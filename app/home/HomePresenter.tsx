'use client'
import { useEffect, useState, useMemo } from "react";

export default function HomePresenter() {
  // 파일 목록, 선택 파일, 페이지
  const [files, setFiles] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 키워드 관리
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  // 요약
  const [summary, setSummary] = useState("");

  // 파일 목록 불러오기
  useEffect(() => {
    fetch("http://localhost:3000/api/notes", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        // files 배열 안전하게 추출
        const filesArr = Array.isArray(data?.data?.notes)
          ? data.data.notes
          : [];
        setFiles(filesArr);
        if (filesArr.length > 0) setSelected(filesArr[0]);
      });
  }, []);

  // 항상 일정한 타입의 noteId 추출
  const selectedNoteId = useMemo(() => {
    if (!selected) return null;
    if (typeof selected === "object") return selected.note_id || selected.id || null;
    return selected;
  }, [selected]);

  // 선택 파일 상세/요약/키워드 불러오기
  useEffect(() => {
    if (!selectedNoteId) return;
    fetch(`http://localhost:3000/api/notes/${selectedNoteId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        setSummary(data?.data?.note?.summary || "");
        // keywords는 문자열일 수 있으니 배열로 변환
        const kw = data?.data?.note?.keywords;
        setKeywords(Array.isArray(kw) ? kw : typeof kw === "string" ? kw.split(",") : []);
        setTotalPages(data?.data?.note?.totalPages || 1);
      });
  }, [selectedNoteId]);

  // 키워드 추가
  const handleAddKeyword = async () => {
    if (!newKeyword.trim() || keywords.includes(newKeyword.trim()) || !selectedNoteId) return;
    await fetch(`http://localhost:3000/api/keywords`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ name: newKeyword, note_id: selectedNoteId })
    });
    setKeywords([...keywords, newKeyword.trim()]);
    setNewKeyword("");
  };

  // 키워드 삭제
  const handleRemoveKeyword = async (idx: number) => {
    const keyword = keywords[idx];
    await fetch(`http://localhost:3000/api/keywords/${keyword}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setKeywords(keywords.filter((_, i) => i !== idx));
  };

  // PDF 페이지 이동
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // 파일 미리보기
  let filePreview = null;
  if (selected?.type === "image") {
    filePreview = (
      <img src={selected.src || selected.url} alt={selected.name} className="max-w-full max-h-[500px] mx-auto" />
    );
  } else if (selected?.type === "pdf") {
    filePreview = (
      <div className="flex items-center justify-center bg-gray-100 rounded h-[500px]">
        <span className="text-lg text-gray-600">
          PDF {page}페이지 미리보기
        </span>
      </div>
    );
  } else if (selected) {
    filePreview = (
      <pre className="bg-gray-100 p-6 rounded text-base h-[500px] overflow-auto flex items-center">
        {selected.content || "원본 파일 내용"}
      </pre>
    );
  }

  return (
    <div className="flex max-w-6xl mx-auto px-6 py-8 gap-8">
      {/* 왼쪽: 내 자료 리스트 */}
      <aside className="w-1/4 space-y-4">
        <h2 className="text-lg font-bold mb-2">내 자료</h2>
        <ul className="space-y-2">
          {Array.isArray(files) &&
            files.map((file) => (
              <li key={file.note_id || file.id}>
                <button
                  className={`w-full text-left p-2 rounded ${
                    selected?.note_id === file.note_id || selected?.id === file.id
                      ? "bg-yellow-100 font-bold"
                      : "bg-gray-100"
                  }`}
                  onClick={() => {
                    setSelected(file);
                    setPage(1);
                  }}
                >
                  {file.name || file.title}
                </button>
              </li>
            ))}
        </ul>
      </aside>

      {/* 가운데: 파일 미리보기 + 요약본 */}
      <main className="flex-1 space-y-6">
        {/* 파일 미리보기 */}
        <section className="bg-white p-4 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-bold mb-2">파일 미리보기</h2>
          {filePreview}
          {selected?.type === "pdf" && (
            <div className="flex gap-2 justify-end mt-2">
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-gray-200 text-black disabled:opacity-50"
              >
                이전 페이지
              </button>
              <span className="px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={page === totalPages}
                className="px-3 py-1 rounded bg-gray-200 text-black disabled:opacity-50"
              >
                다음 페이지
              </button>
            </div>
          )}
        </section>

        {/* 요약본 */}
        <section className="bg-white p-4 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-bold mb-2">요약본</h2>
          <pre className="bg-yellow-50 p-3 rounded">{summary}</pre>
        </section>
      </main>

      {/* 오른쪽: 키워드 (삭제/추가 UI) */}
      <aside className="w-1/4 space-y-4">
        <h2 className="text-lg font-bold mb-2">키워드</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {keywords.map((kw, idx) => (
            <span key={kw} className="bg-gray-200 px-3 py-1 rounded flex items-center gap-1">
              {kw}
              <button
                onClick={() => handleRemoveKeyword(idx)}
                className="ml-1 text-xs text-gray-500 hover:text-red-500"
                aria-label="키워드 삭제"
              >
                X
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="px-2 py-1 border rounded w-2/3"
            placeholder="키워드 추가"
          />
          <button
            onClick={handleAddKeyword}
            className="px-3 py-1 rounded bg-yellow-100 text-black font-semibold"
          >
            추가
          </button>
        </div>
      </aside>
    </div>
  );
}

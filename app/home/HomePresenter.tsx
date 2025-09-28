'use client'
import { useState } from "react";

export default function HomePresenter() {
  // 예시 데이터
  const files = [
    { id: 1, name: "알고리즘 개론.pdf", type: "pdf" },
    { id: 2, name: "자료구조 노트.txt", type: "txt" },
    { id: 3, name: "팀프로젝트 회의록.txt", type: "txt" },
    { id: 4, name: "샘플 이미지.png", type: "image", src: "/Images/sample.png" },
  ];
  const [selected, setSelected] = useState(files[0]);
  const [page, setPage] = useState(1);
  const totalPages = 5; // PDF 예시

  // 키워드 관리
  const [keywords, setKeywords] = useState(["React", "상태관리", "PDF"]);
  const [newKeyword, setNewKeyword] = useState("");
  const handleRemoveKeyword = (idx: number) => {
    setKeywords(keywords.filter((_, i) => i !== idx));
  };
  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  // 파일 미리보기 렌더링
  let filePreview;
  if (selected.type === "image") {
    filePreview = (
      <img src={selected.src} alt={selected.name} className="max-w-full max-h-[500px] mx-auto" />
    );
  } else if (selected.type === "pdf") {
    filePreview = (
      <div className="flex items-center justify-center bg-gray-100 rounded h-[500px]">
        <span className="text-lg text-gray-600">PDF 파일의 {page}페이지 내용이 여기에 표시됩니다.</span>
      </div>
    );
  } else {
    filePreview = (
      <pre className="bg-gray-100 p-6 rounded text-base h-[500px] overflow-auto flex items-center">여기에 원본 파일 내용이 들어갑니다...</pre>
    );
  }

  const summary = "여기에 정리된 요약 내용이 들어갑니다...";

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="flex max-w-6xl mx-auto px-6 py-8 gap-8">
      {/* 왼쪽: 내 자료 리스트 */}
      <aside className="w-1/4 space-y-4">
        <h2 className="text-lg font-bold mb-2">내 자료</h2>
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.id}>
              <button
                className={`w-full text-left p-2 rounded ${
                  selected.id === file.id
                    ? "bg-yellow-100 font-bold"
                    : "bg-gray-100"
                }`}
                onClick={() => {
                  setSelected(file);
                  setPage(1);
                }}
              >
                {file.name}
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
          {selected.type === "pdf" && (
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

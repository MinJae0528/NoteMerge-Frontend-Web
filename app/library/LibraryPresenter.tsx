'use client';

import { useEffect, useState } from "react";

export default function LibraryPresenter() {
  const [notes, setNotes] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/notes", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        setNotes(data.data || []);
        if (data.data && data.data.length > 0) setSelected(data.data[0]);
      });
  }, []);

  // 상세 정보 불러오기 (선택된 노트)
  useEffect(() => {
    if (!selected) return;
    fetch(`http://localhost:3000/api/notes/${selected.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setSelected({ ...selected, ...data.data }));
  }, [selected?.id]);

  return (
    <div className="flex max-w-6xl mx-auto px-6 py-8 gap-8">
      {/* 왼쪽: 노트 목록 */}
      <aside className="w-1/4 space-y-4">
        <h2 className="text-lg font-bold mb-2">내 자료</h2>
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id}>
              <button
                className={`w-full text-left p-2 rounded ${
                  selected?.id === note.id ? "bg-yellow-100 font-bold" : "bg-gray-100"
                }`}
                onClick={() => setSelected(note)}
              >
                {note.title || note.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      {/* 가운데: 상세 미리보기 */}
      <main className="flex-1 space-y-6">
        {selected && (
          <section className="bg-white p-4 rounded-xl shadow space-y-4">
            <h2 className="text-lg font-bold mb-2">{selected.title || selected.name}</h2>
            {selected.type === "image" && (
              <img src={selected.src || selected.url} alt={selected.name} className="max-w-full max-h-[500px] mx-auto" />
            )}
            {selected.type === "pdf" && (
              <div className="flex items-center justify-center bg-gray-100 rounded h-[500px]">
                <span className="text-lg text-gray-600">PDF 미리보기</span>
              </div>
            )}
            {selected.type !== "image" && selected.type !== "pdf" && (
              <pre className="bg-gray-100 p-6 rounded text-base h-[500px] overflow-auto flex items-center">
                {selected.content || "원본 파일 내용"}
              </pre>
            )}
            <section className="bg-white p-4 rounded-xl shadow space-y-4 mt-4">
              <h2 className="text-lg font-bold mb-2">요약본</h2>
              <pre className="bg-yellow-50 p-3 rounded">{selected.summary || "요약 정보 없음"}</pre>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}

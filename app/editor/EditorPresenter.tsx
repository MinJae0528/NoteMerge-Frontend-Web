'use client'

// 문서 생성 화면 
import { useState } from "react";

export default function EditorPresenter() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div className="bg-white p-4 rounded-xl shadow space-y-4">
        {/* 제목 입력 */}
        <input
          className="w-full border p-2 rounded"
          placeholder="문서 제목 입력"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 파일 업로드 */}
        <input
          type="file"
          className="w-full border p-2 rounded"
          onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
        />

        {/* 내용 입력 */}
        <textarea
          className="w-full h-40 border p-2 rounded"
          placeholder="내용을 입력하세요..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button className="px-4 py-2 rounded bg-yellow-400 text-black">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

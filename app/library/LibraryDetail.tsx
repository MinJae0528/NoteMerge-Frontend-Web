'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LibraryDetail({ noteId }: { noteId: number }) {
  const [detail, setDetail] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!noteId) return;
    fetch(`http://localhost:3000/api/notes/${noteId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setDetail(data?.data?.note || data?.data));
  }, [noteId]);

  if (!detail) return <div className="p-8 text-center">로딩 중...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <button className="mb-4 text-blue-600" onClick={() => router.back()}>
        ← 목록으로
      </button>
      <section className="bg-white p-4 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-bold mb-2">{detail.title || detail.name}</h2>
        {detail.type === "image" && (
          <img src={detail.src || detail.url} alt={detail.name} className="max-w-full max-h-[500px] mx-auto" />
        )}
        {detail.type === "pdf" && (
          <div className="flex items-center justify-center bg-gray-100 rounded h-[500px]">
            <span className="text-lg text-gray-600">PDF 미리보기</span>
          </div>
        )}
        {detail.type !== "image" && detail.type !== "pdf" && (
          <pre className="bg-gray-100 p-6 rounded text-base h-[500px] overflow-auto flex items-center">
            {detail.content || "원본 파일 내용"}
          </pre>
        )}
      </section>
      <section className="bg-white p-4 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-bold mb-2">요약본</h2>
        <pre className="bg-yellow-50 p-3 rounded">{detail.summary || "요약 정보 없음"}</pre>
      </section>
    </div>
  );
}
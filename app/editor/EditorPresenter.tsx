'use client'

import { useState, useRef } from "react";

export default function EditorPresenter() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // 여러 파일 선택 시 기존 파일과 합침 (중복 제거)
      const newFiles = Array.from(e.target.files);
      setFiles(prev =>
        [...prev, ...newFiles].filter(
          (file, idx, arr) =>
            arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
        )
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    files.forEach(file => formData.append("files", file));

    try {
      const res = await fetch("http://localhost:3000/api/notes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMessage("자료가 성공적으로 생성되었습니다!");
        setTitle("");
        setContent("");
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMessage(data.message || "자료 생성에 실패했습니다.");
      }
    } catch (err) {
      setMessage("네트워크 오류 또는 서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-4"
    >
      <h2 className="text-xl font-bold mb-4">자료 생성</h2>
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="제목"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <textarea
        className="w-full border rounded px-3 py-2"
        placeholder="내용 (선택)"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={6}
      />
      <div>
        <label className="block mb-1 font-semibold">파일 업로드</label>
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-32 cursor-pointer transition
            ${files.length > 0 ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50 hover:border-yellow-400 hover:bg-yellow-50"}`}
        >
          <input
            type="file"
            className="hidden"
            accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.webp"
            multiple
            onChange={handleFilesChange}
            id="file-upload"
            ref={fileInputRef}
          />
          {files.length > 0 ? (
            <div className="w-full flex flex-col items-center">
              {files.map((file, idx) => (
                <div key={file.name + file.size} className="flex items-center gap-2 mt-1">
                  <span className="text-green-700 font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    className="ml-1 px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs hover:bg-red-200"
                    onClick={e => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}
              <span className="text-xs text-gray-400 mt-2">(다시 클릭해 파일 추가 가능)</span>
            </div>
          ) : (
            <>
              <span className="text-gray-500 font-medium">여기를 클릭해 파일을 선택하세요</span>
              <span className="text-xs text-gray-400 mt-1">PDF, 이미지, 텍스트 파일 지원 (여러 개 가능)</span>
            </>
          )}
        </label>
      </div>
      <button
        type="submit"
        className="w-full bg-yellow-500 text-white font-bold py-2 rounded"
        disabled={loading}
      >
        {loading ? "생성 중..." : "자료 생성"}
      </button>
      {message && (
        <div className="mt-2 text-center text-sm text-gray-700">{message}</div>
      )}
    </form>
  );
}

import Link from "next/link";

// 자료 모아보기 화면
export default function LibraryPresenter() {
  const files = [
    { id: 1, name: "알고리즘 개론.pdf" },
    { id: 2, name: "자료구조 노트.txt" },
    { id: 3, name: "팀프로젝트 회의록.txt" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h2 className="text-xl font-bold mb-4">내 자료</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((file) => (
          <Link
            key={file.id}
            href={`/library/${file.id}`}
            className="p-4 bg-white rounded-xl shadow hover:bg-gray-50"
          >
            {file.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

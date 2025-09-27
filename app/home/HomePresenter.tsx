'use client'

export default function HomePresenter() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-12 gap-6">
      {/* 좌측: 라이브러리 */}
      <div className="col-span-4 bg-white p-6 rounded-xl shadow space-y-3">
        <h2 className="text-xl font-semibold">📂 내 자료</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>알고리즘 개론.pdf</li>
          <li>자료구조 노트.txt</li>
          <li>팀프로젝트 회의록.txt</li>
        </ul>
      </div>

      {/* 중앙: 선택된 파일 내용 */}
      <div className="col-span-5 bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold">선택된 파일</h2>
        <div className="mt-3 text-gray-600 h-64 flex items-center justify-center border rounded">
          파일 상세 미리보기 영역
        </div>
      </div>

      {/* 우측: 키워드 */}
      <div className="col-span-3 bg-white p-6 rounded-xl shadow space-y-3">
        <h2 className="text-xl font-semibold">🔑 키워드</h2>
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">#AI</span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">#React</span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">#SpringBoot</span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">#네트워크</span>
        </div>

        {/* 퀴즈 생성 버튼 */}
        <div className="pt-4">
          <button className="px-4 py-2 bg-yellow-400 rounded text-black w-full">
            퀴즈 생성
          </button>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      {/* 상단바 */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow-lg border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl text-[#FFB800]">NoteMerge</span>
          <span className="text-sm text-gray-500">Web</span>
        </div>
        <nav className="flex gap-8">
          <a className="font-medium text-gray-900 border-b-2 border-[#FFB800] pb-1" href="#">Home</a>
          <a className="font-medium text-gray-600 hover:text-gray-900" href="#">Notes</a>
          <a className="font-medium text-gray-600 hover:text-gray-900" href="#">OCR</a>
          <a className="font-medium text-gray-600 hover:text-gray-900" href="#">Workspaces</a>
          <a className="font-medium text-gray-600 hover:text-gray-900" href="#">Network</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="bg-black text-white rounded px-4 py-1.5 font-medium">로그인</button>
        </div>
      </header>

      {/* 홈 */}
      <main className="flex flex-col items-center px-4 py-12 gap-8">
        {/* 소개 카드 */}
        <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-3xl flex flex-col items-start gap-6">
          <h1 className="text-3xl font-bold">NoteMerge</h1>
          <p className="text-gray-700 text-base">
            흩어진 학습 자료(PDF · 이미지 · 텍스트 · 링크)를 자동으로 분류하고, 키워드 기반 워크스페이스로 정리해주는 웹 중심 노트 서비스입니다.
          </p>
          <div className="flex gap-4 mt-2">
            <button className="bg-[#FFB800] text-white font-semibold px-6 py-2 rounded-lg">시작하기</button>
            <button className="bg-white border border-[#FFB800] text-[#FFB800] font-semibold px-6 py-2 rounded-lg">데모 보기</button>
          </div>
        </section>

        {/* 기능 카드 */}
        <section className="flex flex-col sm:flex-row gap-4 w-full max-w-3xl">
          <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-lg mb-2">자동 분류</h2>
            <p className="text-gray-700 text-sm">업로드된 자료에서 키워드를 추출해 자동으로 워크스페이스를 생성합니다.</p>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-lg mb-2">OCR & 요약</h2>
            <p className="text-gray-700 text-sm">이미지/PDF에서 텍스트를 추출하고 자동으로 핵심 요약과 키워드를 제공합니다.</p>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-lg mb-2">백링크 & 네트워크</h2>
            <p className="text-gray-700 text-sm">노트/자료 간의 연결을 시각화하여 관련 콘텐츠를 쉽게 탐색할 수 있습니다.</p>
          </div>
        </section>

        {/* 통계 카드 */}
        <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full max-w-3xl mt-2">
          <span className="font-semibold text-base">
            지금까지 추가된 자료: <span className="text-[#FFB800] font-bold">3</span> · 자동 생성된 워크스페이스: <span className="text-[#FFB800] font-bold">0</span>
          </span>
          <div className="text-gray-500 text-sm mt-1">(데이터는 목업용 더미 데이터입니다)</div>
        </section>
      </main>
    </div>
  );
}

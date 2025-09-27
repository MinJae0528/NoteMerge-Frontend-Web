'use client'

// NoteMerge 사용 가이드 화면
export default function GuidePresenter() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-6">NoteMerge 사용 가이드</h1>
        <div className="space-y-4 text-gray-700">
            <p>NoteMerge는 문서 저장과 자동 요약, 퀴즈 생성, 자료 연결을 통해 학습을 돕는 플랫폼입니다.</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><span className="font-medium">자료 생성</span>: 노트, 이미지, PDF 파일을 업로드하고 제목과 내용을 입력해 저장할 수 있습니다.</li>
                <li><span className="font-medium">퀴즈</span>: 저장한 자료 기반 퀴즈를 생성하고 다시 풀며 학습 효과를 높일 수 있습니다.</li>
                <li><span className="font-medium">자료 모아보기</span>: 저장한 모든 자료를 한눈에 관리하고, 요약과 퀴즈를 확인할 수 있습니다.</li>
            </ul>
        </div>
    </div>
    );
}

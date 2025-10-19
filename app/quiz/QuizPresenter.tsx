'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuizPresenter() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // API 문서에 따른 퀴즈 목록 조회 엔드포인트 사용
    fetch("http://localhost:3000/api/quizzes", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('퀴즈 목록 데이터:', data);
        
        // 응답 구조에 맞춰 데이터 추출
        let quizzesArr = [];
        if (data?.data?.quizzes && Array.isArray(data.data.quizzes)) {
          quizzesArr = data.data.quizzes;
        } else if (data?.data && Array.isArray(data.data)) {
          quizzesArr = data.data;
        } else if (Array.isArray(data?.quizzes)) {
          quizzesArr = data.quizzes;
        } else if (Array.isArray(data)) {
          quizzesArr = data;
        }
        
        console.log('정리된 퀴즈 목록:', quizzesArr);
        setQuizzes(quizzesArr);
      })
      .catch(error => {
        console.error('퀴즈 목록 로딩 오류:', error);
        setQuizzes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleStartQuiz = (quizId: number) => {
    console.log('퀴즈 시작:', quizId);
    // 소문자 /quiz/[quizId] 경로로 수정
    router.push(`/quiz/${quizId}`);
  };

  const handleDeleteQuiz = async (quizId: number, title: string) => {
    if (!confirm(`"${title}" 퀴즈를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // 목록에서 해당 퀴즈 제거
        setQuizzes(prev => prev.filter(quiz => (quiz.quiz_id || quiz.id) !== quizId));
        alert('퀴즈가 삭제되었습니다.');
      } else {
        alert(`퀴즈 삭제 실패: ${result.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('퀴즈 삭제 오류:', error);
      alert('퀴즈 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-[#374151] mb-2">퀴즈 목록을 불러오는 중...</div>
            <div className="w-8 h-8 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-8 bg-[#FFFFFF]">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#000000] mb-2">퀴즈 모아보기</h1>
        <div className="w-16 h-1 bg-[#FACC15] mx-auto rounded-full"></div>
        <p className="text-[#9CA3AF] mt-4">
          총 {quizzes.length}개의 퀴즈가 있습니다
        </p>
      </div>

      {/* 퀴즈 목록 */}
      <div className="grid gap-6">
        {quizzes.map((quiz) => {
          const quizId = quiz.quiz_id || quiz.id;
          const questionCount = quiz.question_count || quiz.questions?.length || 0;
          
          return (
            <div 
              key={quizId} 
              className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-[#F3F4F6] hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#000000] mb-2">
                    {quiz.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-[#9CA3AF] mb-4">
                    <span className="flex items-center gap-1">
                      📝 {questionCount}문항
                    </span>
                    <span className="flex items-center gap-1">
                      📅 {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString('ko-KR') : '날짜 없음'}
                    </span>
                    {quiz.last_attempted && (
                      <span className="flex items-center gap-1">
                        🎯 마지막 시도: {new Date(quiz.last_attempted).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                  </div>
                  {quiz.description && (
                    <p className="text-[#374151] text-sm mb-4 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleStartQuiz(quizId)}
                    className="px-4 py-2 bg-[#FACC15] text-[#000000] rounded-lg hover:bg-[#F59E0B] transition-colors font-semibold whitespace-nowrap"
                  >
                    퀴즈 시작
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quizId, quiz.title)}
                    className="px-4 py-2 bg-[#9CA3AF] text-[#FFFFFF] rounded-lg hover:bg-[#F87171] transition-colors font-medium text-sm whitespace-nowrap"
                  >
                    삭제
                  </button>
                </div>
              </div>

              {/* 태그 표시 */}
              {quiz.tags && quiz.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {quiz.tags.map((tag: string, idx: number) => (
                    <span 
                      key={idx}
                      className="bg-[#FACC15]/20 text-[#000000] px-2 py-1 rounded-full text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {quizzes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-[#374151] mb-2">
              생성된 퀴즈가 없습니다
            </h3>
            <p className="text-[#9CA3AF] mb-6">
              자료 상세 페이지에서 "AI 퀴즈 생성" 버튼을 눌러 퀴즈를 만들어보세요!
            </p>
            <button
              onClick={() => router.push('/library')}
              className="px-6 py-3 bg-[#FACC15] text-[#000000] rounded-lg hover:bg-[#F59E0B] transition-colors font-semibold"
            >
              자료 보러가기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

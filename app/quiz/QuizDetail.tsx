'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuizDetail({ quizId }: { quizId: number }) {
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 QuizDetail 시작 - quizId:', quizId);
    
    // API 문서에 따른 퀴즈 상세 조회 (질문 포함)
    const apiUrl = `http://localhost:3000/api/quizzes/${quizId}?include_questions=true`;
    console.log('🌐 API 요청 URL:', apiUrl);
    
    fetch(apiUrl, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => {
        console.log('📡 응답 상태:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('📊 퀴즈 상세 원본 데이터:', data);
        
        // 응답 구조에 맞춰 데이터 추출
        let quizData = null;
        if (data?.data?.quiz) {
          quizData = data.data.quiz;
          console.log('✅ 구조 1: data.data.quiz');
        } else if (data?.data) {
          quizData = data.data;
          console.log('✅ 구조 2: data.data');
        } else if (data?.quiz) {
          quizData = data.quiz;
          console.log('✅ 구조 3: data.quiz');
        } else if (data && !data.success) {
          quizData = data;
          console.log('✅ 구조 4: data 직접');
        }
        
        console.log('🎯 정리된 퀴즈 데이터:', quizData);
        
        if (quizData) {
          setQuiz(quizData);
        } else {
          console.error('❌ 퀴즈 데이터를 찾을 수 없음');
        }
      })
      .catch(error => {
        console.error('❌ 퀴즈 로딩 오류:', error);
        alert('퀴즈를 불러오는데 실패했습니다.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [quizId, router]);

  const handleChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
    console.log('답변 변경:', { questionId, value, currentAnswers: { ...answers, [questionId]: value } });
  };

  const handleSubmit = async () => {
    console.log('퀴즈 제출 시도:', { quizId, answers });
    
    // 모든 문제에 답변했는지 확인
    const questions = quiz?.questions || [];
    const unansweredQuestions = questions.filter((q: any) => !answers[q.question_id]);
    
    if (unansweredQuestions.length > 0) {
      alert('모든 문제에 답변해주세요.');
      return;
    }

    try {
      // API 문서에 따른 퀴즈 제출 엔드포인트 사용
      const res = await fetch(`http://localhost:3000/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ answers })
      });
      
      console.log('퀴즈 제출 응답 상태:', res.status);
      const data = await res.json();
      console.log('퀴즈 제출 결과:', data);
      
      if (res.ok && data.success) {
        // 응답 구조에 맞춰 결과 데이터 추출
        let resultData = null;
        if (data?.data?.result) {
          resultData = data.data.result;
        } else if (data?.data) {
          resultData = data.data;
        } else if (data?.result) {
          resultData = data.result;
        }
        
        setResult(resultData);
        setSubmitted(true);
        alert('퀴즈가 제출되었습니다!');
      } else {
        console.error('퀴즈 제출 실패:', data);
        alert(`퀴즈 제출에 실패했습니다: ${data.message || data.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('퀴즈 제출 오류:', error);
      alert('퀴즈 제출 중 오류가 발생했습니다.');
    }
  };

  // 객관식 선택지 렌더링 (모든 문제가 객관식)
  const renderMultipleChoice = (question: any, questionIndex: number) => {
    let options = question.options || [];
    
    // options가 문자열인 경우 JSON 파싱 시도
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options);
        console.log(`문제 ${questionIndex + 1} 파싱된 선택지:`, options);
      } catch (e) {
        console.error(`문제 ${questionIndex + 1} JSON 파싱 실패:`, e);
        options = [];
      }
    }
    
    // 배열이 아니거나 빈 배열인 경우 처리
    if (!Array.isArray(options) || options.length === 0) {
      console.warn(`문제 ${questionIndex + 1} 선택지가 없거나 올바르지 않음:`, question.options);
      return (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-600 font-medium">❌ 이 문제의 선택지를 불러올 수 없습니다.</p>
          <p className="text-red-500 text-sm mt-1">
            원본 데이터: {JSON.stringify(question.options)}
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {options.map((option: string, optionIndex: number) => (
          <label 
            key={`${question.question_id}-option-${optionIndex}`}
            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
              answers[question.question_id] === option
                ? 'border-[#FACC15] bg-[#FACC15]/10'
                : 'border-[#E5E7EB] bg-[#F9FAFB] hover:border-[#FACC15]/50'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.question_id}`}
              value={option}
              checked={answers[question.question_id] === option}
              onChange={(e) => handleChange(question.question_id.toString(), e.target.value)}
              disabled={submitted}
              className="w-5 h-5 text-[#FACC15] border-[#9CA3AF] focus:ring-[#FACC15] focus:ring-2"
            />
            <span className="ml-3 text-[#374151] text-base leading-relaxed">
              {optionIndex + 1}. {option}
            </span>
          </label>
        ))}
      </div>
    );
  };

  // 결과 표시
  const renderResult = () => {
    if (!result) return null;

    console.log('채점 결과 데이터:', result);

    // 백엔드에서 제공하는 데이터 사용
    const correctCount = result.correct_count || 0;
    const totalQuestions = result.total_questions || quiz.questions?.length || 0;
    const accuracy = result.accuracy || 0; // 백분율
    const accuracyDisplay = result.accuracy_display || `${correctCount}/${totalQuestions}`;
    const detailedResults = result.results || [];

    console.log('파싱된 채점 결과:', { correctCount, totalQuestions, accuracy, accuracyDisplay });

    return (
      <div className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-[#F3F4F6] space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-[#000000] mb-2">채점 결과</h3>
          <div className="text-3xl font-bold text-[#FACC15] mb-2">
            {accuracyDisplay}
          </div>
          <div className="text-lg text-[#374151]">
            정답률: {Math.round(accuracy)}%
          </div>
          
          {/* 성과에 따른 메시지 */}
          <div className="mt-4">
            {accuracy >= 90 && (
              <div className="text-green-600 font-semibold">🎉 완벽합니다!</div>
            )}
            {accuracy >= 70 && accuracy < 90 && (
              <div className="text-blue-600 font-semibold">👍 잘했습니다!</div>
            )}
            {accuracy >= 50 && accuracy < 70 && (
              <div className="text-yellow-600 font-semibold">📚 조금 더 공부해보세요!</div>
            )}
            {accuracy < 50 && (
              <div className="text-red-600 font-semibold">💪 다시 한번 도전해보세요!</div>
            )}
          </div>
        </div>
        
        {result.feedback && (
          <div className="bg-[#FACC15]/10 p-4 rounded-lg border border-[#FACC15]/20">
            <h4 className="font-semibold text-[#000000] mb-2">피드백</h4>
            <p className="text-[#374151] whitespace-pre-wrap">{result.feedback}</p>
          </div>
        )}

        {/* 상세 답안 표시 */}
        {detailedResults && detailedResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-[#000000]">상세 결과</h4>
            {detailedResults.map((detail: any, idx: number) => (
              <div key={`result-${detail.question_id || idx}`} className={`p-3 rounded-lg border ${
                detail.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="font-medium text-sm text-gray-600 mb-1">
                  문제 {idx + 1}: {detail.question_text}
                </div>
                <div className="font-medium">
                  {detail.is_correct ? '✅ 정답' : '❌ 오답'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <div>내 답: <span className="font-medium">{detail.user_answer || '미답변'}</span></div>
                  <div>정답: <span className="font-medium text-green-600">{detail.correct_answer}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setResult(null);
            }}
            className="px-4 py-2 bg-[#9CA3AF] text-[#FFFFFF] rounded-lg hover:bg-[#374151] transition-colors font-medium"
          >
            다시 풀기
          </button>
          <button
            onClick={() => router.push('/quiz')}
            className="px-4 py-2 bg-[#FACC15] text-[#000000] rounded-lg hover:bg-[#F59E0B] transition-colors font-medium"
          >
            퀴즈 목록
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg text-[#374151] mb-2">퀴즈를 불러오는 중... (ID: {quizId})</div>
            <div className="w-8 h-8 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-[#374151] mb-2">
            퀴즈를 찾을 수 없습니다 (ID: {quizId})
          </h3>
          <p className="text-[#9CA3AF] mb-4">
            개발자 도구의 Console 탭을 확인해주세요.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/quiz')}
              className="px-6 py-3 bg-[#FACC15] text-[#000000] rounded-lg hover:bg-[#F59E0B] transition-colors font-semibold"
            >
              퀴즈 목록으로 돌아가기
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#9CA3AF] text-[#FFFFFF] rounded-lg hover:bg-[#374151] transition-colors font-semibold"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 bg-[#FFFFFF]">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <button 
          className="text-[#374151] hover:text-[#000000] font-medium"
          onClick={() => router.back()}
        >
          ← 뒤로가기
        </button>
        <div className="text-sm text-[#9CA3AF]">
          {quiz.questions?.length || 0}문항
        </div>
      </div>

      {/* 퀴즈 제목 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#000000] mb-2">{quiz.title}</h1>
        <div className="w-16 h-1 bg-[#FACC15] mx-auto rounded-full"></div>
        {quiz.description && (
          <p className="text-[#9CA3AF] mt-4">{quiz.description}</p>
        )}
      </div>

      {/* 퀴즈 폼 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-8"
      >
        {quiz.questions?.map((question: any, questionIndex: number) => (
          <div 
            key={`question-${question.question_id || questionIndex}`}
            className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-[#F3F4F6] space-y-4"
          >
            {/* 문제 번호와 제목 */}
            <div className="border-b border-[#F3F4F6] pb-4">
              <h3 className="text-lg font-semibold text-[#000000] leading-relaxed">
                {questionIndex + 1}. {question.question_text || question.question || question.text}
              </h3>
            </div>

            {/* 답변 영역 - 모든 문제가 객관식 */}
            <div className="pt-2">
              {renderMultipleChoice(question, questionIndex)}
            </div>
          </div>
        ))}

        {/* 제출 버튼 */}
        {!submitted && (
          <div className="text-center pt-6">
            <button
              type="submit"
              className="px-8 py-3 bg-[#FACC15] text-[#000000] rounded-lg font-bold text-lg hover:bg-[#F59E0B] transition-colors shadow-sm"
            >
              퀴즈 제출하기
            </button>
          </div>
        )}
      </form>

      {/* 결과 표시 */}
      {submitted && renderResult()}
    </div>
  );
}
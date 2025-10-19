'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LibraryDetail({ noteId }: { noteId: number }) {
  const [detail, setDetail] = useState<any>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const router = useRouter();

  // 키워드 목록 새로고침 함수
  const refreshKeywords = async () => {
    try {
      console.log('자료 상세 - 키워드 새로고침 시작:', noteId);
      const keywordResponse = await fetch(`http://localhost:3000/api/keywords?note_id=${noteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (keywordResponse.ok) {
        const keywordData = await keywordResponse.json();
        console.log('자료 상세 - 새로고침된 키워드 데이터:', keywordData);
        
        // 백엔드 응답 구조 확인 및 처리 (홈화면과 동일한 로직)
        let keywordList = [];
        
        if (keywordData?.data?.keywords && Array.isArray(keywordData.data.keywords)) {
          keywordList = keywordData.data.keywords;
        } else if (keywordData?.data && Array.isArray(keywordData.data)) {
          keywordList = keywordData.data;
        } else if (Array.isArray(keywordData?.keywords)) {
          keywordList = keywordData.keywords;
        } else if (Array.isArray(keywordData)) {
          keywordList = keywordData;
        }
        
        console.log('자료 상세 - 원본 키워드 리스트:', keywordList);
        
        // 키워드 데이터 정리 (불필요한 접두사 제거)
        const cleanedKeywords = keywordList.map((kw: any) => {
          if (typeof kw === 'string') {
            return kw.replace(/^\d+:\s*/, '').trim(); // "1: 키워드" -> "키워드"
          } else if (kw.word) {
            return kw.word.replace(/^\d+:\s*/, '').trim();
          }
          return kw;
        });
        
        console.log('자료 상세 - 정리된 키워드 목록:', cleanedKeywords);
        setKeywords(cleanedKeywords);
      } else {
        console.error('자료 상세 - 키워드 조회 실패:', keywordResponse.status);
        setKeywords([]);
      }
    } catch (error) {
      console.error('자료 상세 - 키워드 새로고침 오류:', error);
      setKeywords([]);
    }
  };

  useEffect(() => {
    if (!noteId) return;
    console.log('자료 상세 - 노트 ID:', noteId);
    
    // 노트 상세 정보와 키워드를 함께 불러오기
    Promise.all([
      fetch(`http://localhost:3000/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }),
      fetch(`http://localhost:3000/api/keywords?note_id=${noteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
    ])
      .then(async ([noteRes, keywordRes]) => {
        // 노트 상세 정보 처리
        const noteData = await noteRes.json();
        console.log('자료 상세 - 노트 데이터:', noteData);
        const note = noteData?.data?.note || noteData?.data;
        setDetail(note);
        
        // 키워드 처리
        if (keywordRes.ok) {
          const keywordData = await keywordRes.json();
          console.log('자료 상세 - 키워드 데이터:', keywordData);
          
          // 백엔드 응답 구조 확인 및 처리 (홈화면과 동일한 로직)
          let keywordList = [];
          
          if (keywordData?.data?.keywords && Array.isArray(keywordData.data.keywords)) {
            keywordList = keywordData.data.keywords;
          } else if (keywordData?.data && Array.isArray(keywordData.data)) {
            keywordList = keywordData.data;
          } else if (Array.isArray(keywordData?.keywords)) {
            keywordList = keywordData.keywords;
          } else if (Array.isArray(keywordData)) {
            keywordList = keywordData;
          }
          
          console.log('자료 상세 - 원본 키워드 리스트:', keywordList);
          
          const cleanedKeywords = keywordList.map((kw: any) => {
            if (typeof kw === 'string') {
              return kw.replace(/^\d+:\s*/, '').trim(); // "1: 키워드" -> "키워드"
            } else if (kw.word) {
              return kw.word.replace(/^\d+:\s*/, '').trim();
            }
            return kw;
          });
          
          console.log('자료 상세 - 정리된 키워드 목록:', cleanedKeywords);
          setKeywords(cleanedKeywords);
        } else {
          console.error('자료 상세 - 키워드 조회 실패:', keywordRes.status);
          setKeywords([]);
        }
      })
      .catch(error => {
        console.error('자료 상세 - 데이터 로딩 오류:', error);
        setKeywords([]);
      });
  }, [noteId]);

  // 퀴즈 생성 - API 문서에 맞춰 수정
  const handleCreateQuiz = async () => {
    if (!detail) return;
    setIsCreatingQuiz(true);
    
    console.log('AI 퀴즈 생성 시도:', { noteId, title: detail.title });
    
    try {
      // API 문서에 따른 노트로부터 AI 퀴즈 생성 엔드포인트 사용
      const response = await fetch(`http://localhost:3000/api/quizzes/from-note/${noteId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      console.log('퀴즈 생성 응답 상태:', response.status);
      const result = await response.json();
      console.log('퀴즈 생성 응답:', result);
      
      if (response.ok && result.success) {
        alert('AI 퀴즈가 생성되었습니다!');
        router.push('/quiz');
      } else {
        console.error('퀴즈 생성 실패:', result);
        alert(`퀴즈 생성에 실패했습니다: ${result.message || result.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('퀴즈 생성 오류:', error);
      alert('퀴즈 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  // 키워드 추가 - API 스펙에 맞춰 수정
  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      console.log('자료 상세 - 키워드가 비어있습니다');
      alert('키워드를 입력해주세요.');
      return;
    }
    
    // 정리된 키워드로 중복 체크
    const cleanedInput = newKeyword.trim();
    if (keywords.some(kw => {
      const cleanedKw = typeof kw === 'string' ? kw.replace(/^\d+:\s*/, '').trim() : kw;
      return cleanedKw === cleanedInput;
    })) {
      console.log('자료 상세 - 이미 존재하는 키워드:', cleanedInput);
      alert('이미 존재하는 키워드입니다.');
      return;
    }
    
    console.log('자료 상세 - 키워드 추가 시도:', { 
      keyword: cleanedInput, 
      noteId,
      currentKeywords: keywords 
    });
    
    try {
      // API 스펙에 맞는 요청 본문
      const requestBody = { word: cleanedInput, note_id: noteId };
      console.log('자료 상세 - 요청 본문:', requestBody);
      
      const response = await fetch('http://localhost:3000/api/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('자료 상세 - 키워드 추가 응답 상태:', response.status);
      const result = await response.json();
      console.log('자료 상세 - 키워드 추가 응답:', result);
      
      if (response.ok && result.success) {
        // 키워드 목록 새로고침
        await refreshKeywords();
        
        setNewKeyword("");
        console.log('자료 상세 - 키워드 추가 성공');
        alert('키워드가 추가되었습니다.');
      } else {
        console.error('자료 상세 - 키워드 추가 실패:', result);
        alert(`키워드 추가 실패: ${result.message || result.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('자료 상세 - 키워드 추가 네트워크 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  // 키워드 삭제 - 개선된 로직으로 수정
  const handleRemoveKeyword = async (idx: number) => {
    const keyword = keywords[idx];
    console.log('자료 상세 - 키워드 삭제 시도:', { 
      keyword, 
      index: idx, 
      noteId,
      currentKeywords: keywords 
    });
    
    try {
      // 먼저 키워드 목록을 조회해서 keyword_id를 찾기
      const keywordResponse = await fetch(`http://localhost:3000/api/keywords?note_id=${noteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (!keywordResponse.ok) {
        throw new Error('키워드 목록을 가져올 수 없습니다.');
      }
      
      const keywordData = await keywordResponse.json();
      
      // 백엔드 응답 구조 확인 및 처리 (홈화면과 동일한 로직)
      let keywordList = [];
      
      if (keywordData?.data?.keywords && Array.isArray(keywordData.data.keywords)) {
        keywordList = keywordData.data.keywords;
      } else if (keywordData?.data && Array.isArray(keywordData.data)) {
        keywordList = keywordData.data;
      } else if (Array.isArray(keywordData?.keywords)) {
        keywordList = keywordData.keywords;
      } else if (Array.isArray(keywordData)) {
        keywordList = keywordData;
      }
      
      // 현재 키워드와 일치하는 항목 찾기
      const foundKeyword = keywordList.find((kw: any) => {
        const cleanedKw = typeof kw.word === 'string' ? kw.word.replace(/^\d+:\s*/, '').trim() : kw.word;
        return cleanedKw === keyword;
      });
      
      if (!foundKeyword) {
        throw new Error('삭제할 키워드를 찾을 수 없습니다.');
      }
      
      // API 스펙에 맞는 삭제 요청
      const deleteUrl = `http://localhost:3000/api/keywords/${foundKeyword.keyword_id}?note_id=${noteId}`;
      console.log('자료 상세 - 삭제 요청 URL:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      console.log('자료 상세 - 키워드 삭제 응답 상태:', response.status);
      const result = await response.json();
      console.log('자료 상세 - 키워드 삭제 응답:', result);
      
      if (response.ok && result.success) {
        // 키워드 목록 새로고침
        await refreshKeywords();
        
        console.log('자료 상세 - 키워드 삭제 성공');
        alert('키워드가 삭제되었습니다.');
      } else {
        console.error('자료 상세 - 키워드 삭제 실패:', result);
        alert(`키워드 삭제 실패: ${result.message || result.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('자료 상세 - 키워드 삭제 네트워크 오류:', error);
      alert('키워드 삭제 중 오류가 발생했습니다.');
    }
  };

  if (!detail) return <div className="p-8 text-center text-[#374151]">로딩 중...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 bg-[#FFFFFF]">
      <div className="flex justify-between items-center">
        <button 
          className="text-[#374151] hover:text-[#000000] font-medium"
          onClick={() => router.back()}
        >
          ← 목록으로
        </button>
        <button
          onClick={handleCreateQuiz}
          disabled={isCreatingQuiz}
          className="px-4 py-2 bg-[#FACC15] text-[#000000] rounded hover:bg-[#F59E0B] disabled:opacity-50 font-semibold transition-colors"
        >
          {isCreatingQuiz ? 'AI 퀴즈 생성 중...' : 'AI 퀴즈 생성'}
        </button>
      </div>

      <div className="flex gap-8">
        {/* 왼쪽: 파일 미리보기 */}
        <main className="flex-1 space-y-6">
          <section className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-[#F3F4F6] space-y-4">
            <h2 className="text-lg font-bold mb-2 text-[#000000]">{detail.title}</h2>
            {detail.file_type?.startsWith('image/') && (
              <img src={detail.storage_url} alt={detail.title} className="max-w-full max-h-[500px] mx-auto rounded-lg" />
            )}
            {detail.file_type === 'application/pdf' && (
              <div className="flex items-center justify-center bg-[#F3F4F6] rounded-lg h-[500px]">
                <span className="text-lg text-[#374151]">PDF 미리보기</span>
              </div>
            )}
            {!detail.file_type?.startsWith('image/') && detail.file_type !== 'application/pdf' && (
              <pre className="bg-[#F3F4F6] p-6 rounded-lg text-base max-h-[500px] overflow-auto whitespace-pre-wrap text-[#374151]">
                {detail.content || "내용이 없습니다."}
              </pre>
            )}
          </section>

          <section className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-[#F3F4F6] space-y-4">
            <h2 className="text-lg font-bold mb-2 text-[#000000]">요약본</h2>
            <pre className="bg-[#FACC15]/10 p-4 rounded-lg whitespace-pre-wrap text-[#374151] border border-[#FACC15]/20">
              {detail.summary || "요약 정보 없음"}
            </pre>
          </section>
        </main>

        {/* 오른쪽: 키워드 관리 */}
        <aside className="w-1/3 space-y-4">
          <section className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-[#F3F4F6]">
            <h3 className="text-lg font-bold mb-4 text-[#000000]">키워드 ({keywords.length}개)</h3>
            <div className="flex flex-wrap gap-2 mb-4 min-h-[50px]">
              {keywords.map((kw, idx) => {
                // 키워드 표시 시에도 불필요한 접두사 제거
                const displayWord = typeof kw === 'string' ? kw.replace(/^\d+:\s*/, '').trim() : kw;
                
                return (
                  <span 
                    key={`${displayWord}-${idx}`} 
                    className="bg-[#9CA3AF] text-[#FFFFFF] px-4 py-1.5 rounded-full flex items-center gap-2 text-sm whitespace-nowrap"
                    style={{ minWidth: '60px', borderRadius: '20px' }}
                  >
                    <span title={displayWord} className="leading-none">
                      {displayWord}
                    </span>
                    <button
                      onClick={() => handleRemoveKeyword(idx)}
                      className="text-[#FFFFFF] hover:text-[#F87171] transition-colors leading-none"
                      style={{ fontSize: '16px', fontWeight: 'bold' }}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              {keywords.length === 0 && (
                <div className="text-[#9CA3AF] text-sm flex items-center justify-center w-full py-4">
                  키워드가 없습니다.
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                className="flex-1 px-3 py-2 border border-[#F3F4F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent"
                placeholder="키워드 추가"
              />
              <button
                onClick={handleAddKeyword}
                className="px-4 py-2 rounded-lg bg-[#374151] text-[#FFFFFF] hover:bg-[#000000] transition-colors font-medium"
              >
                추가
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
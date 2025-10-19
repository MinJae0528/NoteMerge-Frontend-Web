'use client'
import { useEffect, useState, useMemo } from "react";

// 키워드 타입 정의
interface Keyword {
  keyword_id: number;
  word: string;
  source?: string;
}

export default function HomePresenter() {
  const [files, setFiles] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [summary, setSummary] = useState("");

  // 파일 목록 불러오기
  useEffect(() => {
    fetch("http://localhost:3000/api/notes", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        const filesArr = Array.isArray(data?.data?.notes) ? data.data.notes : [];
        setFiles(filesArr);
        if (filesArr.length > 0) setSelected(filesArr[0]);
      })
      .catch(error => {
        console.error('파일 목록 로딩 오류:', error);
      });
  }, []);

  const selectedNoteId = useMemo(() => {
    if (!selected) return null;
    return selected.note_id || selected.id || null;
  }, [selected]);

  // 키워드 목록 새로고침 함수
  const refreshKeywords = async (noteId: number) => {
    try {
      console.log('🔄 키워드 새로고침 시작:', noteId);
      const keywordResponse = await fetch(`http://localhost:3000/api/keywords?note_id=${noteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      console.log('🔄 키워드 응답 상태:', keywordResponse.status);
      
      if (keywordResponse.ok) {
        const keywordData = await keywordResponse.json();
        console.log('🔄 새로고침된 키워드 전체 응답:', keywordData);
        
        // 백엔드 응답 구조 확인 및 처리
        let keywordList = [];
        
        if (keywordData?.data?.keywords && Array.isArray(keywordData.data.keywords)) {
          // 구조: { success: true, data: { keywords: [...] } }
          keywordList = keywordData.data.keywords;
        } else if (keywordData?.data && Array.isArray(keywordData.data)) {
          // 구조: { success: true, data: [...] }
          keywordList = keywordData.data;
        } else if (Array.isArray(keywordData?.keywords)) {
          // 구조: { keywords: [...] }
          keywordList = keywordData.keywords;
        } else if (Array.isArray(keywordData)) {
          // 구조: [...]
          keywordList = keywordData;
        }
        
        console.log('🔄 원본 키워드 리스트:', keywordList);
        
        const cleanedKeywords = keywordList.map((kw: any) => ({
          ...kw,
          word: typeof kw.word === 'string' ? 
                kw.word.replace(/^\d+:\s*/, '').trim() : // "1: 키워드" -> "키워드"
                kw.word
        }));
        
        console.log('🔄 정리된 키워드 목록:', cleanedKeywords);
        setKeywords(cleanedKeywords);
      } else {
        console.error('❌ 키워드 조회 실패:', keywordResponse.status);
        const errorText = await keywordResponse.text();
        console.error('❌ 키워드 조회 에러 내용:', errorText);
        setKeywords([]);
      }
    } catch (error) {
      console.error('❌ 키워드 새로고침 오류:', error);
      setKeywords([]);
    }
  };

  // 선택 파일 상세 정보 불러오기
  useEffect(() => {
    if (!selectedNoteId) {
      console.log('❌ 선택된 노트 ID가 없음');
      setKeywords([]);
      setSummary("");
      return;
    }
    
    console.log('🔄 선택된 노트 ID:', selectedNoteId);
    
    // 노트 상세 정보와 키워드를 함께 불러오기
    Promise.all([
      // 노트 상세 정보
      fetch(`http://localhost:3000/api/notes/${selectedNoteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }),
      // 해당 노트의 키워드 목록
      fetch(`http://localhost:3000/api/keywords?note_id=${selectedNoteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
    ])
      .then(async ([noteRes, keywordRes]) => {
        console.log('🔄 노트 응답 상태:', noteRes.status);
        console.log('🔄 키워드 응답 상태:', keywordRes.status);
        
        const noteData = await noteRes.json();
        console.log('🔄 노트 상세 데이터:', noteData);
        
        const note = noteData?.data?.note;
        if (note) {
          setSummary(note.summary || "");
          setSelected(prev => ({ ...prev, ...note }));
        }
        
        // 키워드 응답 처리
        if (keywordRes.ok) {
          const keywordData = await keywordRes.json();
          console.log('🔄 키워드 전체 응답:', keywordData);
          
          // 백엔드 응답 구조 확인 및 처리
          let keywordList = [];
          
          if (keywordData?.data?.keywords && Array.isArray(keywordData.data.keywords)) {
            // 구조: { success: true, data: { keywords: [...] } }
            keywordList = keywordData.data.keywords;
          } else if (keywordData?.data && Array.isArray(keywordData.data)) {
            // 구조: { success: true, data: [...] }
            keywordList = keywordData.data;
          } else if (Array.isArray(keywordData?.keywords)) {
            // 구조: { keywords: [...] }
            keywordList = keywordData.keywords;
          } else if (Array.isArray(keywordData)) {
            // 구조: [...]
            keywordList = keywordData;
          }
          
          console.log('🔄 원본 키워드 리스트:', keywordList);
          
          const cleanedKeywords = keywordList.map((kw: any) => ({
            ...kw,
            word: typeof kw.word === 'string' ? 
                  kw.word.replace(/^\d+:\s*/, '').trim() : // "1: 키워드" -> "키워드"
                  kw.word
          }));
          
          console.log('🔄 정리된 키워드 목록:', cleanedKeywords);
          console.log('🔄 키워드 개수:', cleanedKeywords.length);
          setKeywords(cleanedKeywords);
        } else {
          console.error('❌ 키워드 조회 실패:', keywordRes.status);
          const errorText = await keywordRes.text();
          console.error('❌ 키워드 조회 에러 내용:', errorText);
          setKeywords([]);
        }
      })
      .catch(error => {
        console.error('❌ 데이터 로딩 오류:', error);
        setKeywords([]);
        setSummary("");
      });
  }, [selectedNoteId]);

  // 현재 상태 디버깅 로그
  useEffect(() => {
    console.log('🔍 현재 키워드 상태:', {
      keywords,
      keywordsLength: keywords.length,
      selectedNoteId,
      selected: selected?.title
    });
  }, [keywords, selectedNoteId, selected]);

  // 키워드 추가 - API 스펙에 맞춰 수정
  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      console.log('❌ 키워드가 비어있습니다');
      alert('키워드를 입력해주세요.');
      return;
    }
    
    // 정리된 키워드로 중복 체크
    const cleanedInput = newKeyword.trim();
    if (keywords.some(kw => {
      const cleanedWord = typeof kw.word === 'string' ? 
                         kw.word.replace(/^\d+:\s*/, '').trim() : 
                         kw.word;
      return cleanedWord === cleanedInput;
    })) {
      console.log('❌ 이미 존재하는 키워드입니다:', cleanedInput);
      alert('이미 존재하는 키워드입니다.');
      return;
    }
    
    if (!selectedNoteId) {
      console.log('❌ 선택된 노트가 없습니다');
      alert('노트를 선택해주세요.');
      return;
    }
    
    console.log('➕ 키워드 추가 시도:', { 
      keyword: cleanedInput, 
      noteId: selectedNoteId,
      currentKeywords: keywords 
    });
    
    try {
      // API 스펙에 맞는 키워드 추가 요청
      const response = await fetch('http://localhost:3000/api/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ 
          note_id: selectedNoteId,
          word: cleanedInput  // 정리된 키워드 사용
        })
      });
      
      console.log('➕ 키워드 추가 응답 상태:', response.status);
      const result = await response.json();
      console.log('➕ 키워드 추가 응답 데이터:', result);
      
      if (response.ok && result.success) {
        // 키워드 목록 새로고침 - 반드시 실행되도록 수정
        console.log('✅ 키워드 추가 성공, 목록 새로고침 시작');
        await refreshKeywords(selectedNoteId);
        
        setNewKeyword("");
        console.log('✅ 키워드 추가 완료');
        alert('키워드가 추가되었습니다.');
      } else {
        console.error('❌ 키워드 추가 실패:', result);
        alert(`키워드 추가 실패: ${result.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('❌ 키워드 추가 네트워크 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  // 키워드 삭제 - API 스펙에 맞춰 수정
  const handleRemoveKeyword = async (idx: number) => {
    const keyword = keywords[idx];
    console.log('🗑️ 키워드 삭제 시도:', { 
      keyword, 
      index: idx, 
      noteId: selectedNoteId,
      currentKeywords: keywords 
    });
    
    try {
      // API 스펙에 맞는 삭제 엔드포인트 사용
      const deleteUrl = `http://localhost:3000/api/keywords/${keyword.keyword_id}?note_id=${selectedNoteId}`;
      console.log('🗑️ 삭제 요청 URL:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      console.log('🗑️ 삭제 응답 상태:', response.status);
      const result = await response.json();
      console.log('🗑️ 삭제 응답 데이터:', result);
      
      if (response.ok && result.success) {
        // 키워드 목록 새로고침
        console.log('✅ 키워드 삭제 성공, 목록 새로고침 시작');
        await refreshKeywords(selectedNoteId as number);
        
        console.log('✅ 키워드 삭제 완료');
        alert('키워드가 삭제되었습니다.');
      } else {
        console.error('❌ 키워드 삭제 실패:', result);
        alert(`키워드 삭제 실패: ${result.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('❌ 키워드 삭제 네트워크 오류:', error);
      alert('키워드 삭제 중 오류가 발생했습니다.');
    }
  };

  // 파일 선택 처리
  const handleFileSelect = (file: any) => {
    const fileNoteId = file.note_id || file.id;
    const currentNoteId = selected?.note_id || selected?.id;
    
    console.log('📄 파일 선택:', { fileNoteId, currentNoteId, file });
    
    if (fileNoteId === currentNoteId) {
      console.log('📄 같은 파일 재선택, 무시');
      return;
    }
    
    setSelected(file);
    setPage(1);
  };

  // 파일 미리보기 렌더링
  const renderFilePreview = () => {
    if (!selected) return <div className="flex items-center justify-center h-[500px] text-[#374151]">파일을 선택해주세요</div>;

    if (selected.file_type?.startsWith('image/')) {
      return (
        <img 
          src={selected.storage_url || selected.url} 
          alt={selected.title} 
          className="max-w-full max-h-[500px] mx-auto object-contain rounded-lg" 
        />
      );
    }
    
    if (selected.file_type === 'application/pdf') {
      return (
        <div className="flex flex-col items-center justify-center bg-[#F3F4F6] rounded-lg h-[500px]">
          <span className="text-lg text-[#374151] mb-4">PDF 미리보기</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-[#9CA3AF] text-[#FFFFFF] disabled:opacity-50 hover:bg-[#374151] transition-colors"
            >
              이전
            </button>
            <span className="px-2 text-[#374151]">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-[#9CA3AF] text-[#FFFFFF] disabled:opacity-50 hover:bg-[#374151] transition-colors"
            >
              다음
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-[#F3F4F6] p-6 rounded-lg max-h-[500px] overflow-auto">
        <pre className="whitespace-pre-wrap text-sm text-[#374151]">
          {selected.content || selected.summary || "내용이 없습니다."}
        </pre>
      </div>
    );
  };

  return (
    <div className="flex max-w-6xl mx-auto px-6 py-8 gap-8 bg-[#FFFFFF]">
      {/* 왼쪽: 내 자료 리스트 */}
      <aside className="w-1/4 space-y-4">
        <h2 className="text-lg font-bold mb-2 text-[#000000]">내 자료</h2>
        <ul className="space-y-2">
          {files.map((file) => {
            const fileNoteId = file.note_id || file.id;
            const currentNoteId = selected?.note_id || selected?.id;
            const isSelected = fileNoteId === currentNoteId;
            
            return (
              <li key={fileNoteId}>
                <button
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-[#FACC15]/20 border border-[#FACC15] font-semibold"
                      : "bg-[#F3F4F6] hover:bg-[#FACC15]/10 border border-transparent"
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="font-medium text-[#000000]">{file.title || file.name}</div>
                  <div className="text-xs text-[#374151]">
                    {file.created_at ? new Date(file.created_at).toLocaleDateString() : ''}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* 가운데: 파일 미리보기 + 요약본 */}
      <main className="flex-1 space-y-6">
        {/* 파일 미리보기 */}
        <section className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-[#F3F4F6] space-y-4">
          <h2 className="text-lg font-bold mb-2 text-[#000000]">파일 미리보기</h2>
          {renderFilePreview()}
        </section>

        {/* 요약본 */}
        <section className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-[#F3F4F6] space-y-4">
          <h2 className="text-lg font-bold mb-2 text-[#000000]">요약본</h2>
          <pre className="bg-[#FACC15]/10 p-4 rounded-lg whitespace-pre-wrap text-[#374151] border border-[#FACC15]/20">
            {summary || "요약 정보 없음"}
          </pre>
        </section>
      </main>

      {/* 오른쪽: 키워드 관리 */}
      <aside className="w-1/4 flex flex-col space-y-4">
        <h2 className="text-lg font-bold text-[#000000]">키워드 ({keywords.length}개)</h2>
        
        <div className="bg-[#FFFFFF] p-4 rounded-xl shadow-sm border border-[#F3F4F6] flex-1 flex flex-col">
          {/* 키워드 표시 영역 */}
          <div className="flex-1 mb-4 min-h-[100px] overflow-y-auto">
            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, idx) => {
                  // 키워드 표시 시에도 불필요한 접두사 제거
                  const displayWord = typeof kw.word === 'string' ? 
                                     kw.word.replace(/^\d+:\s*/, '').trim() : 
                                     kw.word;
                  
                  console.log('🏷️ 키워드 렌더링:', { original: kw.word, display: displayWord, idx, keyword_id: kw.keyword_id });
                  
                  return (
                    <span 
                      key={`${kw.keyword_id}-${idx}`} 
                      className="bg-[#9CA3AF] text-[#FFFFFF] px-3 py-1 rounded-full flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                      <span className="truncate max-w-[80px]" title={displayWord}>
                        {displayWord}
                      </span>
                      <button
                        onClick={() => handleRemoveKeyword(idx)}
                        className="text-[#FFFFFF] hover:text-[#F87171] transition-colors flex-shrink-0"
                        type="button"
                        title="키워드 삭제"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="text-[#9CA3AF] text-sm text-center py-8 h-full flex items-center justify-center">
                {selectedNoteId ? '키워드가 없습니다.' : '파일을 선택하면 키워드를 볼 수 있습니다.'}
              </div>
            )}
          </div>
          
          {/* 키워드 추가 영역 */}
          <div className="mt-auto border-t border-[#F3F4F6] pt-4">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                className="w-full px-3 py-2 border border-[#F3F4F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent text-sm"
                placeholder={selectedNoteId ? "키워드 추가" : "파일을 선택해주세요"}
                maxLength={20}
                disabled={!selectedNoteId}
              />
              <button
                onClick={handleAddKeyword}
                disabled={!selectedNoteId}
                className="w-full py-2 rounded-lg bg-[#374151] text-[#FFFFFF] font-medium hover:bg-[#000000] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

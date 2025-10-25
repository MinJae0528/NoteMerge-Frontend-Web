'use client'
import { useEffect, useState, useMemo } from "react";
import apiClient from "../../utils/apiClient";  // apiClient import 추가

// 키워드 타입 정의 - source 필드 추가
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

  // 파일 목록 불러오기 - apiClient 사용
  useEffect(() => {
    apiClient.get("/notes")
      .then(response => {
        const data = response.data;
        const filesArr = Array.isArray(data?.data?.notes) ? data.data.notes : [];
        setFiles(filesArr);
        if (filesArr.length > 0) setSelected(filesArr[0]);
      })
      .catch(error => {
        console.error('파일 목록 로딩 오류:', error);
        // 401 에러는 인터셉터에서 자동 처리됨
      });
  }, []);

  const selectedNoteId = useMemo(() => {
    if (!selected) return null;
    return selected.note_id || selected.id || null;
  }, [selected]);

  // 키워드 목록 새로고침 함수 - 노트 상세 API 사용으로 수정
  const refreshKeywords = async (noteId: number) => {
    try {
      console.log('🔄 키워드 새로고침 시작 (노트 상세 API 사용):', noteId);
      const noteResponse = await apiClient.get(`/notes/${noteId}`);
      
      console.log('🔄 노트 상세 응답 상태:', noteResponse.status);
      
      if (noteResponse.ok) {
        const noteData = noteResponse.data;
        console.log('🔄 노트 상세 전체 응답:', noteData);
        
        if (noteData.success && noteData.data && noteData.data.note && noteData.data.note.keywords) {
          // name -> word 필드 매핑 및 source 설정
          const mappedKeywords = noteData.data.note.keywords.map((kw: any) => ({
            keyword_id: kw.keyword_id,
            word: kw.name || kw.word, // name 필드를 word로 매핑
            source: kw.source || 'ai' // AI 생성 키워드로 기본 설정
          }));
          console.log('🔄 매핑된 키워드 목록:', mappedKeywords);
          setKeywords(mappedKeywords);
        } else {
          console.warn('❌ 키워드 데이터가 없음:', noteData);
          setKeywords([]);
        }
      } else {
        console.error('❌ 노트 상세 조회 실패:', noteResponse.status);
        setKeywords([]);
      }
    } catch (error) {
      console.error('❌ 키워드 새로고침 오류:', error);
      setKeywords([]);
    }
  };

  // 선택 파일 상세 정보 불러오기 - 단일 API 호출로 수정
  useEffect(() => {
    if (!selectedNoteId) {
      console.log('❌ 선택된 노트 ID가 없음');
      setKeywords([]);
      setSummary("");
      return;
    }
    
    console.log('🔄 선택된 노트 ID:', selectedNoteId);
    
    // 노트 상세 정보만 불러오기 (키워드 포함)
    apiClient.get(`/notes/${selectedNoteId}`)
      .then(async (noteRes) => {
        console.log('🔄 노트 응답 상태:', noteRes.status);
        
        const noteData = noteRes.data;
        console.log('🔄 노트 상세 데이터:', noteData);
        
        // 노트 데이터 처리 - files 배열 및 키워드 포함
        if (noteData.success && noteData.data && noteData.data.note) {
          const note = noteData.data.note;
          setSummary(note.summary || "");
          
          // 파일 정보를 포함하여 selected 업데이트
          setSelected(prev => ({ 
            ...prev, 
            ...note,
            files: note.files || []
          }));
          console.log('🔄 업데이트된 노트 정보:', note);
          console.log('🔄 첨부 파일 정보:', note.files);
          
          // 키워드 처리 - name -> word 필드 매핑
          if (note.keywords && Array.isArray(note.keywords)) {
            const mappedKeywords = note.keywords.map((kw: any) => ({
              keyword_id: kw.keyword_id,
              word: kw.name || kw.word, // name 필드를 word로 매핑
              source: kw.source || 'ai' // AI 생성 키워드로 기본 설정
            }));
            console.log('🔄 매핑된 키워드 목록:', mappedKeywords);
            setKeywords(mappedKeywords);
          } else {
            console.warn('❌ 키워드 배열이 없음');
            setKeywords([]);
          }
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
    console.log('🔍 현재 상태:', {
      keywords,
      keywordsLength: keywords.length,
      selectedNoteId,
      selected: selected?.title,
      files: selected?.files
    });
  }, [keywords, selectedNoteId, selected]);

  // 키워드 추가
  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      console.log('❌ 키워드가 비어있습니다');
      alert('키워드를 입력해주세요.');
      return;
    }
    
    const cleanedInput = newKeyword.trim();
    if (keywords.some(kw => kw.word === cleanedInput)) {
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
      noteId: selectedNoteId
    });
    
    try {
      const response = await apiClient.post('/keywords', { 
        note_id: selectedNoteId,
        word: cleanedInput
      });
      
      console.log('➕ 키워드 추가 응답 상태:', response.status);
      const result = response.data;
      console.log('➕ 키워드 추가 응답 데이터:', result);
      
      if (response.ok && result.success) {
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

  // 키워드 삭제
  const handleRemoveKeyword = async (idx: number) => {
    const keyword = keywords[idx];
    console.log('🗑️ 키워드 삭제 시도:', { 
      keyword, 
      index: idx, 
      noteId: selectedNoteId
    });
    
    try {
      const deleteUrl = `/keywords/${keyword.keyword_id}?note_id=${selectedNoteId}`;
      console.log('🗑️ 삭제 요청 URL:', deleteUrl);
      
      const response = await apiClient.delete(deleteUrl);
      
      console.log('🗑️ 삭제 응답 상태:', response.status);
      const result = response.data;
      console.log('🗑️ 삭제 응답 데이터:', result);
      
      if (response.ok && result.success) {
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

  // 파일 미리보기 렌더링 - files 배열 사용하도록 수정
  const renderFilePreview = () => {
    if (!selected) return <div className="flex items-center justify-center h-[500px] text-[#374151]">파일을 선택해주세요</div>;

    console.log('🔍 파일 미리보기 렌더링:', {
      files: selected.files,
      filesLength: selected.files?.length
    });

    // files 배열에서 첫 번째 파일 사용 (추후 여러 파일 지원 확장 가능)
    const attachedFiles = selected.files || [];
    
    if (attachedFiles.length === 0) {
      // 첨부 파일이 없으면 텍스트 내용 표시
      return (
        <div className="bg-[#F3F4F6] p-6 rounded-lg max-h-[500px] overflow-auto">
          <pre className="whitespace-pre-wrap text-sm text-[#374151]">
            {selected.content || selected.summary || "내용이 없습니다."}
          </pre>
        </div>
      );
    }

    // 첫 번째 첨부 파일 표시
    const firstFile = attachedFiles[0];
    const fileUrl = firstFile.fileUrl;
    const fileType = firstFile.fileType;

    console.log('🔍 표시할 파일:', {
      fileUrl,
      fileType,
      fileName: firstFile.fileName
    });

    // 이미지 파일 처리
    if (fileType?.startsWith('image')) {
      return (
        <div className="space-y-4">
          <img 
            src={fileUrl} 
            alt={selected.title} 
            className="max-w-full max-h-[500px] mx-auto object-contain rounded-lg" 
            onError={(e) => {
              console.error('이미지 로드 실패:', fileUrl);
              e.currentTarget.style.display = 'none';
            }}
          />
          {attachedFiles.length > 1 && (
            <div className="text-sm text-[#9CA3AF] text-center">
              총 {attachedFiles.length}개의 파일이 첨부되어 있습니다.
            </div>
          )}
        </div>
      );
    }
    
    // PDF 파일 처리 - 새 탭으로 열기만 가능 (다운로드 버튼 제거)
    if (fileType === 'pdf' || fileType === 'application/pdf') {
      return (
        <div className="space-y-4">
          <div className="bg-[#F3F4F6] p-8 rounded-lg text-center">
            <div className="space-y-4">
              <div className="text-6xl">📄</div>
              <div>
                <h3 className="text-lg font-semibold text-[#374151] mb-2">PDF 파일</h3>
                <p className="text-sm text-[#9CA3AF] mb-4">{firstFile.fileName}</p>
              </div>
              <div>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-[#FACC15] text-[#000000] rounded-lg hover:bg-[#F59E0B] transition-colors font-semibold"
                >
                  📖 새 탭에서 보기
                </a>
              </div>
            </div>
          </div>
          {attachedFiles.length > 1 && (
            <div className="text-sm text-[#9CA3AF] text-center">
              총 {attachedFiles.length}개의 파일이 첨부되어 있습니다.
            </div>
          )}
        </div>
      );
    }
    
    // 기타 파일 타입 - 다운로드 링크와 함께 텍스트 내용 표시
    return (
      <div className="space-y-4">
        <div className="bg-[#F3F4F6] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-[#374151]">첨부 파일:</span>
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#FACC15] hover:text-[#F59E0B] text-sm underline"
            >
              {firstFile.fileName}
            </a>
          </div>
          {attachedFiles.length > 1 && (
            <div className="text-sm text-[#9CA3AF]">
              총 {attachedFiles.length}개의 파일이 첨부되어 있습니다.
            </div>
          )}
        </div>
        <div className="bg-[#F3F4F6] p-6 rounded-lg max-h-[500px] overflow-auto">
          <pre className="whitespace-pre-wrap text-sm text-[#374151]">
            {selected.content || selected.summary || "내용이 없습니다."}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="flex max-w-6xl mx-auto px-6 py-8 gap-8 bg-[#FFFFFF] h-screen">
      {/* 왼쪽: 내 자료 리스트 - 스크롤 가능하도록 수정 */}
      <aside className="w-1/4 space-y-4 flex flex-col h-full">
        <h2 className="text-lg font-bold mb-2 text-[#000000] flex-shrink-0">내 자료</h2>
        
        {/* 자료 목록 영역 - 높이 고정 및 스크롤 추가 */}
        <div className="flex-1 overflow-y-auto pr-2">
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
        </div>
      </aside>

      {/* 가운데: 파일 미리보기 + 요약본 - 스크롤 가능하도록 수정 */}
      <main className="flex-1 space-y-6 flex flex-col h-full overflow-hidden">
        {/* 파일 미리보기 */}
        <section className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-[#F3F4F6] flex-1 flex flex-col">
          <h2 className="text-lg font-bold mb-4 text-[#000000] flex-shrink-0">파일 미리보기</h2>
          <div className="flex-1 overflow-y-auto">
            {renderFilePreview()}
          </div>
        </section>

        {/* 요약본 */}
        <section className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-[#F3F4F6] flex-shrink-0">
          <h2 className="text-lg font-bold mb-2 text-[#000000]">요약본</h2>
          <div className="max-h-48 overflow-y-auto">
            <pre className="bg-[#FACC15]/10 p-4 rounded-lg whitespace-pre-wrap text-[#374151] border border-[#FACC15]/20">
              {summary || "요약 정보 없음"}
            </pre>
          </div>
        </section>
      </main>

      {/* 오른쪽: 키워드 관리 - 높이 고정 */}
      <aside className="w-1/4 flex flex-col space-y-4 h-full">
        <h2 className="text-lg font-bold text-[#000000] flex-shrink-0">키워드 ({keywords.length}개)</h2>
        
        <div className="bg-[#FFFFFF] p-4 rounded-xl shadow-sm border border-[#F3F4F6] flex-1 flex flex-col">
          {/* 키워드 표시 영역 - 스크롤 가능 */}
          <div className="flex-1 mb-4 overflow-y-auto">
            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, idx) => {
                  console.log('🏷️ 키워드 렌더링:', { word: kw.word, idx, keyword_id: kw.keyword_id, source: kw.source });
                  
                  // AI 생성 키워드와 사용자 추가 키워드 구분
                  const isAI = kw.source === 'ai';
                  const bgColor = isAI ? 'bg-[#FACC15]' : 'bg-[#9CA3AF]';
                  const textColor = isAI ? 'text-[#000000]' : 'text-[#FFFFFF]';
                  const icon = isAI ? '🤖' : '👤';
                  
                  return (
                    <span 
                      key={`${kw.keyword_id}-${idx}`} 
                      className={`${bgColor} ${textColor} px-3 py-1 rounded-full flex items-center gap-2 text-sm whitespace-nowrap`}
                    >
                      <span className="text-xs">{icon}</span>
                      <span className="truncate max-w-[80px]" title={kw.word}>
                        {kw.word}
                      </span>
                      <button
                        onClick={() => handleRemoveKeyword(idx)}
                        className={`${textColor} hover:text-[#F87171] transition-colors flex-shrink-0`}
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
          
          {/* 키워드 추가 영역 - 하단 고정 */}
          <div className="flex-shrink-0 border-t border-[#F3F4F6] pt-4">
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
                className="w-full py-2 rounded-lg bg-[#374151] text-[#FFFFFF] font-medium hover:bg-[#FACC15] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

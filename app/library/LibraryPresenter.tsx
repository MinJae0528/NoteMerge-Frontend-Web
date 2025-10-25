'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LibraryPresenter() {
  const [notes, setNotes] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:3000/api/notes", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        const notesArr = Array.isArray(data?.data?.notes)
          ? data.data.notes
          : [];
        setNotes(notesArr);
      });
  }, []);

  // 노트 삭제 함수
  const handleDeleteNote = async (noteId: number, noteTitle: string, event: React.MouseEvent) => {
    // 버튼 클릭 이벤트가 상위 요소로 전파되지 않도록 중지
    event.stopPropagation();
    
    const confirmed = confirm(`"${noteTitle}" 노트를 정말 삭제하시겠습니까?`);
    if (!confirmed) return;

    try {
      console.log('노트 삭제 시도:', { noteId, noteTitle });
      
      const response = await fetch(`http://localhost:3000/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      console.log('노트 삭제 응답 상태:', response.status);
      const result = await response.json();
      console.log('노트 삭제 응답:', result);

      if (response.ok && result.success) {
        // 성공적으로 삭제되면 목록에서 제거
        setNotes(prevNotes => prevNotes.filter(note => (note.note_id || note.id) !== noteId));
        alert('노트가 삭제되었습니다.');
        console.log('✅ 노트 삭제 성공');
      } else {
        console.error('❌ 노트 삭제 실패:', result);
        alert(`노트 삭제 실패: ${result.message || result.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('❌ 노트 삭제 네트워크 오류:', error);
      alert('노트 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="text-lg font-bold mb-4 text-[#000000]">내 자료</h2>
      <ul className="space-y-2">
        {notes.map((note) => {
          const noteId = note.note_id || note.id;
          const noteTitle = note.title || note.name;
          
          return (
            <li key={noteId}>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F3F4F6] hover:bg-[#FACC15]/10 transition-colors">
                {/* 노트 제목 클릭 영역 */}
                <button
                  className="flex-1 text-left font-medium text-[#000000] hover:text-[#374151] transition-colors"
                  onClick={() => router.push(`/library/${noteId}`)}
                >
                  {noteTitle}
                </button>
                
                {/* 삭제 버튼 - 프로젝트 테마에 맞춰 색상 변경 */}
                <button
                  onClick={(e) => handleDeleteNote(noteId, noteTitle, e)}
                  className="px-3 py-1 text-sm bg-[#9CA3AF] text-[#FFFFFF] rounded hover:bg-[#F87171] transition-colors font-medium"
                  title="노트 삭제"
                >
                  🗑️ 삭제
                </button>
              </div>
            </li>
          );
        })}
        {notes.length === 0 && (
          <li className="text-[#9CA3AF] text-center py-8">
            노트가 없습니다.
          </li>
        )}
      </ul>
    </main>
  );
}

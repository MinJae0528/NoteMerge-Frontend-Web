'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserInfo {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
}

interface UserStats {
  totalNotes: number;
  totalQuizzes: number;
}

export default function MyInfoPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // 사용자 정보와 통계 조회
    Promise.all([
      fetchUserInfo(token),
      fetchUserStats(token)
    ]).finally(() => {
      setLoading(false);
    });
  }, [router]);

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('사용자 정보:', data);
        
        // 응답 구조에 맞춰 데이터 추출
        if (data.success && data.data && data.data.user) {
          setUserInfo(data.data.user);
        } else if (data.success && data.data) {
          setUserInfo(data.data);
        } else if (data.user) {
          setUserInfo(data.user);
        } else if (data.username) {
          setUserInfo(data);
        } else {
          console.error('예상하지 못한 응답 구조:', data);
          setError('사용자 정보 형식이 올바르지 않습니다.');
        }
      } else {
        console.error('사용자 정보 조회 실패:', response.status);
        setError('사용자 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  const fetchUserStats = async (token: string) => {
    try {
      // 노트 목록 조회
      const notesResponse = await fetch('http://localhost:3000/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // 퀴즈 목록 조회
      const quizzesResponse = await fetch('http://localhost:3000/api/quizzes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let totalNotes = 0;
      let totalQuizzes = 0;

      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        const notes = notesData.data?.notes || notesData.notes || notesData.data || [];
        totalNotes = Array.isArray(notes) ? notes.length : 0;
      }

      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        const quizzes = quizzesData.data?.quizzes || quizzesData.quizzes || quizzesData.data || [];
        totalQuizzes = Array.isArray(quizzes) ? quizzes.length : 0;
      }

      setUserStats({
        totalNotes,
        totalQuizzes
      });
    } catch (error) {
      console.error('사용자 통계 조회 오류:', error);
      // 에러 발생 시 기본값 설정
      setUserStats({
        totalNotes: 0,
        totalQuizzes: 0
      });
    }
  };

  const handleLogout = () => {
    if (confirm('로그아웃하시겠습니까?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#374151]">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-[#374151] mb-2">오류가 발생했습니다</h2>
          <p className="text-[#9CA3AF] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#FACC15] text-[#000000] rounded-lg hover:bg-[#F59E0B] transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#000000] mb-2">내 정보</h1>
          <p className="text-[#9CA3AF]">계정 정보와 활동 현황을 확인하세요</p>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="space-y-8">
          {/* 사용자 정보 카드 */}
          <div className="bg-[#FFFFFF] p-8 rounded-xl shadow-sm border border-[#F3F4F6]">
            <h2 className="text-xl font-semibold text-[#000000] mb-6 flex items-center gap-2">
              👤 기본 정보
            </h2>
            
            {userInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#9CA3AF]">
                    사용자명
                  </label>
                  <div className="text-lg font-semibold text-[#000000]">
                    {userInfo.username}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#9CA3AF]">
                    이메일
                  </label>
                  <div className="text-lg font-semibold text-[#000000]">
                    {userInfo.email}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#9CA3AF]">
                    가입일
                  </label>
                  <div className="text-lg font-semibold text-[#000000]">
                    {new Date(userInfo.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[#9CA3AF]">
                사용자 정보를 불러올 수 없습니다.
              </div>
            )}
          </div>

          {/* 활동 통계 카드 */}
          <div className="bg-[#FFFFFF] p-8 rounded-xl shadow-sm border border-[#F3F4F6]">
            <h2 className="text-xl font-semibold text-[#000000] mb-6 flex items-center gap-2">
              📊 활동 현황
            </h2>
            
            {userStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-[#FACC15]/10 to-[#F59E0B]/10 rounded-xl border border-[#FACC15]/20">
                  <div className="text-4xl font-bold text-[#F59E0B] mb-2">
                    {userStats.totalNotes}
                  </div>
                  <div className="text-base font-medium text-[#374151] mb-1">생성한 노트</div>
                  <div className="text-sm text-[#9CA3AF]">총 노트 개수</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {userStats.totalQuizzes}
                  </div>
                  <div className="text-base font-medium text-[#374151] mb-1">생성한 퀴즈</div>
                  <div className="text-sm text-[#9CA3AF]">총 퀴즈 개수</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[#9CA3AF]">
                활동 통계를 불러오는 중...
              </div>
            )}
          </div>

          {/* 로그아웃 버튼 */}
          <div className="bg-[#FFFFFF] p-8 rounded-xl shadow-sm border border-[#F3F4F6]">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-[#000000] mb-2">계정 관리</h2>
                <p className="text-[#9CA3AF] text-sm">계정에서 로그아웃할 수 있습니다</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors font-medium flex items-center gap-2"
              >
                <span>🚪</span>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
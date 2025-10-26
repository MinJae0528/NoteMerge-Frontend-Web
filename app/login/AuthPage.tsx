'use client';

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AuthPage({ mode = "login" }) {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(mode === "login");
  
  // AuthContext 사용
  const { isLoggedIn, login, logout } = useAuth();

  // 이미 로그인된 상태라면 즉시 홈으로 리디렉션
  useEffect(() => {
    if (isLoggedIn) {
      window.location.href = "/";
    }
  }, [isLoggedIn]);

  // 입력값 검증 함수
  const validateInput = () => {
    if (!isLogin) {
      // 닉네임 검증 (백엔드와 동일하게)
      if (!nickname.trim()) {
        setMessage("닉네임을 입력해주세요.");
        return false;
      }
      if (nickname.length < 3 || nickname.length > 30) {
        setMessage("닉네임은 3-30자여야 합니다.");
        return false;
      }
      if (!/^[a-zA-Z0-9]+$/.test(nickname)) {
        setMessage("닉네임은 영문자와 숫자만 사용 가능합니다.");
        return false;
      }
      
      // 비밀번호 검증
      if (password.length < 6 || password.length > 100) {
        setMessage("비밀번호는 6-100자여야 합니다.");
        return false;
      }
      
      if (password !== confirmPassword) {
        setMessage("비밀번호가 일치하지 않습니다.");
        return false;
      }
    }
    
    // 이메일 기본 검증 (브라우저 기본 + 추가)
    if (!email.includes('@')) {
      setMessage("올바른 이메일 형식을 입력해주세요.");
      return false;
    }
    
    return true;
  };

  // 로그인/회원가입 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // 입력값 검증
    if (!validateInput()) {
      setLoading(false);
      return;
    }

    // 요청 데이터 준비
    const requestData = isLogin
      ? { username: email, password } // 로그인 시 email을 username으로 전송 (백엔드 로직에 맞게)
      : { username: nickname, email, password }; // 회원가입 시

    const endpoint = isLogin
      ? "http://localhost:3000/api/auth/login"
      : "http://localhost:3000/api/auth/register";

    console.log('🔍 요청 시작:', {
      endpoint,
      isLogin,
      requestData: { ...requestData, password: '***' } // 비밀번호 숨김
    });

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // CORS 헤더 추가 (필요한 경우)
          "Accept": "application/json"
        },
        body: JSON.stringify(requestData),
      });

      console.log('🔍 응답 상태:', res.status, res.statusText);
      
      // 응답이 JSON이 아닐 수 있으므로 확인
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error('❌ 응답이 JSON이 아님:', contentType);
        setMessage("서버 응답 형식 오류입니다.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log('🔍 응답 데이터:', data);

      if (data.success) {
        // 토큰 경로 확인 (data.data.token 또는 data.token)
        const token = data.data?.token || data.token;
        console.log('✅ 토큰 받음:', token ? '있음' : '없음');
        
        if (token) {
          login(token);
          setMessage(isLogin ? "로그인 성공!" : "회원가입 성공!");
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        } else {
          console.error('❌ 토큰이 없음:', data);
          setMessage("토큰을 받지 못했습니다.");
        }
      } else {
        console.error('❌ 요청 실패:', data);
        setMessage(data.message || data.error || "요청이 실패했습니다.");
      }
    } catch (error) {
      console.error('❌ 네트워크 오류:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setMessage("서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
      } else {
        setMessage("네트워크 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 처리 - 바로 로그아웃하고 현재 페이지 새로고침
  const handleLogout = () => {
    logout();
    setMessage("로그아웃 되었습니다.");
    // 페이지 새로고침으로 로그인 폼 표시
    window.location.reload();
  };

  // 로그인된 상태에서는 아무것도 렌더링하지 않음 (리디렉션 중)
  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-lg font-semibold text-[#374151] mb-2">홈으로 이동 중...</div>
          <div className="w-8 h-8 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#F3F4F6] p-8 rounded-xl shadow-lg space-y-6"
      >
        {/* 로고 */}
        <div className="flex justify-center mb-6">
          <img src="/Images/notemerge_logo.png" alt="Notemerge Logo" className="h-12" />
        </div>

        {/* 회원가입 시 닉네임 입력 */}
        {!isLogin && (
          <div>
            <label className="block text-sm text-[#374151] mb-1">
              닉네임 <span className="text-[#9CA3AF]">(3-30자, 영문자/숫자만)</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border border-[#9CA3AF] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              placeholder="닉네임을 입력하세요"
              pattern="[a-zA-Z0-9]{3,30}"
              required
            />
          </div>
        )}

        {/* 이메일 입력 */}
        <div>
          <label className="block text-sm text-[#374151] mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#9CA3AF] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            placeholder="이메일을 입력하세요"
            required
          />
        </div>

        {/* 비밀번호 입력 */}
        <div>
          <label className="block text-sm text-[#374151] mb-1">
            비밀번호 {!isLogin && <span className="text-[#9CA3AF]">(6자 이상)</span>}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#9CA3AF] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            placeholder="비밀번호를 입력하세요"
            minLength={6}
            required
          />
        </div>

        {/* 회원가입 시 비밀번호 확인 */}
        {!isLogin && (
          <div>
            <label className="block text-sm text-[#374151] mb-1">비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-[#9CA3AF] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>
        )}

        {/* 버튼 */}
        <button
          type="submit"
          className="w-full bg-[#FACC15] text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading
            ? isLogin
              ? "로그인 중..."
              : "회원가입 중..."
            : isLogin
            ? "로그인"
            : "회원가입"}
        </button>

        {/* 메시지 */}
        {message && (
          <div className={`text-center text-sm ${
            message.includes('성공') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </div>
        )}

        {/* 모드 전환 */}
        <p className="text-center text-sm text-[#374151]">
          {isLogin ? (
            <>
              계정이 없으신가요?{" "}
              <button
                type="button"
                className="text-[#FACC15] font-medium underline"
                onClick={() => {
                  setIsLogin(false);
                  setMessage("");
                  setPassword("");
                  setConfirmPassword("");
                  setNickname("");
                }}
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{" "}
              <button
                type="button"
                className="text-[#FACC15] font-medium underline"
                onClick={() => {
                  setIsLogin(true);
                  setMessage("");
                  setPassword("");
                  setConfirmPassword("");
                }}
              >
                로그인
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

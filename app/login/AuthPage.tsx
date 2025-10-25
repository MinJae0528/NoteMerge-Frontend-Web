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

  // 로그인/회원가입 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        isLogin
          ? "http://localhost:3000/api/auth/login"
          : "http://localhost:3000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isLogin
              ? { username: email, password }
              : { username: nickname, email, password }
          ),
        }
      );
      const data = await res.json();
      if (data.success) {
        // AuthContext의 login 함수에 토큰 전달 후 바로 홈으로 이동
        login(data.data.token);
        setMessage(isLogin ? "로그인 성공!" : "회원가입 성공!");
        // setTimeout 제거하고 바로 이동
        window.location.href = "/";
      } else {
        setMessage(data.message || "오류가 발생했습니다.");
      }
    } catch {
      setMessage("네트워크 오류가 발생했습니다.");
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
            <label className="block text-sm text-[#374151] mb-1">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border border-[#9CA3AF] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              placeholder="닉네임을 입력하세요"
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
          <label className="block text-sm text-[#374151] mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#9CA3AF] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            placeholder="비밀번호를 입력하세요"
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
          className="w-full bg-[#FACC15] text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition"
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
          <div className="text-center text-sm text-red-600">{message}</div>
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

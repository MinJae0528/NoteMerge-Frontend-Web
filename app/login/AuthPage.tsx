import { useState } from "react";

export default function AuthPage({ mode = "login" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-[#F3F4F6] p-8 rounded-xl shadow-lg space-y-6">
        {/* 로고 */}
        <div className="flex justify-center mb-6">
          <img src="/Images/notemerge_logo.png" alt="Notemerge Logo" className="h-12" />
        </div>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-center text-black">
          {isLogin ? "로그인" : "회원가입"}
        </h2>

        {/* 이메일 입력 */}
        <div>
          <label className="block text-sm text-[#374151] mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#9CA3AF] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            placeholder="이메일을 입력하세요"
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
            />
          </div>
        )}

        {/* 버튼 */}
        <button className="w-full bg-[#FACC15] text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition">
          {isLogin ? "로그인" : "회원가입"}
        </button>

        {/* 모드 전환 */}
        <p className="text-center text-sm text-[#374151]">
          {isLogin ? (
            <>
              계정이 없으신가요?{" "}
              <a href="/signup" className="text-[#FACC15] font-medium">
                회원가입
              </a>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{" "}
              <a href="/login" className="text-[#FACC15] font-medium">
                로그인
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

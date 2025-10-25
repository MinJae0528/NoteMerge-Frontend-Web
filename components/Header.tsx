"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  // 로그인 페이지 이동
  const handleLogin = () => {
    router.push("/login");
  };

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/Images/notemerge_logo.png" alt="NoteMerge Logo" className="h-8" />
        </Link>

        {/* 중앙 탭 */}
        <nav className="ml-6 flex gap-2">
          <NavButton to="/editor" label="자료 생성" />
          <NavButton to="/quiz" label="퀴즈" />
          <NavButton to="/library" label="자료 모아보기" />
          <NavButton to="/guide" label="서비스 설명" />
        </nav>

        {/* 로그인/로그아웃 */}
        <div className="ml-auto flex gap-3">
          {isLoggedIn ? (
            <>
              <NavButton to="/myinfo" label="내 정보" />
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm text-red-500 hover:bg-gray-100"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="px-3 py-2 rounded-md text-sm text-blue-500 hover:bg-gray-100"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavButton({ to, label }: { to: string; label: string }) {
  return (
    <Link href={to} className="px-3 py-2 rounded-md text-sm hover:bg-gray-100">
      {label}
    </Link>
  );
}

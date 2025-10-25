'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [pathname]);

  // 로그인 안 된 경우 로그인 페이지로 이동 (렌더링 중이 아닌 useEffect에서 처리)
  useEffect(() => {
    if (
      isLoggedIn === false &&
      pathname !== "/login" &&
      pathname !== "/signup"
    ) {
      router.replace("/login");
    }
  }, [isLoggedIn, pathname, router]);

  if (pathname === "/login" || pathname === "/signup") {
    return <>{children}</>;
  }

  if (isLoggedIn === false) {
    // 이동 중에는 아무것도 렌더링하지 않음
    return null;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  login: (token: string) => void;  // 토큰을 받도록 수정
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 새로고침 시에도 localStorage의 token을 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        // 토큰 유효성 간단 체크 (만료 시간 확인 등)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp && payload.exp > currentTime) {
            setIsLoggedIn(true);
          } else {
            // 토큰 만료됨
            console.log('🔒 만료된 토큰 감지, 자동 제거');
            localStorage.removeItem("token");
            setIsLoggedIn(false);
          }
        } catch (error) {
          // 토큰 파싱 실패 시 제거
          console.log('🔒 유효하지 않은 토큰 감지, 자동 제거');
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }
      }
    }
  }, []);

  const login = (token: string) => {  // 토큰을 받아서 저장
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

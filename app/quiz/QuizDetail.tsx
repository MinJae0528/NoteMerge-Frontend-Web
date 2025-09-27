// 퀴즈 풀이 화면
import { useParams } from "next/navigation";
import { useState } from "react";

export default function QuizDetail() {
  const params = useParams();
  const id = params?.id;
  const [answer, setAnswer] = useState("");

  // 임시 퀴즈 데이터
  const question = `퀴즈 ${id}번 문제: React에서 상태를 관리하는 Hook은?`;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">퀴즈 풀이</h1>
      <p className="mt-3">{question}</p>
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="mt-3 px-3 py-2 border rounded-md w-full"
        placeholder="정답을 입력하세요"
      />
      <button className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-md">
        제출
      </button>
    </div>
  );
}

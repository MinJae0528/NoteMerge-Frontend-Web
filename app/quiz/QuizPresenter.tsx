'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

export default function QuizPresenter() {
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/quizzes", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setQuizzes(data.data || []));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h2 className="text-xl font-bold mb-4">퀴즈</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <Link
            key={quiz.id}
            href={`/quiz/${quiz.id}`}
            className="p-4 bg-white rounded-xl shadow hover:bg-gray-50 block"
          >
            {quiz.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

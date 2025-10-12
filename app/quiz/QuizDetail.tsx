'use client';
import { useEffect, useState } from "react";

export default function QuizDetail({ quizId }: { quizId: number }) {
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/quizzes/${quizId}?include_questions=true`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setQuiz(data.data));
  }, [quizId]);

  const handleChange = (qid: string, value: string) => {
    setAnswers({ ...answers, [qid]: value });
  };

  const handleSubmit = async () => {
    const res = await fetch(`http://localhost:3000/api/quizzes/${quizId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ answers })
    });
    const data = await res.json();
    setResult(data.data);
    setSubmitted(true);
  };

  if (!quiz) return <div>로딩 중...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <h2 className="text-xl font-bold mb-4">{quiz.title}</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-6"
      >
        {quiz.questions?.map((q: any, idx: number) => (
          <div key={q.id} className="bg-white p-4 rounded-xl shadow space-y-2">
            <div className="font-semibold">{idx + 1}. {q.question}</div>
            <input
              className="border rounded px-2 py-1 w-full"
              value={answers[q.id] || ""}
              onChange={e => handleChange(q.id, e.target.value)}
              disabled={submitted}
              required
            />
          </div>
        ))}
        {!submitted && (
          <button
            type="submit"
            className="px-4 py-2 rounded bg-yellow-500 text-white font-bold"
          >
            제출
          </button>
        )}
      </form>
      {submitted && result && (
        <div className="bg-green-50 p-4 rounded-xl mt-4">
          <div className="font-bold">채점 결과</div>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
import Link from "next/link";

export default function QuizPresenter() {
  const quizzes = [
    { id: 1, title: "알고리즘 개론 퀴즈" },
    { id: 2, title: "자료구조 복습 퀴즈" },
    { id: 3, title: "네트워크 기본 퀴즈" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h2 className="text-xl font-bold mb-4">퀴즈</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <Link
            key={quiz.id}
            href={`/quiz/${quiz.id}`}
            className="p-4 bg-white rounded-xl shadow hover:bg-gray-50"
          >
            {quiz.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

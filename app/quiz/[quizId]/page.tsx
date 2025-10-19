import QuizDetail from '../../quiz/QuizDetail';

interface PageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export default async function QuizDetailPage({ params }: PageProps) {
  // Next.js 15에서는 params를 await해야 함
  const resolvedParams = await params;
  const quizId = parseInt(resolvedParams.quizId, 10);
  
  if (isNaN(quizId)) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-[#374151] mb-2">
            잘못된 퀴즈 ID입니다
          </h3>
        </div>
      </div>
    );
  }
  
  return <QuizDetail quizId={quizId} />;
}
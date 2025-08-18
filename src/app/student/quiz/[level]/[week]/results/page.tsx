import { QuizResultsPageContent } from "@/components/quiz/QuizResultPageContent";
import { RouteProtection } from "@/components/quiz/RouteProtection";

interface QuizResultsPageProps {
  params: {
    level: string;
    week: string;
  };
}

export default async function QuizResultsPage({ params }: QuizResultsPageProps) {
  const resolvedParams = await params
  const level = parseInt(decodeURIComponent(resolvedParams.level as string));

  return (
    <RouteProtection level={level}>
      <QuizResultsPageContent paramsData={resolvedParams} />
    </RouteProtection>
  );
}
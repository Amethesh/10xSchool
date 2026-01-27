import DashboardClient from "./DashboardClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const params = await searchParams;
  
  return <DashboardClient studentId={params.studentId} />;
}


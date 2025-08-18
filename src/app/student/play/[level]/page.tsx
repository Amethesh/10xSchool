import PlayLevelClient from "@/components/student/PlayLevelClient";
import React from "react";

interface PageProps {
  params: Promise<{ level: string }>;
}

export default async function Page({ params }: PageProps) {
  const { level } = await params;
  return <PlayLevelClient level={level} />;
}

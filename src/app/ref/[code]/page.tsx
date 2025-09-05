"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RefPageProps {
  params: {
    code: string;
  };
}

export default function RefPage({ params }: RefPageProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the tracking API
    const trackingUrl = `/api/track-affiliate?ref=${params.code}&redirect=/`;
    window.location.href = trackingUrl;
  }, [params.code]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

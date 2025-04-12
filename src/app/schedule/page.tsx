'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ScheduleRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/schedules');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent"></div>
        <p className="mt-2 text-black">Redirecting to schedules page...</p>
      </div>
    </div>
  );
} 
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - RailYatra',
  description: 'Administration and analytics dashboard for RailYatra',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 
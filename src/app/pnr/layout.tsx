import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNR Status - RailYatra',
  description: 'Check your train ticket PNR status and get all passenger information.',
};

export default function PnrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
} 
'use client';

import { formatRunDays } from '@/lib/utils';

interface TrainRunDaysDisplayProps {
  runDays?: string;
  className?: string;
}

export default function TrainRunDaysDisplay({ runDays, className = '' }: TrainRunDaysDisplayProps) {
  // Format the run days for display
  const formattedRunDays = formatRunDays(runDays || '');
  
  // Check if it's "Daily"
  if (formattedRunDays.toLowerCase() === 'daily') {
    return (
      <div className={`flex items-center ${className}`}>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
          Runs Daily
        </span>
      </div>
    );
  }
  
  // Create an array of days
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="text-xs text-gray-500 mb-1">Runs on:</div>
      <div className="flex space-x-1">
        {daysOfWeek.map((day) => {
          const isRunningDay = formattedRunDays.includes(day);
          return (
            <div 
              key={day}
              className={`
                w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium
                ${isRunningDay 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-gray-100 text-gray-400 border border-gray-200'}
              `}
            >
              {day.charAt(0)}
            </div>
          );
        })}
      </div>
    </div>
  );
} 
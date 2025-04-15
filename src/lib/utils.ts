/**
 * Utility functions for the application
 */

/**
 * Formats a run_days string to a readable format
 * @param runDays Run days string (e.g., "Mon,Wed,Fri" or "Daily")
 */
export function formatRunDays(runDays: string): string {
  if (!runDays) return 'Not available';
  
  // If it's already in "Daily" format or similar, return as is
  if (runDays.toLowerCase() === 'daily') return 'Daily';
  
  // Check for comma-separated format like "Mon,Wed,Fri"
  if (runDays.includes(',')) {
    return runDays; // Already in readable format
  }
  
  // Map day numbers to names (if used in number format like "1,3,5")
  const dayMap: { [key: string]: string } = {
    '1': 'Mon',
    '2': 'Tue',
    '3': 'Wed',
    '4': 'Thu',
    '5': 'Fri',
    '6': 'Sat',
    '7': 'Sun'
  };
  
  // Try to interpret as a series of day numbers
  try {
    // Split by comma if present, otherwise treat each character as a day number
    const days = runDays.includes(',') ? runDays.split(',') : runDays.split('');
    
    // Replace numbers with day names
    const formattedDays = days.map(d => {
      const trimmed = d.trim();
      return dayMap[trimmed] || trimmed;
    });
    
    return formattedDays.join(', ');
  } catch (e) {
    // If any error in parsing, return the original string
    return runDays;
  }
}

/**
 * Checks if a train runs on a specific date based on its run_days
 * @param runDays Run days string (e.g., "Mon,Wed,Fri" or "Daily")
 * @param date The date to check
 * @returns boolean indicating if the train runs on the date
 */
export function trainRunsOnDate(runDays: string | undefined, date: Date): boolean {
  if (!runDays) return false;
  
  // If train runs daily, it runs on all days
  if (runDays.toLowerCase() === 'daily') return true;
  
  // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = date.getDay();
  
  // Map day number to day name
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[dayOfWeek];
  
  // Check if the day name is in the run_days string
  return runDays.includes(dayName);
}

/**
 * Filter trains based on whether they run on a specific date
 * @param trains Array of train objects with run_days property
 * @param date The date to check
 * @returns Filtered array of trains that run on the date
 */
export function filterTrainsByRunDay(trains: any[], date: Date): any[] {
  if (!trains || !date) return [];
  
  return trains.filter(train => {
    // If run_days is missing, undefined, or "Daily", the train runs every day
    if (!train.run_days || train.run_days.toLowerCase() === 'daily') {
      console.log(`Train ${train.train_name} (${train.train_id}) runs daily - including in results`);
      return true;
    }
    
    // Get the day of week
    const dayOfWeek = date.getDay();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[dayOfWeek];
    
    // Check if train runs on this day
    const runsOnDay = train.run_days.includes(dayName);
    console.log(`Train ${train.train_name} (${train.train_id}) runs on [${train.run_days}], today is ${dayName}: ${runsOnDay ? 'YES' : 'NO'}`);
    
    return runsOnDay;
  });
}

/**
 * Checks if a date is in the future
 * @param date The date to check
 * @returns boolean indicating if the date is in the future
 */
export function isDateInFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to beginning of day for comparison
  return date >= today;
} 
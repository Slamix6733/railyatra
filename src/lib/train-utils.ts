import { TrainClassResponse } from './train-class-model';

/**
 * Fetches detailed class-wise data for a specific train
 * 
 * @param trainId - The ID of the train
 * @param scheduleId - Optional schedule ID to get availability for a specific schedule
 * @param date - Optional journey date (alternative to scheduleId) to get availability for a specific date
 * @returns Promise with train class details
 */
export async function getTrainClassDetails(
  trainId: number | string, 
  scheduleId?: number | string,
  date?: string
): Promise<TrainClassResponse> {
  try {
    // Build query params
    const params = new URLSearchParams();
    params.append('trainId', trainId.toString());
    
    if (scheduleId) {
      params.append('scheduleId', scheduleId.toString());
    }
    
    if (date) {
      params.append('date', date);
    }
    
    // Make API request
    const response = await fetch(`/api/trains/class-details?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || `Error ${response.status}: ${response.statusText}`
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching train class details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 
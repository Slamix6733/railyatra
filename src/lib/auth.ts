import { verify } from 'jsonwebtoken';
import { query } from './db';
import { getCookie } from 'cookies-next';

export interface User {
  passenger_id: number;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  contact_number?: string;
  address?: string | null;
}

export async function getCurrentUser(req?: any, res?: any): Promise<User | null> {
  try {
    // Get token from cookies using cookies-next
    const token = getCookie('auth_token', { req, res });
    
    if (!token) {
      return null;
    }
    
    // Verify and decode the token
    const decoded = verify(token.toString(), process.env.JWT_SECRET || 'fallback_secret') as any;
    
    // Get the user from the database
    const users = await query(
      'SELECT passenger_id, name, email, age, gender, contact_number, address FROM PASSENGER WHERE passenger_id = ?',
      [decoded.id]
    );
    
    if (!Array.isArray(users) || users.length === 0) {
      return null;
    }
    
    return users[0] as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
} 
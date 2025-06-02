import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is not defined. Please check your Supabase integration.');
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not defined. Please check your Supabase integration.');
}

// Create Supabase client - it will work if properly configured
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

export type Student = {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  course: string;
  department: string;
  academic_year: string;
  created_at: string;
  updated_at: string;
};

export type AttendanceRecord = {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: 'checked_in' | 'completed' | 'absent';
  biometric_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type ExamEligibility = {
  id: string;
  student_id: string;
  class_id: string;
  quarter: number;
  year: number;
  total_classes: number;
  attended_classes: number;
  attendance_percentage: number;
  is_eligible: boolean;
  calculated_at: string;
};

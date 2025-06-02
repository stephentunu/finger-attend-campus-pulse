
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface StudentRegistrationData {
  email: string;
  password: string;
  full_name: string;
  student_id: string;
  course: string;
  department: string;
  academic_year: string;
}

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && url !== 'https://placeholder.supabase.co';
};

export const authService = {
  async registerStudent(data: StudentRegistrationData) {
    if (!isSupabaseConfigured()) {
      console.error('Supabase is not properly configured');
      return { data: null, error: new Error('Database not configured') };
    }

    try {
      // Register user in auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create student profile
        const { error: profileError } = await supabase
          .from('students')
          .insert({
            id: authData.user.id,
            student_id: data.student_id,
            full_name: data.full_name,
            email: data.email,
            course: data.course,
            department: data.department,
            academic_year: data.academic_year,
          });

        if (profileError) throw profileError;
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { data: null, error };
    }
  },

  async loginStudent(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      console.error('Supabase is not properly configured');
      return { data: null, error: new Error('Database not configured') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch student profile
      if (data.user) {
        const { data: studentData, error: profileError } = await supabase
          .from('students')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        return { data: { ...data, student: studentData }, error: null };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error };
    }
  },

  async logout() {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Database not configured') };
    }

    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
    return { error };
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured()) {
      return { user: null, student: null };
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single();

      return { user, student: studentData };
    }

    return { user: null, student: null };
  }
};

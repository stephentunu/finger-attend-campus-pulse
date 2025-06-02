
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
  console.log('Checking Supabase config:', { 
    url: !!url, 
    key: !!key, 
    urlValue: url,
    keyValue: key ? 'present' : 'missing'
  });
  
  // Check if we have actual values (not undefined and not placeholders)
  const hasValidUrl = url && url !== 'https://placeholder.supabase.co' && url !== 'undefined';
  const hasValidKey = key && key !== 'placeholder-key' && key !== 'undefined';
  
  console.log('Supabase validation:', { hasValidUrl, hasValidKey });
  return hasValidUrl && hasValidKey;
};

export const authService = {
  async registerStudent(data: StudentRegistrationData) {
    console.log('Starting registration process...');
    
    if (!isSupabaseConfigured()) {
      console.error('Supabase is not properly configured');
      
      // For demo purposes, simulate successful registration
      console.log('Using demo mode for registration');
      
      // Store user data in localStorage for demo
      const demoUser = {
        id: `demo_${Date.now()}`,
        email: data.email,
        full_name: data.full_name,
        student_id: data.student_id,
        course: data.course,
        department: data.department,
        academic_year: data.academic_year,
        role: 'student'
      };
      
      // Get existing demo users or create empty array
      const existingUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
      
      // Check if user already exists
      const userExists = existingUsers.find((user: any) => user.email === data.email);
      if (userExists) {
        toast.error('User with this email already exists');
        return { data: null, error: new Error('User already exists') };
      }
      
      // Add new user
      existingUsers.push(demoUser);
      localStorage.setItem('demoUsers', JSON.stringify(existingUsers));
      
      toast.success('Demo account created successfully! (Supabase not connected)');
      return { 
        data: { 
          user: demoUser,
          student: demoUser 
        }, 
        error: null 
      };
    }

    try {
      console.log('Attempting to register user:', data.email);
      
      // Register user in auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('Auth error during registration:', authError);
        toast.error(`Registration failed: ${authError.message}`);
        throw authError;
      }

      console.log('User registered successfully:', authData.user?.id);

      if (authData.user) {
        console.log('Creating student profile...');
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

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error(`Profile creation failed: ${profileError.message}`);
          throw profileError;
        }
        
        console.log('Student profile created successfully');
      }

      return { data: authData, error: null };
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return { data: null, error };
    }
  },

  async loginStudent(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      console.error('Supabase is not properly configured - using demo mode');
      
      // For demo purposes, check localStorage
      const existingUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
      const user = existingUsers.find((user: any) => user.email === email);
      
      if (user) {
        toast.success(`Welcome back, ${user.full_name}! (Demo mode)`);
        return { 
          data: { 
            user: user,
            student: user 
          }, 
          error: null 
        };
      } else {
        toast.error('Invalid credentials or user not found in demo mode');
        return { data: null, error: new Error('Invalid credentials') };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(`Login failed: ${error.message}`);
        throw error;
      }

      // Fetch student profile
      if (data.user) {
        const { data: studentData, error: profileError } = await supabase
          .from('students')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          toast.error(`Profile fetch failed: ${profileError.message}`);
          throw profileError;
        }

        return { data: { ...data, student: studentData }, error: null };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return { data: null, error };
    }
  },

  async logout() {
    if (!isSupabaseConfigured()) {
      // Clear demo session
      localStorage.removeItem('currentDemoUser');
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      toast.error(`Logout failed: ${error.message}`);
    }
    return { error };
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured()) {
      // Check for demo user session
      const currentUser = localStorage.getItem('currentDemoUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        return { user, student: user };
      }
      return { user: null, student: null };
    }

    try {
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
    } catch (error) {
      console.error('Get user error:', error);
      return { user: null, student: null };
    }
  }
};

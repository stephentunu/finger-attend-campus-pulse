
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const attendanceService = {
  async checkIn(studentId: string, classId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('attendance_records')
        .upsert({
          student_id: studentId,
          class_id: classId,
          date: today,
          check_in_time: now,
          status: 'checked_in',
          biometric_verified: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Check-in successful!');
      return { data, error: null };
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Check-in failed. Please try again.');
      return { data: null, error };
    }
  },

  async checkOut(studentId: string, classId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          check_out_time: now,
          status: 'completed',
        })
        .eq('student_id', studentId)
        .eq('class_id', classId)
        .eq('date', today)
        .select()
        .single();

      if (error) throw error;

      // Calculate exam eligibility after checkout
      await this.calculateEligibility(studentId, classId);

      toast.success('Check-out successful! Attendance marked.');
      return { data, error: null };
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error('Check-out failed. Please try again.');
      return { data: null, error };
    }
  },

  async getTodayAttendance(studentId: string, classId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
        .eq('class_id', classId)
        .eq('date', today)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getAttendanceHistory(studentId: string, limit: number = 30) {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get attendance history error:', error);
      return { data: null, error };
    }
  },

  async calculateEligibility(studentId: string, classId: string) {
    try {
      const now = new Date();
      const quarter = Math.ceil((now.getMonth() + 1) / 3);
      const year = now.getFullYear();

      const { data, error } = await supabase.rpc('calculate_exam_eligibility', {
        p_student_id: studentId,
        p_class_id: classId,
        p_quarter: quarter,
        p_year: year,
      });

      return { data, error };
    } catch (error) {
      console.error('Calculate eligibility error:', error);
      return { data: null, error };
    }
  },

  async getEligibilityStatus(studentId: string) {
    try {
      const { data, error } = await supabase
        .from('exam_eligibility')
        .select(`
          *,
          classes:class_id (
            class_name,
            course,
            department
          )
        `)
        .eq('student_id', studentId)
        .order('calculated_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get eligibility status error:', error);
      return { data: null, error };
    }
  }
};

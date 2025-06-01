
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE attendance_status AS ENUM ('checked_in', 'completed', 'absent');

-- Students table (extends auth.users)
CREATE TABLE public.students (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  course VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name VARCHAR(100) NOT NULL,
  course VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance records table
CREATE TABLE public.attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  status attendance_status DEFAULT 'absent',
  biometric_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, class_id, date)
);

-- Exam eligibility table
CREATE TABLE public.exam_eligibility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  quarter INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_classes INTEGER NOT NULL,
  attended_classes INTEGER NOT NULL,
  attendance_percentage DECIMAL(5,2) NOT NULL,
  is_eligible BOOLEAN NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, class_id, quarter, year)
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_eligibility ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
CREATE POLICY "Students can view their own data" ON public.students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update their own data" ON public.students
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for attendance_records
CREATE POLICY "Students can view their own attendance" ON public.attendance_records
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own attendance" ON public.attendance_records
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own attendance" ON public.attendance_records
  FOR UPDATE USING (student_id = auth.uid());

-- RLS Policies for exam_eligibility
CREATE POLICY "Students can view their own eligibility" ON public.exam_eligibility
  FOR SELECT USING (student_id = auth.uid());

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate exam eligibility
CREATE OR REPLACE FUNCTION calculate_exam_eligibility(
  p_student_id UUID,
  p_class_id UUID,
  p_quarter INTEGER,
  p_year INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  total_sessions INTEGER;
  attended_sessions INTEGER;
  attendance_rate DECIMAL;
  is_eligible BOOLEAN;
BEGIN
  -- Get total sessions for the class in the quarter
  SELECT COUNT(*) INTO total_sessions
  FROM attendance_records ar
  WHERE ar.class_id = p_class_id
    AND EXTRACT(QUARTER FROM ar.date) = p_quarter
    AND EXTRACT(YEAR FROM ar.date) = p_year;

  -- Get attended sessions for the student
  SELECT COUNT(*) INTO attended_sessions
  FROM attendance_records ar
  WHERE ar.student_id = p_student_id
    AND ar.class_id = p_class_id
    AND ar.status = 'completed'
    AND EXTRACT(QUARTER FROM ar.date) = p_quarter
    AND EXTRACT(YEAR FROM ar.date) = p_year;

  -- Calculate attendance rate
  IF total_sessions > 0 THEN
    attendance_rate := (attended_sessions::DECIMAL / total_sessions::DECIMAL) * 100;
    is_eligible := attendance_rate >= 33.33;
  ELSE
    attendance_rate := 0;
    is_eligible := false;
  END IF;

  -- Insert or update eligibility record
  INSERT INTO exam_eligibility (
    student_id, class_id, quarter, year, 
    total_classes, attended_classes, attendance_percentage, is_eligible
  )
  VALUES (
    p_student_id, p_class_id, p_quarter, p_year,
    total_sessions, attended_sessions, attendance_rate, is_eligible
  )
  ON CONFLICT (student_id, class_id, quarter, year)
  DO UPDATE SET
    total_classes = EXCLUDED.total_classes,
    attended_classes = EXCLUDED.attended_classes,
    attendance_percentage = EXCLUDED.attendance_percentage,
    is_eligible = EXCLUDED.is_eligible,
    calculated_at = NOW();

  RETURN is_eligible;
END;
$$ LANGUAGE plpgsql;

-- Insert sample class data
INSERT INTO public.classes (class_name, course, department, academic_year, total_sessions)
VALUES 
  ('Computer Science 101', 'Computer Science', 'Engineering', '2024', 45),
  ('Mathematics 201', 'Mathematics', 'Sciences', '2024', 40),
  ('Physics 101', 'Physics', 'Sciences', '2024', 42),
  ('Business Management', 'Business', 'Business', '2024', 38);

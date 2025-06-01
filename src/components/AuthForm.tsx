
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, UserCheck } from "lucide-react";
import { authService, type StudentRegistrationData } from '@/services/authService';

interface AuthFormProps {
  onLogin: (user: any, type: string) => void;
}

const AuthForm = ({ onLogin }: AuthFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    student_id: '',
    course: '',
    department: '',
    academic_year: '2024'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (userType: string) => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      if (userType === 'admin' && formData.email === 'admin@campus.edu' && formData.password === 'admin123') {
        onLogin({ email: formData.email, full_name: 'Admin User', role: 'admin' }, 'admin');
        toast.success("Welcome, Admin!");
        return;
      }

      if (userType === 'student') {
        const { data, error } = await authService.loginStudent(formData.email, formData.password);
        
        if (error) {
          toast.error("Invalid credentials or login failed");
          return;
        }

        if (data?.student) {
          onLogin({ ...data.student, role: 'student' }, 'student');
          toast.success(`Welcome, ${data.student.full_name}!`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.full_name || !formData.student_id || !formData.course || !formData.department) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const registrationData: StudentRegistrationData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        student_id: formData.student_id,
        course: formData.course,
        department: formData.department,
        academic_year: formData.academic_year,
      };

      const { data, error } = await authService.registerStudent(registrationData);

      if (error) {
        toast.error("Registration failed. Please try again.");
        return;
      }

      if (data?.user) {
        // Auto-login after successful registration
        const loginResult = await authService.loginStudent(formData.email, formData.password);
        if (loginResult.data?.student) {
          onLogin({ ...loginResult.data.student, role: 'student' }, 'student');
          toast.success(`Account created successfully! Welcome, ${formData.full_name}!`);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-blue-100">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <User className="h-5 w-5 text-blue-600" />
          <span>Access Portal</span>
        </CardTitle>
        <CardDescription>
          Sign in to your account or create a new student account
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mx-6">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="your.email@campus.edu"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
              <p className="text-xs text-blue-600">Admin: admin@campus.edu / admin123</p>
              <p className="text-xs text-blue-600">Student: Register new account or use existing credentials</p>
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <Button 
              onClick={() => handleLogin('student')} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              {isLoading ? 'Signing In...' : 'Sign In as Student'}
            </Button>
            <Button 
              onClick={() => handleLogin('admin')} 
              variant="outline" 
              className="w-full border-blue-200 hover:bg-blue-50"
              disabled={isLoading}
            >
              Sign In as Admin
            </Button>
          </CardFooter>
        </TabsContent>

        <TabsContent value="register">
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="STU12345"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="john.doe@campus.edu"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select onValueChange={(value) => handleInputChange('course', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer-science">Computer Science</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select onValueChange={(value) => handleInputChange('year', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="sciences">Sciences</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleRegister} 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Student Account'}
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AuthForm;

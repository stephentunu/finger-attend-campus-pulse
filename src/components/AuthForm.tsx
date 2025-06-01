
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, UserCheck } from "lucide-react";

const AuthForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    studentId: '',
    course: '',
    year: '',
    department: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = (userType) => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Demo credentials
    if (userType === 'admin' && formData.email === 'admin@campus.edu' && formData.password === 'admin123') {
      onLogin({ email: formData.email, name: 'Admin User', role: 'admin' }, 'admin');
      toast.success("Welcome, Admin!");
      return;
    }

    if (userType === 'student') {
      onLogin({
        email: formData.email,
        name: formData.name || 'Student User',
        studentId: formData.studentId || 'STU001',
        course: formData.course || 'Computer Science',
        year: formData.year || '2024',
        department: formData.department || 'Engineering',
        role: 'student'
      }, 'student');
      toast.success(`Welcome, ${formData.name || 'Student'}!`);
      return;
    }

    toast.error("Invalid credentials");
  };

  const handleRegister = () => {
    if (!formData.email || !formData.password || !formData.name || !formData.studentId) {
      toast.error("Please fill in all required fields");
      return;
    }

    onLogin({
      email: formData.email,
      name: formData.name,
      studentId: formData.studentId,
      course: formData.course,
      year: formData.year,
      department: formData.department,
      role: 'student'
    }, 'student');
    toast.success(`Account created successfully! Welcome, ${formData.name}!`);
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
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
              <p className="text-xs text-blue-600">Admin: admin@campus.edu / admin123</p>
              <p className="text-xs text-blue-600">Student: Any email / any password</p>
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <Button 
              onClick={() => handleLogin('student')} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Sign In as Student
            </Button>
            <Button 
              onClick={() => handleLogin('admin')} 
              variant="outline" 
              className="w-full border-blue-200 hover:bg-blue-50"
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
            <Button onClick={handleRegister} className="w-full bg-green-600 hover:bg-green-700">
              Create Student Account
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AuthForm;

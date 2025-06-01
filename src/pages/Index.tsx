
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Fingerprint, GraduationCap, Users, TrendingUp } from "lucide-react";
import AuthForm from '@/components/AuthForm';
import StudentDashboard from '@/components/StudentDashboard';
import AdminDashboard from '@/components/AdminDashboard';

const Index = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);

  const handleLogin = (user, type) => {
    setCurrentUser(user);
    setUserType(type);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
  };

  if (currentUser) {
    return userType === 'admin' ? 
      <AdminDashboard user={currentUser} onLogout={handleLogout} /> :
      <StudentDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Fingerprint className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CampusAttend</h1>
                <p className="text-sm text-gray-600">Biometric Attendance System</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span className="text-sm">Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Automated</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Campus
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {" "}Attendance
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Revolutionary biometric attendance system ensuring accurate tracking, preventing proxy attendance, 
            and automatically managing exam eligibility for students.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-blue-100 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Fingerprint className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Biometric Security</CardTitle>
              <CardDescription>
                Prevent proxy attendance with secure fingerprint authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Unique fingerprint identification</li>
                <li>• Real-time attendance marking</li>
                <li>• Secure check-in/check-out system</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-100 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Automated Tracking</CardTitle>
              <CardDescription>
                Intelligent attendance monitoring and eligibility calculation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Automatic attendance percentage</li>
                <li>• Exam eligibility monitoring</li>
                <li>• Quarterly report generation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-100 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Comprehensive Analytics</CardTitle>
              <CardDescription>
                Detailed insights and visualizations for better management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Real-time attendance dashboard</li>
                <li>• Interactive charts and graphs</li>
                <li>• Student performance analytics</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Auth Section */}
        <div className="max-w-md mx-auto">
          <AuthForm onLogin={handleLogin} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Fingerprint className="h-5 w-5" />
            <span className="font-semibold">CampusAttend</span>
          </div>
          <p className="text-gray-400">
            Secure • Reliable • Automated Attendance Management
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

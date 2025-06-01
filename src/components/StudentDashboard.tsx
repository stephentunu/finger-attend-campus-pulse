
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, LogOut, User, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import BiometricScanner from './BiometricScanner';
import AttendanceChart from './AttendanceChart';
import { toast } from "sonner";

interface User {
  name: string;
  studentId: string;
  course: string;
  department: string;
  year: string;
}

interface AttendanceData {
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  status: string;
  todayStatus: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  recentAttendance: any[];
}

const StudentDashboard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({
    totalClasses: 45,
    attendedClasses: 32,
    percentage: 71.1,
    status: 'eligible',
    todayStatus: 'not-marked',
    checkInTime: null,
    checkOutTime: null,
    recentAttendance: []
  });

  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Generate sample attendance data
    const generateAttendanceData = () => {
      const dates = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push({
          date: date.toISOString().split('T')[0],
          present: Math.random() > 0.3,
          checkIn: Math.random() > 0.3 ? '09:00' : null,
          checkOut: Math.random() > 0.3 ? '11:00' : null
        });
      }
      setAttendanceData(prev => ({ ...prev, recentAttendance: dates }));
    };

    generateAttendanceData();
  }, []);

  const handleBiometricScan = (action: string) => {
    setIsScanning(true);
    
    setTimeout(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      if (action === 'checkin') {
        setAttendanceData(prev => ({
          ...prev,
          checkInTime: timeString,
          todayStatus: 'checked-in'
        }));
        toast.success(`Check-in successful at ${timeString}`);
      } else {
        setAttendanceData(prev => ({
          ...prev,
          checkOutTime: timeString,
          todayStatus: 'completed',
          attendedClasses: prev.attendedClasses + 1,
          percentage: parseFloat(((prev.attendedClasses + 1) / prev.totalClasses * 100).toFixed(1))
        }));
        toast.success(`Check-out successful at ${timeString}. Attendance marked!`);
      }
      
      setIsScanning(false);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'checked-in': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-sm text-gray-600">Welcome, {user.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} className="border-blue-200">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Student Info & Quick Stats */}
          <div className="space-y-6">
            {/* Student Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Student Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Student ID</p>
                  <p className="font-semibold">{user.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-semibold">{user.course}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold">{user.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Academic Year</p>
                  <p className="font-semibold">{user.year}</p>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Attendance Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {attendanceData.percentage}%
                  </div>
                  <p className="text-sm text-gray-600">Overall Attendance</p>
                </div>
                
                <Progress value={attendanceData.percentage} className="h-3" />
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold text-blue-600">
                      {attendanceData.attendedClasses}
                    </div>
                    <p className="text-xs text-gray-600">Classes Attended</p>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-gray-600">
                      {attendanceData.totalClasses}
                    </div>
                    <p className="text-xs text-gray-600">Total Classes</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Exam Eligibility</span>
                    <Badge className={getStatusColor(attendanceData.status)}>
                      {attendanceData.status === 'eligible' ? 'Eligible' : 'Not Eligible'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum required: 33.3% (15 classes)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Biometric Scanner & Today's Status */}
          <div className="space-y-6">
            {/* Today's Attendance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Today's Attendance</span>
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(attendanceData.todayStatus)}
                    <div>
                      <p className="font-medium">
                        {attendanceData.todayStatus === 'completed' ? 'Attendance Complete' :
                         attendanceData.todayStatus === 'checked-in' ? 'Checked In' : 'Not Marked'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {attendanceData.todayStatus === 'completed' ? 'Both check-in and check-out completed' :
                         attendanceData.todayStatus === 'checked-in' ? 'Please check-out before leaving' :
                         'Use biometric scanner to mark attendance'}
                      </p>
                    </div>
                  </div>
                </div>

                {(attendanceData.checkInTime || attendanceData.checkOutTime) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Check-in</p>
                      <p className="font-semibold text-green-600">
                        {attendanceData.checkInTime || '--:--'}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Check-out</p>
                      <p className="font-semibold text-blue-600">
                        {attendanceData.checkOutTime || '--:--'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Biometric Scanner */}
            <BiometricScanner
              onScan={handleBiometricScan}
              isScanning={isScanning}
              todayStatus={attendanceData.todayStatus}
            />
          </div>

          {/* Right Column - Attendance Chart */}
          <div className="space-y-6">
            <AttendanceChart data={attendanceData.recentAttendance} />
            
            {/* Recent Attendance */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceData.recentAttendance.slice(-7).reverse().map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {day.checkIn && day.checkOut ? 
                            `${day.checkIn} - ${day.checkOut}` : 
                            'No attendance'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {day.present ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <Badge variant={day.present ? "default" : "destructive"}>
                          {day.present ? 'Present' : 'Absent'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

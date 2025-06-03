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
  lastCheckInDate: string | null;
  lastCheckOutDate: string | null;
}

const StudentDashboard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({
    totalClasses: 0,
    attendedClasses: 0,
    percentage: 0,
    status: 'eligible',
    todayStatus: 'not-marked',
    checkInTime: null,
    checkOutTime: null,
    recentAttendance: [],
    lastCheckInDate: null,
    lastCheckOutDate: null
  });

  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Initialize with empty attendance data for new students
    console.log('Initializing fresh attendance data for student:', user.studentId);
    
    // Check if student has existing attendance data in localStorage
    const existingData = localStorage.getItem(`attendance_${user.studentId}`);
    
    if (existingData) {
      const savedData = JSON.parse(existingData);
      setAttendanceData({
        ...savedData,
        lastCheckInDate: savedData.lastCheckInDate || null,
        lastCheckOutDate: savedData.lastCheckOutDate || null
      });
    } else {
      // Fresh start - no mock data
      setAttendanceData({
        totalClasses: 0,
        attendedClasses: 0,
        percentage: 0,
        status: 'eligible',
        todayStatus: 'not-marked',
        checkInTime: null,
        checkOutTime: null,
        recentAttendance: [],
        lastCheckInDate: null,
        lastCheckOutDate: null
      });
    }
  }, [user.studentId]);

  const canPerformAction = (action: string) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (action === 'checkin') {
      // Check if already checked in today
      if (attendanceData.lastCheckInDate === today) {
        return false;
      }
      return attendanceData.todayStatus === 'not-marked';
    } else {
      // Check if already checked out today
      if (attendanceData.lastCheckOutDate === today) {
        return false;
      }
      return attendanceData.todayStatus === 'checked-in' && attendanceData.lastCheckInDate === today;
    }
  };

  const handleBiometricScan = (action: string) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Validate 24-hour rule
    if (!canPerformAction(action)) {
      if (action === 'checkin') {
        if (attendanceData.lastCheckInDate === today) {
          toast.error('You have already checked in today. Next check-in available tomorrow.');
          return;
        }
      } else {
        if (attendanceData.lastCheckOutDate === today) {
          toast.error('You have already checked out today. Next check-out available tomorrow.');
          return;
        }
      }
    }

    setIsScanning(true);
    
    setTimeout(() => {
      const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const dateString = now.toISOString().split('T')[0];

      if (action === 'checkin') {
        const updatedData = {
          ...attendanceData,
          checkInTime: timeString,
          todayStatus: 'checked-in',
          lastCheckInDate: today
        };
        setAttendanceData(updatedData);
        localStorage.setItem(`attendance_${user.studentId}`, JSON.stringify(updatedData));
        toast.success(`Check-in successful at ${timeString}`);
      } else {
        const newAttendanceRecord = {
          date: dateString,
          present: true,
          checkIn: attendanceData.checkInTime || timeString,
          checkOut: timeString
        };

        const updatedRecentAttendance = [
          ...attendanceData.recentAttendance,
          newAttendanceRecord
        ];

        const newTotalClasses = attendanceData.totalClasses + 1;
        const newAttendedClasses = attendanceData.attendedClasses + 1;
        const newPercentage = newTotalClasses > 0 ? parseFloat(((newAttendedClasses / newTotalClasses) * 100).toFixed(1)) : 0;

        const updatedData = {
          ...attendanceData,
          checkOutTime: timeString,
          todayStatus: 'completed',
          totalClasses: newTotalClasses,
          attendedClasses: newAttendedClasses,
          percentage: newPercentage,
          recentAttendance: updatedRecentAttendance,
          lastCheckOutDate: today
        };

        setAttendanceData(updatedData);
        localStorage.setItem(`attendance_${user.studentId}`, JSON.stringify(updatedData));
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
                    Minimum required: 33.3% attendance
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
              canCheckIn={canPerformAction('checkin')}
              canCheckOut={canPerformAction('checkout')}
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
                  {attendanceData.recentAttendance.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No attendance records yet</p>
                      <p className="text-sm">Start by checking in to mark your first attendance</p>
                    </div>
                  ) : (
                    attendanceData.recentAttendance.slice(-7).reverse().map((day, index) => (
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
                    ))
                  )}
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

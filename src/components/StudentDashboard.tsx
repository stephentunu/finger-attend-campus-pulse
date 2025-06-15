import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, LogOut, User, CheckCircle, XCircle, TrendingUp, BookOpen } from "lucide-react";
import BiometricScanner from './BiometricScanner';
import AttendanceChart from './AttendanceChart';
import { toast } from "sonner";

interface User {
  name: string;
  student_id: string; // Keep original property name
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
  selectedUnit: string | null;
}

// Sample units based on common courses
const getUnitsForCourse = (course: string, department: string) => {
  const units = {
    'Computer Science': [
      'Programming Fundamentals',
      'Data Structures & Algorithms',
      'Database Systems',
      'Software Engineering',
      'Computer Networks',
      'Operating Systems',
      'Web Development',
      'Machine Learning'
    ],
    'Mathematics': [
      'Calculus I',
      'Calculus II',
      'Linear Algebra',
      'Statistics',
      'Discrete Mathematics',
      'Number Theory',
      'Mathematical Analysis',
      'Probability Theory'
    ],
    'Business': [
      'Business Management',
      'Marketing Principles',
      'Financial Accounting',
      'Human Resources',
      'Business Ethics',
      'Strategic Management',
      'Operations Management',
      'Entrepreneurship'
    ],
    'Physics': [
      'Classical Mechanics',
      'Thermodynamics',
      'Electromagnetism',
      'Quantum Physics',
      'Optics',
      'Nuclear Physics',
      'Solid State Physics',
      'Astrophysics'
    ],
    'Engineering': [
      'Engineering Mathematics',
      'Mechanics of Materials',
      'Thermodynamics',
      'Fluid Mechanics',
      'Control Systems',
      'Digital Electronics',
      'Engineering Design',
      'Project Management'
    ]
  };

  // Return units based on course, fallback to general units
  return units[course as keyof typeof units] || units['Engineering'] || [
    'General Studies',
    'Research Methods',
    'Technical Writing',
    'Project Work'
  ];
};

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
    lastCheckOutDate: null,
    selectedUnit: null
  });

  const [isScanning, setIsScanning] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  // Get available units for the student's course
  const availableUnits = getUnitsForCourse(user.course, user.department);

  // Helper function to check if a date is a weekday (Monday-Friday)
  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday = 1, Friday = 5
  };

  // Helper function to get all weekdays between two dates
  const getWeekdaysBetween = (startDate: Date, endDate: Date) => {
    const weekdays = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (isWeekday(current)) {
        weekdays.push(new Date(current).toISOString().split('T')[0]);
      }
      current.setDate(current.getDate() + 1);
    }
    
    return weekdays;
  };

  // Helper function to fill missing weekdays as absent
  const fillMissingWeekdays = (attendanceRecords: any[]) => {
    if (attendanceRecords.length === 0) return [];

    const sortedRecords = [...attendanceRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDate = new Date(sortedRecords[0].date);
    const today = new Date();
    
    // Get all weekdays from first record to today
    const allWeekdays = getWeekdaysBetween(firstDate, today);
    
    // Create a map of existing records
    const recordMap = new Map();
    sortedRecords.forEach(record => {
      recordMap.set(record.date, record);
    });

    // Fill in missing weekdays as absent
    const completeRecords = allWeekdays.map(dateStr => {
      if (recordMap.has(dateStr)) {
        return recordMap.get(dateStr);
      } else {
        // Only mark as absent if it's a past weekday (not today or future)
        const recordDate = new Date(dateStr);
        const todayStr = today.toISOString().split('T')[0];
        
        if (dateStr < todayStr) {
          return {
            date: dateStr,
            present: false,
            checkIn: null,
            checkOut: null,
            unit: null
          };
        }
        return null;
      }
    }).filter(record => record !== null);

    return completeRecords;
  };

  // Create a unique storage key for this specific student
  const getStudentStorageKey = (studentId: string) => {
    console.log('Creating storage key for student:', studentId, 'type:', typeof studentId);
    
    // Ensure we have a valid student ID
    if (!studentId || studentId === 'undefined' || studentId === '') {
      console.error('Invalid student ID provided to getStudentStorageKey:', studentId);
      // Fallback to a default key, but this should be investigated
      return `attendance_default_${Math.random()}`;
    }
    
    const key = `attendance_${studentId}`;
    console.log('Generated storage key:', key);
    return key;
  };

  useEffect(() => {
    console.log('Loading attendance data for student:', user.student_id, 'user object:', user);
    
    // Validate user and student_id (note the underscore)
    if (!user || !user.student_id) {
      console.error('Invalid user object or missing student_id:', user);
      return;
    }
    
    // Get attendance data specific to this student only
    const studentStorageKey = getStudentStorageKey(user.student_id);
    const existingData = localStorage.getItem(studentStorageKey);
    
    console.log('Looking for data with key:', studentStorageKey, 'found:', !!existingData);
    
    if (existingData) {
      try {
        const savedData = JSON.parse(existingData);
        console.log('Found existing attendance data for student:', user.student_id, savedData);
        
        // Fill missing weekdays and recalculate stats
        const completeAttendance = fillMissingWeekdays(savedData.recentAttendance || []);
        const attendedClasses = completeAttendance.filter(record => record.present).length;
        const totalClasses = completeAttendance.length;
        const percentage = totalClasses > 0 ? parseFloat(((attendedClasses / totalClasses) * 100).toFixed(1)) : 0;
        
        setAttendanceData({
          ...savedData,
          recentAttendance: completeAttendance,
          attendedClasses,
          totalClasses,
          percentage,
          status: percentage >= 33.3 ? 'eligible' : 'critical',
          lastCheckInDate: savedData.lastCheckInDate || null,
          lastCheckOutDate: savedData.lastCheckOutDate || null,
          selectedUnit: savedData.selectedUnit || null
        });
      } catch (error) {
        console.error('Error parsing attendance data for student:', user.student_id, error);
        // Reset to fresh data if parsing fails
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
          lastCheckOutDate: null,
          selectedUnit: null
        });
      }
    } else {
      console.log('No existing data found for student:', user.student_id, 'initializing fresh data');
      // Fresh start - no data for this student
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
        lastCheckOutDate: null,
        selectedUnit: null
      });
    }
  }, [user?.student_id]); // Use student_id with underscore

  const canPerformAction = (action: string) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if today is a weekday
    if (!isWeekday(now)) {
      console.log('Today is not a weekday, attendance not required');
      return false;
    }
    
    console.log('Checking action permission for student:', user.student_id, {
      action,
      today,
      lastCheckInDate: attendanceData.lastCheckInDate,
      lastCheckOutDate: attendanceData.lastCheckOutDate,
      todayStatus: attendanceData.todayStatus,
      checkInTime: attendanceData.checkInTime
    });
    
    if (action === 'checkin') {
      // Check if already checked in today
      if (attendanceData.lastCheckInDate === today) {
        console.log('Student', user.student_id, 'already checked in today');
        return false;
      }
      // Can check in if status is not-marked or if it's a new day
      return attendanceData.todayStatus === 'not-marked' || attendanceData.lastCheckInDate !== today;
    } else {
      // Check if already checked out today
      if (attendanceData.lastCheckOutDate === today) {
        console.log('Student', user.student_id, 'already checked out today');
        return false;
      }
      
      // Check if checked in today
      if (attendanceData.todayStatus !== 'checked-in' || attendanceData.lastCheckInDate !== today) {
        return false;
      }
      
      // Check if minimum 120 minutes have passed since check-in
      if (attendanceData.checkInTime) {
        const checkInTime = attendanceData.checkInTime;
        const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
        const checkInDateTime = new Date();
        checkInDateTime.setHours(checkInHours, checkInMinutes, 0, 0);
        
        const timeDifferenceMs = now.getTime() - checkInDateTime.getTime();
        const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
        
        console.log('Time difference since check-in:', timeDifferenceMinutes, 'minutes');
        
        if (timeDifferenceMinutes < 120) {
          console.log('Student', user.student_id, 'cannot check out yet - minimum 120 minutes not reached');
          return false;
        }
      }
      
      return true;
    }
  };

  const saveAttendanceData = (newData: AttendanceData) => {
    if (!user || !user.student_id) {
      console.error('Cannot save attendance data - invalid user or student_id:', user);
      return;
    }
    
    const studentStorageKey = getStudentStorageKey(user.student_id);
    console.log('Saving attendance data for student:', user.student_id, 'to key:', studentStorageKey, newData);
    localStorage.setItem(studentStorageKey, JSON.stringify(newData));
    setAttendanceData(newData);
  };

  const handleBiometricScan = (action: string) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if today is a weekday
    if (!isWeekday(now)) {
      toast.error('Attendance is only required on weekdays (Monday-Friday).');
      return;
    }

    // For check-in, validate unit selection
    if (action === 'checkin' && !selectedUnit) {
      toast.error('Please select a unit before checking in.');
      return;
    }
    
    console.log('Handling biometric scan for student:', user.student_id, {
      action,
      today,
      canPerform: canPerformAction(action),
      selectedUnit: action === 'checkin' ? selectedUnit : attendanceData.selectedUnit
    });
    
    // Validate 24-hour rule and minimum lesson duration
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
        if (attendanceData.todayStatus !== 'checked-in') {
          toast.error('You must check in first before checking out.');
          return;
        }
        
        // Check minimum lesson duration
        if (attendanceData.checkInTime) {
          const checkInTime = attendanceData.checkInTime;
          const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
          const checkInDateTime = new Date();
          checkInDateTime.setHours(checkInHours, checkInMinutes, 0, 0);
          
          const timeDifferenceMs = now.getTime() - checkInDateTime.getTime();
          const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
          
          if (timeDifferenceMinutes < 120) {
            const remainingMinutes = Math.ceil(120 - timeDifferenceMinutes);
            toast.error(`Minimum lesson duration is 120 minutes. Please wait ${remainingMinutes} more minutes before checking out.`);
            return;
          }
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
          lastCheckInDate: today,
          checkOutTime: null, // Reset checkout time for new day
          selectedUnit: selectedUnit
        };
        saveAttendanceData(updatedData);
        toast.success(`Check-in successful for ${selectedUnit} at ${timeString}. Minimum lesson duration: 120 minutes.`);
        console.log('Check-in completed for student:', user.student_id, updatedData);
        
        // Don't reset unit selection after successful check-in - keep it selected
      } else {
        const newAttendanceRecord = {
          date: dateString,
          present: true,
          checkIn: attendanceData.checkInTime || timeString,
          checkOut: timeString,
          unit: attendanceData.selectedUnit
        };

        const updatedRecentAttendance = [
          ...attendanceData.recentAttendance,
          newAttendanceRecord
        ];

        // Fill missing weekdays and recalculate
        const completeAttendance = fillMissingWeekdays(updatedRecentAttendance);
        const newAttendedClasses = completeAttendance.filter(record => record.present).length;
        const newTotalClasses = completeAttendance.length;
        const newPercentage = newTotalClasses > 0 ? parseFloat(((newAttendedClasses / newTotalClasses) * 100).toFixed(1)) : 0;

        const updatedData = {
          ...attendanceData,
          checkOutTime: timeString,
          todayStatus: 'completed',
          totalClasses: newTotalClasses,
          attendedClasses: newAttendedClasses,
          percentage: newPercentage,
          status: newPercentage >= 33.3 ? 'eligible' : 'critical',
          recentAttendance: completeAttendance,
          lastCheckOutDate: today
        };

        saveAttendanceData(updatedData);
        toast.success(`Check-out successful for ${attendanceData.selectedUnit} at ${timeString}. Attendance marked!`);
        console.log('Check-out completed for student:', user.student_id, updatedData);
      }
      
      setIsScanning(false);
    }, 3000);
  };

  // Check if today is a weekday for display purposes
  const todayIsWeekday = isWeekday(new Date());

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
                  <p className="font-semibold">{user.student_id}</p>
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
                    <p className="text-xs text-gray-600">Days Present</p>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-gray-600">
                      {attendanceData.totalClasses}
                    </div>
                    <p className="text-xs text-gray-600">Total Weekdays</p>
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
                    Minimum required: 33.3% attendance (weekdays only)
                  </p>
                </div>

                {!todayIsWeekday && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 text-center">
                      📅 Today is a weekend. Attendance is only tracked Monday-Friday.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Unit Selection & Biometric Scanner & Today's Status */}
          <div className="space-y-6">
            {/* Unit Selection for Check-in */}
            {todayIsWeekday && attendanceData.todayStatus !== 'completed' && attendanceData.todayStatus !== 'checked-in' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <span>Select Unit</span>
                  </CardTitle>
                  <CardDescription>Choose the unit you're attending today</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a unit to attend" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedUnit && (
                    <p className="text-xs text-orange-600 mt-2">
                      ⚠️ Please select a unit before checking in
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

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
                  {!todayIsWeekday && ' (Weekend)'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(attendanceData.todayStatus)}
                    <div>
                      <p className="font-medium">
                        {!todayIsWeekday ? 'Weekend - No Attendance Required' :
                         attendanceData.todayStatus === 'completed' ? 'Attendance Complete' :
                         attendanceData.todayStatus === 'checked-in' ? 'Checked In' : 'Not Marked'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {!todayIsWeekday ? 'Attendance is only tracked on weekdays' :
                         attendanceData.todayStatus === 'completed' ? 'Both check-in and check-out completed' :
                         attendanceData.todayStatus === 'checked-in' ? 'Please check-out before leaving' :
                         'Select unit and use biometric scanner to mark attendance'}
                      </p>
                      {attendanceData.selectedUnit && (
                        <p className="text-xs text-purple-600 font-medium">
                          Unit: {attendanceData.selectedUnit}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Check-in/check-out time display */}
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
              canCheckIn={canPerformAction('checkin') && selectedUnit !== ''}
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
                <CardDescription>Last 7 weekdays</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceData.recentAttendance.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No attendance records yet</p>
                      <p className="text-sm">Start by selecting a unit and checking in to mark your first attendance</p>
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
                              day.present ? 'Present (incomplete)' : 'Absent'}
                          </p>
                          {day.unit && (
                            <p className="text-xs text-purple-600 font-medium">
                              {day.unit}
                            </p>
                          )}
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

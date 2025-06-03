import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, TrendingUp, Calendar, Download, LogOut, Search, Filter } from "lucide-react";
import AdminAnalytics from './AdminAnalytics';
import { toast } from "sonner";

interface User {
  name: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  department: string;
  year: string;
  attendedClasses: number;
  totalClasses: number;
  percentage: string;
  status: string;
  lastSeen: string;
  isPresent: boolean;
}

interface Stats {
  totalStudents: number;
  presentToday: number;
  eligibleStudents: number;
  avgAttendance: string;
}

const AdminDashboard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    presentToday: 0,
    eligibleStudents: 0,
    avgAttendance: '0'
  });

  useEffect(() => {
    // Load real student data from localStorage
    const loadRealStudentData = () => {
      console.log('Loading real student data from localStorage');
      
      // Get all registered students from localStorage - checking both possible keys
      let registeredStudents = JSON.parse(localStorage.getItem('demoUsers') || '[]');
      
      // If no data in demoUsers, check the old key for backward compatibility
      if (registeredStudents.length === 0) {
        registeredStudents = JSON.parse(localStorage.getItem('registeredStudents') || '[]');
      }
      
      console.log('Found registered students:', registeredStudents);
      
      const studentData: Student[] = [];
      
      registeredStudents.forEach((registeredStudent: any) => {
        // Get attendance data for each student using their student_id or id
        const studentId = registeredStudent.student_id || registeredStudent.id;
        const attendanceData = localStorage.getItem(`attendance_${studentId}`);
        let attendance = {
          totalClasses: 0,
          attendedClasses: 0,
          percentage: 0,
          recentAttendance: []
        };
        
        if (attendanceData) {
          attendance = JSON.parse(attendanceData);
        }
        
        const percentage = attendance.totalClasses > 0 ? 
          (attendance.attendedClasses / attendance.totalClasses * 100) : 0;
        
        // Check if student was present today (simplified check)
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendance.recentAttendance?.find((record: any) => record.date === today);
        
        studentData.push({
          id: studentId,
          name: registeredStudent.full_name || registeredStudent.name,
          email: registeredStudent.email,
          course: registeredStudent.course,
          department: registeredStudent.department,
          year: registeredStudent.academic_year || registeredStudent.year,
          attendedClasses: attendance.attendedClasses,
          totalClasses: attendance.totalClasses,
          percentage: percentage.toFixed(1),
          status: percentage >= 33.3 ? 'eligible' : 'not-eligible',
          lastSeen: todayAttendance ? today : 'Never',
          isPresent: todayAttendance?.present || false
        });
      });

      console.log('Processed student data:', studentData);
      setStudents(studentData);
      setFilteredStudents(studentData);

      // Calculate stats
      const presentToday = studentData.filter(s => s.isPresent).length;
      const eligibleStudents = studentData.filter(s => s.status === 'eligible').length;
      const avgAttendance = studentData.length > 0 ? 
        studentData.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / studentData.length : 0;

      setStats({
        totalStudents: studentData.length,
        presentToday,
        eligibleStudents,
        avgAttendance: avgAttendance.toFixed(1)
      });
    };

    loadRealStudentData();
    
    // Listen for localStorage changes to update in real-time
    const handleStorageChange = () => {
      loadRealStudentData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates periodically
    const interval = setInterval(loadRealStudentData, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(student => student.status === filterStatus);
    }

    setFilteredStudents(filtered);
  }, [searchTerm, filterStatus, students]);

  const generateReport = () => {
    const eligibleStudents = students.filter(s => s.status === 'eligible');
    toast.success(`Quarterly report generated! ${eligibleStudents.length} students eligible for exams.`);
  };

  const getStatusColor = (status: string) => {
    return status === 'eligible' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Attendance Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={generateReport} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" onClick={onLogout} className="border-blue-200">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Registered in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.presentToday}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalStudents > 0 ? ((stats.presentToday / stats.totalStudents) * 100).toFixed(1) : 0}% attendance rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exam Eligible</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.eligibleStudents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalStudents > 0 ? ((stats.eligibleStudents / stats.totalStudents) * 100).toFixed(1) : 0}% of all students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgAttendance}%</div>
              <p className="text-xs text-muted-foreground">
                Overall class average
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students">Student Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>Manage student accounts and monitor attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search students by name, ID, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="eligible">Eligible</SelectItem>
                        <SelectItem value="not-eligible">Not Eligible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Students Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Info</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead>Today</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            <div>
                              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-medium">No students registered yet</p>
                              <p className="text-sm">Students will appear here once they register in the system</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStudents.slice(0, 20).map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{student.name}</div>
                                <div className="text-sm text-gray-600">{student.id}</div>
                                <div className="text-xs text-gray-500">{student.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{student.course}</div>
                                <div className="text-sm text-gray-600">{student.department}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{student.percentage}%</div>
                                <div className="text-sm text-gray-600">
                                  {student.attendedClasses}/{student.totalClasses} classes
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(student.status)}>
                                {student.status === 'eligible' ? 'Eligible' : 'Not Eligible'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {student.lastSeen === 'Never' ? 'Never' : new Date(student.lastSeen).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={student.isPresent ? "default" : "secondary"}>
                                {student.isPresent ? 'Present' : 'Absent'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filteredStudents.length > 20 && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      Showing 20 of {filteredStudents.length} students
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics students={students} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

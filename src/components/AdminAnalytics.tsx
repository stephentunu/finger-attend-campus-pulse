
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Calendar, Award } from "lucide-react";

const AdminAnalytics = ({ students }) => {
  // Prepare data for charts
  const attendanceDistribution = [
    { range: '90-100%', count: students.filter(s => parseFloat(s.percentage) >= 90).length, color: '#10b981' },
    { range: '80-89%', count: students.filter(s => parseFloat(s.percentage) >= 80 && parseFloat(s.percentage) < 90).length, color: '#3b82f6' },
    { range: '70-79%', count: students.filter(s => parseFloat(s.percentage) >= 70 && parseFloat(s.percentage) < 80).length, color: '#f59e0b' },
    { range: '60-69%', count: students.filter(s => parseFloat(s.percentage) >= 60 && parseFloat(s.percentage) < 70).length, color: '#ef4444' },
    { range: '50-59%', count: students.filter(s => parseFloat(s.percentage) >= 50 && parseFloat(s.percentage) < 60).length, color: '#8b5cf6' },
    { range: 'Below 50%', count: students.filter(s => parseFloat(s.percentage) < 50).length, color: '#6b7280' }
  ];

  const departmentData = students.reduce((acc, student) => {
    const dept = student.department;
    if (!acc[dept]) {
      acc[dept] = { department: dept, students: 0, avgAttendance: 0, eligible: 0 };
    }
    acc[dept].students += 1;
    acc[dept].avgAttendance += parseFloat(student.percentage);
    if (student.status === 'eligible') acc[dept].eligible += 1;
    return acc;
  }, {});

  const departmentStats = Object.values(departmentData).map(dept => ({
    ...dept,
    avgAttendance: (dept.avgAttendance / dept.students).toFixed(1)
  }));

  const eligibilityData = [
    { name: 'Eligible', value: students.filter(s => s.status === 'eligible').length, color: '#10b981' },
    { name: 'Not Eligible', value: students.filter(s => s.status === 'not-eligible').length, color: '#ef4444' }
  ];

  // Generate trend data (simulated)
  const trendData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    attendance: Math.floor(Math.random() * 20) + 70 + Math.sin(i / 5) * 10
  }));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Performers</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {students.filter(s => parseFloat(s.percentage) >= 90).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Students with 90%+ attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {students.filter(s => parseFloat(s.percentage) < 50).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Students below 50% attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Department</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {departmentStats.reduce((best, dept) => 
                parseFloat(dept.avgAttendance) > parseFloat(best.avgAttendance) ? dept : best, 
                departmentStats[0] || { department: 'N/A', avgAttendance: 0 }
              ).department}
            </div>
            <p className="text-xs text-muted-foreground">
              Highest average attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Trend</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+5.2%</div>
            <p className="text-xs text-muted-foreground">
              Attendance improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Attendance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Attendance Distribution</span>
            </CardTitle>
            <CardDescription>
              Number of students in each attendance range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="range" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <span>Exam Eligibility</span>
            </CardTitle>
            <CardDescription>
              Students eligible vs not eligible for exams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eligibilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {eligibilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              {eligibilityData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm font-medium">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Department Performance</span>
            </CardTitle>
            <CardDescription>
              Average attendance by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" domain={[0, 100]} fontSize={12} />
                  <YAxis dataKey="department" type="category" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="avgAttendance" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span>30-Day Attendance Trend</span>
            </CardTitle>
            <CardDescription>
              Daily attendance percentage over the last month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis domain={[60, 100]} fontSize={12} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Department Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Department Statistics</CardTitle>
          <CardDescription>
            Detailed breakdown by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departmentStats.map((dept, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <h3 className="font-semibold text-lg">{dept.department}</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">{dept.students}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Attendance:</span>
                    <span className="font-medium">{dept.avgAttendance}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Eligible:</span>
                    <span className="font-medium text-green-600">{dept.eligible}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Eligibility Rate:</span>
                    <span className="font-medium">
                      {((dept.eligible / dept.students) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;

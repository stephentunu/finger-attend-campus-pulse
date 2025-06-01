
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from "lucide-react";

const AttendanceChart = ({ data }) => {
  // Transform data for the chart
  const chartData = data.slice(-30).map((day, index) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    attendance: day.present ? 100 : 0,
    cumulative: data.slice(0, data.indexOf(day) + 1).filter(d => d.present).length / (data.indexOf(day) + 1) * 100
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            Daily: {payload[0].value === 100 ? 'Present' : 'Absent'}
          </p>
          <p className="text-sm text-green-600">
            Cumulative: {payload[1].value.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span>Attendance Trend</span>
        </CardTitle>
        <CardDescription>
          Last 30 days attendance pattern
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: '#3b82f6' }}
              />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Daily Attendance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-1 bg-green-500 rounded" style={{ borderStyle: 'dashed' }}></div>
            <span className="text-gray-600">Cumulative %</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {data.filter(d => d.present).length}
            </div>
            <p className="text-xs text-gray-600">Days Present</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">
              {data.filter(d => !d.present).length}
            </div>
            <p className="text-xs text-gray-600">Days Absent</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {data.length > 0 ? ((data.filter(d => d.present).length / data.length) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-gray-600">Overall Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;

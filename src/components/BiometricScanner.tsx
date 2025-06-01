
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Fingerprint, Scan } from "lucide-react";

const BiometricScanner = ({ onScan, isScanning, todayStatus }) => {
  const [scanProgress, setScanProgress] = useState(0);

  const handleScan = (action) => {
    setScanProgress(0);
    onScan(action);
    
    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const canCheckIn = todayStatus === 'not-marked';
  const canCheckOut = todayStatus === 'checked-in';

  return (
    <Card className="border-blue-200">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Fingerprint className="h-6 w-6 text-blue-600" />
          <span>Biometric Scanner</span>
        </CardTitle>
        <CardDescription>
          Place your finger on the scanner to mark attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scanner Animation */}
        <div className="relative">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center border-4 border-blue-300">
            <div className={`w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 ${isScanning ? 'animate-pulse scale-110' : ''}`}>
              <Fingerprint className={`h-10 w-10 text-white transition-all duration-300 ${isScanning ? 'animate-spin' : ''}`} />
            </div>
          </div>
          
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 border-4 border-blue-400 rounded-full animate-ping opacity-30"></div>
            </div>
          )}
        </div>

        {/* Scanning Progress */}
        {isScanning && (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Scan className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium text-blue-600">Scanning fingerprint...</span>
            </div>
            <Progress value={scanProgress} className="h-2" />
            <p className="text-xs text-center text-gray-600">
              Please keep your finger steady on the scanner
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => handleScan('checkin')}
            disabled={!canCheckIn || isScanning}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
            size="lg"
          >
            <Fingerprint className="h-5 w-5 mr-2" />
            {isScanning ? 'Scanning...' : 'Check In'}
          </Button>
          
          <Button 
            onClick={() => handleScan('checkout')}
            disabled={!canCheckOut || isScanning}
            variant="outline"
            className="w-full border-blue-200 hover:bg-blue-50 disabled:bg-gray-100"
            size="lg"
          >
            <Fingerprint className="h-5 w-5 mr-2" />
            {isScanning ? 'Scanning...' : 'Check Out'}
          </Button>
        </div>

        {/* Status Messages */}
        <div className="text-center text-sm">
          {todayStatus === 'not-marked' && (
            <p className="text-gray-600">Use "Check In" to start your attendance</p>
          )}
          {todayStatus === 'checked-in' && (
            <p className="text-blue-600">Checked in! Don't forget to check out when leaving</p>
          )}
          {todayStatus === 'completed' && (
            <p className="text-green-600">Attendance completed for today</p>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 text-center">
            🔒 Your biometric data is encrypted and stored securely. 
            Each scan is unique and cannot be replicated.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiometricScanner;

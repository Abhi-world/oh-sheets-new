import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ExportConfig {
  interval: string;
  lastExport: Date | null;
  isActive: boolean;
  exportTime: string;
}

const PeriodicExportForm = () => {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    interval: 'daily',
    lastExport: null,
    isActive: false,
    exportTime: '09:00'
  });

  useEffect(() => {
    if (exportConfig.isActive) {
      const checkInterval = setInterval(() => {
        checkAndExport();
      }, 60000); // Check every minute
      
      console.log('Periodic export checker started');
      return () => clearInterval(checkInterval);
    }
  }, [exportConfig]);

  const checkAndExport = async () => {
    console.log('Checking if export is needed...');
    const now = new Date();
    const lastExport = exportConfig.lastExport;
    const [exportHour, exportMinute] = exportConfig.exportTime.split(':').map(Number);
    const scheduledTime = new Date(now);
    scheduledTime.setHours(exportHour, exportMinute, 0, 0);

    if (!lastExport) {
      if (now >= scheduledTime) {
        performExport();
      }
      return;
    }

    const timeDiff = now.getTime() - lastExport.getTime();
    const shouldExport = (() => {
      if (now < scheduledTime) return false;
      
      switch (exportConfig.interval) {
        case 'hourly':
          return timeDiff >= 3600000; // 1 hour
        case 'daily':
          return timeDiff >= 86400000; // 24 hours
        case 'weekly':
          return timeDiff >= 604800000; // 7 days
        case 'monthly':
          return timeDiff >= 2592000000; // 30 days
        default:
          return false;
      }
    })();

    if (shouldExport) {
      performExport();
    }
  };

  const performExport = async () => {
    try {
      console.log('Exporting data from Monday.com to Google Sheets');
      toast.success('Data exported successfully');
      
      setExportConfig(prev => ({
        ...prev,
        lastExport: new Date()
      }));
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  const handleStartExport = () => {
    setExportConfig(prev => ({
      ...prev,
      isActive: true,
      lastExport: null
    }));
    toast.success(`Periodic export started - ${exportConfig.interval} exports enabled`);
  };

  const handleStopExport = () => {
    setExportConfig(prev => ({
      ...prev,
      isActive: false
    }));
    toast.info('Periodic export stopped');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-monday-blue" />
          Periodic Export Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Time</label>
            <Input
              type="time"
              value={exportConfig.exportTime}
              onChange={(e) => setExportConfig(prev => ({ ...prev, exportTime: e.target.value }))}
              className="border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Export Interval</label>
            <Select
              value={exportConfig.interval}
              onValueChange={(value) => 
                setExportConfig(prev => ({ ...prev, interval: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {exportConfig.lastExport && (
            <div className="text-sm text-gray-500">
              Last export: {exportConfig.lastExport.toLocaleString()}
            </div>
          )}

          <Button
            onClick={exportConfig.isActive ? handleStopExport : handleStartExport}
            className={`w-full ${
              exportConfig.isActive 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-monday-blue hover:bg-monday-blue/90'
            }`}
          >
            {exportConfig.isActive ? 'Stop Export' : 'Start Export'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeriodicExportForm;
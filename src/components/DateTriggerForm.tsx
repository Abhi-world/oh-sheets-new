import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

const DateTriggerForm = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-monday-blue" />
          Date Trigger Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trigger Date</label>
            <Input type="date" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Values to Add</label>
            <Input 
              placeholder="Value1, Value2, Value3..."
              required 
            />
          </div>
          <Button 
            type="submit"
            className="w-full bg-monday-blue hover:bg-monday-blue/90"
          >
            Save Configuration
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DateTriggerForm;
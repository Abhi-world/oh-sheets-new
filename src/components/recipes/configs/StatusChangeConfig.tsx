import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle } from 'lucide-react';

const StatusChangeConfig = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00c875] to-[#00a65a] text-white p-8">
      {/* Pre-built template banner */}
      <div className="bg-[#1f2b5f]/20 text-white/90 px-4 py-2 rounded-lg mb-8 inline-flex items-center gap-2">
        <span>This is a pre-built template.</span>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto space-y-12">
        <p className="text-3xl leading-relaxed">
          When{' '}
          <Select>
            <SelectTrigger className="w-40 inline-flex bg-transparent border-b-2 border-white/50 rounded-none text-white">
              <SelectValue placeholder="status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="new">+ Add a new column</SelectItem>
            </SelectContent>
          </Select>
          {' '}changes to{' '}
          <Select>
            <SelectTrigger className="w-40 inline-flex bg-transparent border-b-2 border-white/50 rounded-none text-white">
              <SelectValue placeholder="something" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="working">Working on it</SelectItem>
              <SelectItem value="stuck">Stuck</SelectItem>
            </SelectContent>
          </Select>
          , add a row in{' '}
          <Input 
            className="w-40 inline-flex bg-transparent border-b-2 border-white/50 rounded-none text-white px-0"
            placeholder="Spreadsheet"
          />
          {' '}/{' '}
          <Input 
            className="w-32 inline-flex bg-transparent border-b-2 border-white/50 rounded-none text-white px-0"
            placeholder="Sheet"
          />
          {' '}with these{' '}
          <Input 
            className="w-32 inline-flex bg-transparent border-b-2 border-white/50 rounded-none text-white px-0"
            placeholder="values"
          />
        </p>

        <Button 
          size="lg"
          className="bg-[#0073ea] hover:bg-[#0073ea]/90 text-white"
        >
          Create automation
        </Button>
      </div>

      {/* Google Sheets icon and Help button */}
      <div className="fixed bottom-4 left-4 flex items-center gap-2 text-white/90">
        <img 
          src="/placeholder.svg" 
          alt="Google Sheets" 
          className="w-8 h-8"
        />
        <span>Google Sheets</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 text-white hover:bg-white/20"
      >
        <HelpCircle className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default StatusChangeConfig;
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatusChangeConfig = () => {
  const navigate = useNavigate();
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [spreadsheet, setSpreadsheet] = useState<string>('');
  const [sheet, setSheet] = useState<string>('');
  const [values, setValues] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00c875] to-[#00a65a] text-white p-8">
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4 text-white hover:text-white/80"
        onClick={() => navigate('/')}
      >
        <ArrowLeftCircle className="w-6 h-6" />
      </Button>

      {/* Pre-built template banner */}
      <div className="bg-navy/20 text-white/90 px-4 py-2 rounded-lg mb-8 inline-flex items-center gap-2">
        <span>This is a pre-built template.</span>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto space-y-12">
        <p className="text-3xl leading-relaxed">
          When{' '}
          <Select onValueChange={setSelectedColumn}>
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
          <Select onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40 inline-flex bg-transparent border-b-2 border-white/50 rounded-none text-white">
              <SelectValue placeholder="Select a Column first" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="working">Working on it</SelectItem>
              <SelectItem value="stuck">Stuck</SelectItem>
            </SelectContent>
          </Select>
          , add a row in{' '}
          <Input 
            value={spreadsheet}
            onChange={(e) => setSpreadsheet(e.target.value)}
            className="w-40 inline-flex bg-transparent border-b-2 border-white/50 rounded-none text-white px-0"
            placeholder="Spreadsheet"
          />
          {' '}/{' '}
          <Input 
            value={sheet}
            onChange={(e) => setSheet(e.target.value)}
            className="w-32 inline-flex bg-transparent border-b-2 border-white/50 rounded-none text-white px-0"
            placeholder="Sheet"
          />
          {' '}with these{' '}
          <Input 
            value={values}
            onChange={(e) => setValues(e.target.value)}
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
          src="/lovable-uploads/55c54574-060a-410d-8dd8-64cf691dc4bb.png" 
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
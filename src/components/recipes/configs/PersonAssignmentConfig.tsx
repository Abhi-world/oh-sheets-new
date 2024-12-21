import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RecipeConfigLayout from '../RecipeConfigLayout';
import { toast } from 'sonner';

const PersonAssignmentConfig = () => {
  const [person, setPerson] = useState('');
  const [spreadsheet, setSpreadsheet] = useState('');
  const [sheet, setSheet] = useState('');
  const [values, setValues] = useState('');

  const handleCreateAutomation = () => {
    if (!person || !spreadsheet || !sheet || !values) {
      toast.error('Please fill in all fields');
      return;
    }
    
    toast.success('Automation created successfully');
  };

  return (
    <RecipeConfigLayout title="Person Assignment Integration">
      <div className="space-y-12">
        <p className="text-2xl leading-relaxed">
          When{' '}
          <Input
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            className="w-40 inline-block mx-1 bg-transparent border-b border-t-0 border-x-0 rounded-none text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:border-white"
            placeholder="person"
          />
          {' '}is assigned, add a row in{' '}
          <Input
            value={spreadsheet}
            onChange={(e) => setSpreadsheet(e.target.value)}
            className="w-40 inline-block mx-1 bg-transparent border-b border-t-0 border-x-0 rounded-none text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:border-white"
            placeholder="Spreadsheet"
          />
          {' / '}
          <Input
            value={sheet}
            onChange={(e) => setSheet(e.target.value)}
            className="w-32 inline-block mx-1 bg-transparent border-b border-t-0 border-x-0 rounded-none text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:border-white"
            placeholder="Sheet"
          />
          {' '}with these{' '}
          <Input
            value={values}
            onChange={(e) => setValues(e.target.value)}
            className="w-40 inline-block mx-1 bg-transparent border-b border-t-0 border-x-0 rounded-none text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:border-white"
            placeholder="values"
          />
        </p>

        <Button
          onClick={handleCreateAutomation}
          className="bg-[#0073ea] hover:bg-[#0073ea]/90 text-white px-8"
          size="lg"
        >
          Create automation
        </Button>
      </div>
    </RecipeConfigLayout>
  );
};

export default PersonAssignmentConfig;
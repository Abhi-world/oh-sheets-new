import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import ValueSelector from '@/components/shared/ValueSelector';
import { Search, ChevronDown } from 'lucide-react';
import RecipeConfigShell from '../shared/RecipeConfigShell';
import { Button } from '@/components/ui/button';

const GroupMoveConfig = ({ onConfigValid }: { onConfigValid?: (isValid: boolean) => void }) => {
  const [groupName, setGroupName] = useState('');
  const [values, setValues] = useState('');
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  // Mock groups for demo - in production this would come from Monday.com API
  const groups = [
    { id: '1', name: 'To-Do' },
    { id: '2', name: 'In Progress' },
    { id: '3', name: 'Done' },
    { id: '4', name: 'Blocked' }
  ];

  // Validate configuration
  useEffect(() => {
    if (onConfigValid) {
      const isValid = groupName.trim() !== '' && 
                     selectedSpreadsheet !== '' && 
                     selectedSheet !== '';
      onConfigValid(isValid);
    }
  }, [groupName, selectedSpreadsheet, selectedSheet, onConfigValid]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7B61FF] via-[#9B87F5] to-[#7E69AB] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1F2937] rounded-lg p-8">
          <div className="space-y-8">
            <div className="bg-[#111827] p-6 rounded-lg">
              <p className="text-2xl leading-relaxed text-white">
                When items are moved to group{' '}
                <Select 
                  value={groupName} 
                  onValueChange={setGroupName}
                >
                  <SelectTrigger className="w-48 inline-flex bg-[#374151] hover:bg-[#4B5563] border-none text-white">
                    <SelectValue placeholder="Select group" />
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1F2937] border border-white/10">
                    <div className="flex items-center px-3 py-2 border-b border-white/10">
                      <Search className="w-4 h-4 text-white/50 mr-2" />
                      <Input 
                        placeholder="Search groups..."
                        className="border-none bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0"
                      />
                    </div>
                    {groups.map((group) => (
                      <SelectItem 
                        key={group.id} 
                        value={group.name}
                        className="text-white hover:bg-white/10"
                      >
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {', '}add a row in{' '}
                <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
                  <SelectTrigger className="w-48 inline-flex bg-[#374151] hover:bg-[#4B5563] border-none text-white">
                    <SelectValue placeholder="Select spreadsheet" />
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1F2937] border border-white/10">
                    {spreadsheets.map((s) => (
                      <SelectItem 
                        key={s.id} 
                        value={s.id} 
                        className="text-white hover:bg-white/10"
                      >
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {' / '}
                <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                  <SelectTrigger className="w-36 inline-flex bg-[#374151] hover:bg-[#4B5563] border-none text-white">
                    <SelectValue placeholder="Select sheet" />
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1F2937] border border-white/10">
                    {sheets.map((s) => (
                      <SelectItem 
                        key={s.id} 
                        value={s.id}
                        className="text-white hover:bg-white/10"
                      >
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {' with these '}
                <span className="text-white font-semibold bg-[#374151] px-2 py-1 rounded">values</span>
                {': '}
                <div className="inline-block w-40">
                  <ValueSelector
                    value={values}
                    onChange={setValues}
                  />
                </div>
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button 
                className="bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white px-8 py-2 rounded-full text-lg"
              >
                Create Automation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupMoveConfig;
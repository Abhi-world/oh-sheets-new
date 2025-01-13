import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import ValueSelector from '@/components/shared/ValueSelector';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const FormSubmissionConfig = () => {
  const [formId, setFormId] = useState('');
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  return (
    <div className="flex flex-col">
      <div className="bg-[#111827] text-white p-6 rounded-lg">
        <p className="text-xl leading-relaxed text-white">
          When form is submitted, add a row in{' '}
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-xl text-white underline decoration-dotted hover:decoration-solid">
                {selectedSpreadsheet ? spreadsheets.find(s => s.id === selectedSpreadsheet)?.name : 'spreadsheet'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] bg-navy-dark border-none p-2">
              {spreadsheets.map(sheet => (
                <button
                  key={sheet.id}
                  className="w-full text-left px-2 py-1.5 text-white hover:bg-white/10 rounded"
                  onClick={() => setSelectedSpreadsheet(sheet.id)}
                >
                  {sheet.name}
                </button>
              ))}
            </PopoverContent>
          </Popover>
          {' / '}
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-xl text-white underline decoration-dotted hover:decoration-solid">
                {selectedSheet ? sheets.find(s => s.id === selectedSheet)?.name : 'sheet'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] bg-navy-dark border-none p-2">
              {sheets.map(sheet => (
                <button
                  key={sheet.id}
                  className="w-full text-left px-2 py-1.5 text-white hover:bg-white/10 rounded"
                  onClick={() => setSelectedSheet(sheet.id)}
                >
                  {sheet.name}
                </button>
              ))}
            </PopoverContent>
          </Popover>
          {' '}with these{' '}
          <ValueSelector
            value={formId}
            onChange={setFormId}
            className="text-xl text-white underline decoration-dotted hover:decoration-solid inline-flex items-center"
          />
        </p>
      </div>
    </div>
  );
};

export default FormSubmissionConfig;
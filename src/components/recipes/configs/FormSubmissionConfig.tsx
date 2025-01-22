import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import ValueSelector from '@/components/shared/ValueSelector';
import SheetSelector from '@/components/shared/SheetSelector';

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
      <div className="bg-[#111827] text-white p-6 rounded-lg mb-4">
        <p className="text-xl leading-relaxed text-white">
          When form is submitted, add a row in{' '}
          <SheetSelector
            items={spreadsheets}
            selectedId={selectedSpreadsheet}
            onSelect={setSelectedSpreadsheet}
            placeholder="spreadsheet"
            className="text-xl"
          />
          {' / '}
          <SheetSelector
            items={sheets}
            selectedId={selectedSheet}
            onSelect={setSelectedSheet}
            placeholder="sheet"
            className="text-xl"
          />
          {' with these '}
          <ValueSelector
            value={formId}
            onChange={setFormId}
            placeholder="values"
            className="text-xl text-white underline decoration-dotted hover:decoration-solid inline-flex items-center"
          />
        </p>
      </div>
    </div>
  );
};

export default FormSubmissionConfig;
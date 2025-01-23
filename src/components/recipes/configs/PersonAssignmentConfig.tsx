import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import PersonTypeSelector from './person-assignment/PersonTypeSelector';
import SheetSelector from './person-assignment/SheetSelector';
import ColumnCenterModal from './person-assignment/ColumnCenterModal';

const PersonAssignmentConfig = () => {
  const [personType, setPersonType] = useState('');
  const [showColumnCenter, setShowColumnCenter] = useState(false);
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
        <p className="text-2xl leading-relaxed text-white">
          When{' '}
          <PersonTypeSelector
            personType={personType}
            setPersonType={setPersonType}
            onAddColumn={() => setShowColumnCenter(true)}
          />
          {' '}is assigned, add a row in{' '}
          <SheetSelector
            items={spreadsheets}
            selectedId={selectedSpreadsheet}
            onSelect={setSelectedSpreadsheet}
            placeholder="spreadsheet"
            className="text-2xl"
          />
          {' / '}
          <SheetSelector
            items={sheets}
            selectedId={selectedSheet}
            onSelect={setSelectedSheet}
            placeholder="sheet"
            className="text-2xl"
          />
        </p>
      </div>

      <ColumnCenterModal
        open={showColumnCenter}
        onOpenChange={setShowColumnCenter}
      />
    </div>
  );
};

export default PersonAssignmentConfig;
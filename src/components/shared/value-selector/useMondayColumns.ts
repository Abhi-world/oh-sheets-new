import { useState, useEffect } from 'react';

export const useMondayColumns = (selectedColumn?: string) => {
  const [columnValues, setColumnValues] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedColumn) return;

    // Mock column values for testing
    const mockValues = {
      "status1": ["Working on it", "Done", "Stuck", "In Review"],
      "status2": ["High", "Medium", "Low"],
    };

    console.log("Setting mock values for column:", selectedColumn);
    setColumnValues(mockValues[selectedColumn as keyof typeof mockValues] || []);
  }, [selectedColumn]);

  return { columnValues };
};
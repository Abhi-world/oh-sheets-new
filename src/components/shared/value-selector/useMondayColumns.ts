import { useState, useEffect } from 'react';

export const useMondayColumns = (selectedColumn?: string) => {
  const [columnValues, setColumnValues] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedColumn) return;

    // Mock column values for testing
    const mockValues = {
      "status": ["Working on it", "Done", "Stuck", "In Review"],
      "priority": ["High", "Medium", "Low"],
      "text": ["Task 1", "Task 2", "Task 3"],
      "person": ["John Doe", "Jane Smith", "Alex Johnson"],
      "date": ["Today", "Tomorrow", "Next Week"],
      "numbers": ["1", "2", "3", "4", "5"],
      "dropdown": ["Option 1", "Option 2", "Option 3"],
      "default": ["Value 1", "Value 2", "Value 3"]
    };

    console.log("Setting mock values for column:", selectedColumn);
    setColumnValues(mockValues[selectedColumn as keyof typeof mockValues] || mockValues.default);
  }, [selectedColumn]);

  return { columnValues };
};
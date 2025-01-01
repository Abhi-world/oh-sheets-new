import { useState, useEffect } from 'react';
import { getMondayApiKey } from '@/utils/monday';

export const useMondayColumns = (selectedColumn?: string) => {
  const [columnValues, setColumnValues] = useState<string[]>([]);

  useEffect(() => {
    fetchColumnValues();
  }, [selectedColumn]);

  const fetchColumnValues = async () => {
    if (!selectedColumn) return;

    try {
      const apiKey = await getMondayApiKey();
      if (!apiKey) {
        console.error('Monday.com API key not found');
        return;
      }

      const query = `
        query {
          boards {
            columns {
              id
              title
              type
              settings_str
            }
          }
        }
      `;

      const response = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch column values');
      }

      const data = await response.json();
      console.log('Monday.com column values:', data);

      if (data.data?.boards?.[0]?.columns) {
        const selectedCol = data.data.boards[0].columns.find(
          (col: any) => col.id === selectedColumn
        );

        if (selectedCol?.settings_str) {
          const settings = JSON.parse(selectedCol.settings_str);
          if (settings.labels) {
            setColumnValues(Object.values(settings.labels));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching column values:', error);
    }
  };

  return { columnValues };
};
import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { toast } from 'sonner';

interface SpreadsheetSelectorProps {
  selectedSpreadsheet: string;
  onSpreadsheetSelect: (spreadsheetId: string) => void;
  className?: string;
  placeholder?: string;
}

const SpreadsheetSelector = ({ 
  selectedSpreadsheet, 
  onSpreadsheetSelect, 
  className,
  placeholder = "select..." 
}: SpreadsheetSelectorProps) => {
  const { spreadsheets, isLoading, fetchSpreadsheets, forceSheetsFetch } = useGoogleSheets();

  // Force fetch spreadsheets on component mount
  useEffect(() => {
    console.log('SpreadsheetSelector mounted, fetching spreadsheets');
    // Force immediate fetch with a slight delay to ensure proper loading
    setTimeout(() => {
      fetchSpreadsheets();
    }, 100);
  }, []);
  
  // Add a second fetch attempt if spreadsheets are empty
  useEffect(() => {
    if (spreadsheets.length === 0 && !isLoading) {
      console.log('No spreadsheets found, attempting second fetch');
      fetchSpreadsheets();
    }
  }, [spreadsheets, isLoading, fetchSpreadsheets]);

  // Handle spreadsheet selection with improved error handling
  const handleSpreadsheetSelect = (id: string) => {
    console.log('Selected spreadsheet:', id);
    onSpreadsheetSelect(id);
    
    // Force fetch sheets for this spreadsheet
    if (id) {
      forceSheetsFetch(id);
    }
  };

  // Force fetch when dropdown is opened
  const handleOpenChange = (open: boolean) => {
    if (open) {
      console.log('Dropdown opened, fetching spreadsheets');
      console.log('Network request to gs-list-spreadsheets will be triggered');
      // Add a visual indicator that we're fetching
      toast.info('Fetching spreadsheets...');
      
      // Force immediate fetch with no caching
      fetchSpreadsheets()
        .then(result => {
          console.log('Fetch result:', result);
          if (result && result.length > 0) {
            toast.success(`Found ${result.length} spreadsheets`);
          } else {
            console.warn('No spreadsheets found or empty result');
            toast.warning('No spreadsheets found. You may need to re-consent with Google.');
          }
        })
        .catch(err => {
          console.error('Error fetching spreadsheets:', err);
          toast.error('Failed to fetch spreadsheets. Check console for details.');
        });
    }
  };

  return (
    <Select 
      value={selectedSpreadsheet} 
      onValueChange={handleSpreadsheetSelect}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger 
        className={`bg-transparent border-none p-0 h-auto underline decoration-dotted hover:decoration-solid ${className}`}
        onClick={() => fetchSpreadsheets()}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-navy-dark border-none">
        {spreadsheets.length === 0 && !isLoading && (
          <SelectItem value="no-spreadsheets" disabled>
            No spreadsheets found. Click to refresh.
          </SelectItem>
        )}
        {isLoading && (
          <SelectItem value="loading" disabled>
            Loading spreadsheets...
          </SelectItem>
        )}
        {spreadsheets.map((s) => (
          <SelectItem 
            key={s.id} 
            value={s.id} 
            className="text-white hover:bg-white/10"
          >
            {s.name}
          </SelectItem>
        ))}
        {spreadsheets.length > 0 && (
          <button 
            className="w-full text-center py-2 text-white/70 hover:text-white hover:bg-white/10 text-sm"
            onClick={(e) => {
              e.preventDefault();
              fetchSpreadsheets();
            }}
          >
            Refresh spreadsheets
          </button>
        )}
      </SelectContent>
    </Select>
  );
};

export default SpreadsheetSelector;
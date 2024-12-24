import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnMappingData } from '@/types/trigger';

interface ColumnMappingsProps {
  mappings: ColumnMappingData[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof ColumnMappingData, value: string) => void;
  onRemove: (index: number) => void;
}

const ColumnMappings = ({
  mappings,
  onAdd,
  onUpdate,
  onRemove,
}: ColumnMappingsProps) => {
  const dataTypes = [
    { value: 'budget', label: 'Budget Value' },
    { value: 'date', label: 'Due Date' },
    { value: 'id', label: 'Item/Task ID' },
    { value: 'name', label: 'Name' },
    { value: 'owner', label: 'Owner Assignment' },
    { value: 'priority', label: 'Priority Level' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Column Mappings</h3>
        <Button 
          onClick={onAdd}
          variant="outline" 
          className="border-google-green text-google-green hover:bg-google-green/10"
        >
          Add Mapping
        </Button>
      </div>

      {mappings.map((mapping, index) => (
        <div key={index} className="grid grid-cols-3 gap-4 items-center">
          <Input
            value={mapping.sourceColumn}
            onChange={(e) => onUpdate(index, 'sourceColumn', e.target.value)}
            placeholder="Source column"
            className="bg-navy-light border-google-green"
          />
          <Input
            value={mapping.targetColumn}
            onChange={(e) => onUpdate(index, 'targetColumn', e.target.value)}
            placeholder="Target column"
            className="bg-navy-light border-google-green"
          />
          <div className="flex gap-2">
            <Select 
              value={mapping.dataType} 
              onValueChange={(value) => onUpdate(index, 'dataType', value)}
            >
              <SelectTrigger className="bg-navy-light border-google-green">
                <SelectValue placeholder="Data type" />
              </SelectTrigger>
              <SelectContent>
                {dataTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => onRemove(index)}
              variant="destructive"
              size="icon"
            >
              ×
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ColumnMappings;
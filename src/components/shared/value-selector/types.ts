export interface ColumnValue {
  id: string;
  title: string;
  type: string;
  settings?: {
    labels?: { [key: string]: string };
  };
}

export interface ValueSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  columns?: ColumnValue[];
  selectedColumn?: string;
  onColumnSelect?: (columnId: string) => void;
  className?: string;  // Added className prop
}
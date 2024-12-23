import { Json } from '@/integrations/supabase/types';

export interface ColumnMappingData {
  sourceColumn: string;
  targetColumn: string;
  dataType: string;
}

// This type ensures compatibility with Supabase's Json type
export type ColumnMapping = Record<string, string>;

export interface TriggerConfig {
  triggerDate: string;
  triggerTime?: string;
  isRelative?: boolean;
  relativeDays?: number;
  relativeDirection?: 'before' | 'after';
  spreadsheetId: string;
  sheetId: string;
  columnMappings: ColumnMappingData[]; // Changed from ColumnMapping[] to ColumnMappingData[]
}

// Helper function to convert ColumnMappingData to ColumnMapping
export const convertToColumnMapping = (data: ColumnMappingData): ColumnMapping => ({
  sourceColumn: data.sourceColumn,
  targetColumn: data.targetColumn,
  dataType: data.dataType,
});

// Helper function to convert ColumnMapping to ColumnMappingData
export const convertFromColumnMapping = (mapping: ColumnMapping): ColumnMappingData => ({
  sourceColumn: mapping.sourceColumn,
  targetColumn: mapping.targetColumn,
  dataType: mapping.dataType,
});
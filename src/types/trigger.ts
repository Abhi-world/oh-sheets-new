export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  dataType: string;
}

export interface TriggerConfig {
  triggerDate: string;
  triggerTime?: string;
  isRelative?: boolean;
  relativeDays?: number;
  relativeDirection?: 'before' | 'after';
  spreadsheetId: string;
  sheetId: string;
  columnMappings: ColumnMapping[];
}
import React from 'react';
import RecipeCard from './RecipeCard';
import DateTriggerForm from '@/components/DateTriggerForm';
import PeriodicExportForm from '@/components/PeriodicExportForm';
import StatusTriggerForm from '@/components/StatusTriggerForm';
import ItemCreationTriggerForm from '@/components/ItemCreationTriggerForm';
import ColumnChangeTriggerForm from '@/components/ColumnChangeTriggerForm';
import PersonAssignmentTriggerForm from '@/components/PersonAssignmentTriggerForm';
import CustomValueTriggerForm from '@/components/CustomValueTriggerForm';
import FormSubmissionTriggerForm from '@/components/FormSubmissionTriggerForm';
import ButtonClickTriggerForm from '@/components/ButtonClickTriggerForm';

const recipes = [
  {
    title: "Date-Based Automation",
    description: "Automatically add data to Google Sheets when a specific date is reached in Monday.com",
    category: "Date Triggers",
    component: DateTriggerForm
  },
  {
    title: "Scheduled Data Export",
    description: "Set up regular data exports from Monday.com to Google Sheets",
    category: "Scheduled Tasks",
    component: PeriodicExportForm
  },
  {
    title: "Status Change Sync",
    description: "Monitor status changes in Monday.com and sync with Google Sheets",
    category: "Status Triggers",
    component: StatusTriggerForm
  },
  {
    title: "New Item Sync",
    description: "Automatically add new rows to Google Sheets for new Monday.com items",
    category: "Item Triggers",
    component: ItemCreationTriggerForm
  },
  {
    title: "Column Value Monitor",
    description: "Track changes in specific Monday.com columns and sync to Sheets",
    category: "Column Triggers",
    component: ColumnChangeTriggerForm
  },
  {
    title: "Team Member Assignment",
    description: "Sync person column changes from Monday.com to Sheets",
    category: "Assignment Triggers",
    component: PersonAssignmentTriggerForm
  },
  {
    title: "Custom Value Integration",
    description: "Create custom triggers based on specific values in Monday.com",
    category: "Custom Triggers",
    component: CustomValueTriggerForm
  },
  {
    title: "Form Response Sync",
    description: "Automatically sync Monday.com form submissions to Sheets",
    category: "Form Triggers",
    component: FormSubmissionTriggerForm
  },
  {
    title: "Button Action Sync",
    description: "Trigger data sync when specific buttons are clicked",
    category: "Button Triggers",
    component: ButtonClickTriggerForm
  }
];

const RecipeGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe, index) => (
        <RecipeCard
          key={index}
          title={recipe.title}
          description={recipe.description}
          category={recipe.category}
          Component={recipe.component}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;
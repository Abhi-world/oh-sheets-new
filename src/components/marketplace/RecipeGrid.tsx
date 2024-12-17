import React from 'react';
import RecipeCard from './RecipeCard';
import { 
  CalendarDays, 
  ClipboardCheck, 
  FileSpreadsheet,
  UserPlus,
  MousePointerClick,
  LayoutGrid,
  Clock,
  Send,
  FileInput
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const recipes = [
  {
    id: 'status-change',
    title: "Status Change Sync",
    description: "When a status changes in Monday.com, automatically add a new row to your Google Sheet with specified values.",
    category: "Status Triggers",
    icon: <ClipboardCheck className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'date-trigger',
    title: "Date-Based Sync",
    description: "Add data to Google Sheets when a specific date is reached in Monday.com items.",
    category: "Date Triggers",
    icon: <CalendarDays className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'group-move',
    title: "Group Movement Sync",
    description: "When items are moved to a specific group, automatically add their data to Google Sheets.",
    category: "Group Triggers",
    icon: <LayoutGrid className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'periodic-export',
    title: "Scheduled Export",
    description: "Automatically export Monday.com data to Google Sheets on a regular schedule.",
    category: "Time Triggers",
    icon: <Clock className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'form-submission',
    title: "Form Response Sync",
    description: "When a Monday.com form is submitted, automatically add the responses to Google Sheets.",
    category: "Form Triggers",
    icon: <FileInput className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'person-assignment',
    title: "Person Assignment Sync",
    description: "When someone is assigned to an item, add relevant data to your Google Sheet.",
    category: "Assignment Triggers",
    icon: <UserPlus className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'button-click',
    title: "Button Click Sync",
    description: "Trigger a Google Sheets update when specific buttons are clicked in Monday.com.",
    category: "Button Triggers",
    icon: <MousePointerClick className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'column-change',
    title: "Column Value Monitor",
    description: "Monitor specific column changes and sync the updates to Google Sheets.",
    category: "Column Triggers",
    icon: <FileSpreadsheet className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'item-creation',
    title: "New Item Sync",
    description: "Automatically add new rows to Google Sheets when items are created in Monday.com.",
    category: "Item Triggers",
    icon: <Send className="w-5 h-5 text-[#00c875]" />
  }
];

const RecipeGrid = () => {
  const navigate = useNavigate();

  const handleRecipeClick = (recipeId: string) => {
    navigate(`/recipe/${recipeId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          title={recipe.title}
          description={recipe.description}
          category={recipe.category}
          icon={recipe.icon}
          onClick={() => handleRecipeClick(recipe.id)}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;
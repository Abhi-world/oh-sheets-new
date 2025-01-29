import React from 'react';
import RecipeCard from './RecipeCard';
import { 
  CalendarDays, 
  ClipboardCheck, 
  MousePointerClick,
  LayoutGrid,
  Clock,
  Send,
  FileInput,
  UserPlus,
  FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const recipes = [
  {
    id: 'status-change',
    title: "Status Change Sync",
    description: "When status changes, add a row in Google Sheets with these values.",
    category: "Status Triggers",
    icon: <ClipboardCheck className="w-5 h-5 text-[#0F9D58]" />
  },
  {
    id: 'date-trigger',
    title: "Date-Based Sync",
    description: "When date is reached, add a row in Google Sheets with these values.",
    category: "Date Triggers",
    icon: <CalendarDays className="w-5 h-5 text-[#0F9D58]" />
  },
  {
    id: 'group-move',
    title: "Group Movement Sync",
    description: "When items are moved to a group, add a row in Google Sheets with these values.",
    category: "Group Triggers",
    icon: <LayoutGrid className="w-5 h-5 text-[#0F9D58]" />
  },
  {
    id: 'periodic-export',
    title: "Scheduled Export",
    description: "Every hour/day/week/month, add a row in Google Sheets with these values.",
    category: "Time Triggers",
    icon: <Clock className="w-5 h-5 text-[#0F9D58]" />
  },
  {
    id: 'form-submission',
    title: "Form Response Sync",
    description: "When form is submitted, add a row in Google Sheets with these values.",
    category: "Form Triggers",
    icon: <Send className="w-5 h-5 text-[#0F9D58]" />
  },
  {
    id: 'person-assignment',
    title: "Person Assignment Sync",
    description: "When person is assigned, add a row in Google Sheets with these values.",
    category: "Assignment Triggers",
    icon: <UserPlus className="w-5 h-5 text-[#0F9D58]" />
  },
  {
    id: 'button-click',
    title: "Button Click Sync",
    description: "When button clicked, add a row in Google Sheets with these values.",
    category: "Button Triggers",
    icon: <MousePointerClick className="w-5 h-5 text-[#0F9D58]" />
  },
  {
    id: 'column-change',
    title: "Column Value Monitor",
    description: "When column changes, add a row in Google Sheets with these values.",
    category: "Column Triggers",
    icon: <FileInput className="w-5 h-5 text-[#0F9D58]" />
  },
  {
    id: 'item-creation',
    title: "New Item Sync",
    description: "When an item is created, add a row in Google Sheets with these values.",
    category: "Item Triggers",
    icon: <FileSpreadsheet className="w-5 h-5 text-[#0F9D58]" />
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
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
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 512 512"
    className="w-5 h-5"
  >
    <rect width="512" height="512" rx="51.2" fill="#00c875"/>
    <path 
      d="M 307.2 128 H 179.2 C 167.6 128 156.4 132.8 148 141.2 C 139.6 149.6 134.8 160.8 134.8 172.4 V 339.6 C 134.8 351.2 139.6 362.4 148 370.8 C 156.4 379.2 167.6 384 179.2 384 H 332.8 C 344.4 384 355.6 379.2 364 370.8 C 372.4 362.4 377.2 351.2 377.2 339.6 V 198 L 307.2 128 Z" 
      fill="none" 
      stroke="white" 
      strokeWidth="22"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path 
      d="M 307.2 128 V 198 H 377.2" 
      fill="none" 
      stroke="white" 
      strokeWidth="22"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path 
      d="M 179.2 268 H 332.8" 
      fill="none" 
      stroke="white" 
      strokeWidth="22"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path 
      d="M 256 233 V 303" 
      fill="none" 
      stroke="white" 
      strokeWidth="22"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const recipes = [
  {
    id: 'status-change',
    title: "Status Change Sync",
    description: "When status changes, add a row in Google Sheets with these values.",
    category: "Status Triggers",
    icon: <ClipboardCheck className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'date-trigger',
    title: "Date-Based Sync",
    description: "When date is reached, add a row in Google Sheets with these values.",
    category: "Date Triggers",
    icon: <CalendarDays className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'group-move',
    title: "Group Movement Sync",
    description: "When items are moved to a group, add a row in Google Sheets with these values.",
    category: "Group Triggers",
    icon: <LayoutGrid className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'periodic-export',
    title: "Scheduled Export",
    description: "Every hour/day/week/month, add a row in Google Sheets with these values.",
    category: "Time Triggers",
    icon: <Clock className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'form-submission',
    title: "Form Response Sync",
    description: "When form is submitted, add a row in Google Sheets with these values.",
    category: "Form Triggers",
    icon: <FileInput className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'person-assignment',
    title: "Person Assignment Sync",
    description: "When person is assigned, add a row in Google Sheets with these values.",
    category: "Assignment Triggers",
    icon: <UserPlus className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'button-click',
    title: "Button Click Sync",
    description: "When button clicked, add a row in Google Sheets with these values.",
    category: "Button Triggers",
    icon: <MousePointerClick className="w-5 h-5 text-[#00c875]" />
  },
  {
    id: 'column-change',
    title: "Column Value Monitor",
    description: "When column changes, add a row in Google Sheets with these values.",
    category: "Column Triggers",
    icon: <AppIcon />
  },
  {
    id: 'item-creation',
    title: "New Item Sync",
    description: "When an item is created, add a row in Google Sheets with these values.",
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
          icon={React.cloneElement(recipe.icon, { className: 'w-5 h-5 text-[#0F9D58]' })}
          onClick={() => handleRecipeClick(recipe.id)}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;
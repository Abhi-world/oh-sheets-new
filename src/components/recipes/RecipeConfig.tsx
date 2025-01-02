import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RecipeConfigLayout from './RecipeConfigLayout';
import StatusChangeConfig from './configs/StatusChangeConfig';
import DateTriggerConfig from './configs/DateTriggerConfig';
import GroupMoveConfig from './configs/GroupMoveConfig';
import PeriodicExportConfig from './configs/PeriodicExportConfig';
import FormSubmissionConfig from './configs/FormSubmissionConfig';
import PersonAssignmentConfig from './configs/PersonAssignmentConfig';
import ButtonClickConfig from './configs/ButtonClickConfig';
import ColumnChangeConfig from './configs/ColumnChangeConfig';
import ItemCreationConfig from './configs/ItemCreationConfig';
import { toast } from 'sonner';

interface ConfigComponentProps {
  onConfigValid: (isValid: boolean) => void;
}

const recipeConfigs: Record<string, { 
  component: React.ComponentType<ConfigComponentProps>, 
  title: string 
}> = {
  'status-change': {
    component: StatusChangeConfig,
    title: 'Status Change Integration'
  },
  'date-trigger': {
    component: DateTriggerConfig,
    title: 'Date-Based Integration'
  },
  'group-move': {
    component: GroupMoveConfig,
    title: 'Group Movement Integration'
  },
  'periodic-export': {
    component: PeriodicExportConfig,
    title: 'Scheduled Export'
  },
  'form-submission': {
    component: FormSubmissionConfig,
    title: 'Form Response Integration'
  },
  'person-assignment': {
    component: PersonAssignmentConfig,
    title: 'Person Assignment Integration'
  },
  'button-click': {
    component: ButtonClickConfig,
    title: 'Button Click Integration'
  },
  'column-change': {
    component: ColumnChangeConfig,
    title: 'Column Change Integration'
  },
  'item-creation': {
    component: ItemCreationConfig,
    title: 'New Item Integration'
  }
};

const RecipeConfig = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [isConfigValid, setIsConfigValid] = useState(false);

  if (!recipeId || !recipeConfigs[recipeId]) {
    return <div>Recipe not found</div>;
  }

  const config = recipeConfigs[recipeId];
  const ConfigComponent = config.component;

  const handleCreateAutomation = () => {
    if (!isConfigValid) {
      toast.error('Please complete all required fields');
      return;
    }
    
    // TODO: Implement automation creation
    console.log('Creating automation with current configuration');
    toast.success('Automation created successfully');
    navigate('/');
  };

  return (
    <RecipeConfigLayout title={config.title}>
      <ConfigComponent onConfigValid={setIsConfigValid} />
      <div className="mt-8 flex justify-end">
        <Button 
          size="lg"
          className="bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white"
          onClick={handleCreateAutomation}
          disabled={!isConfigValid}
        >
          Create Automation
        </Button>
      </div>
    </RecipeConfigLayout>
  );
};

export default RecipeConfig;
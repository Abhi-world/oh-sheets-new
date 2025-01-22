import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import RecipeConfigSkeleton from '@/components/skeletons/RecipeConfigSkeleton';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useState } from 'react';

const RecipeConfig = () => {
  const { recipeId } = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');
  
  const { data: recipeData, isLoading } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async () => {
      console.log('Fetching recipe configuration for:', recipeId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        name: 'Sample Recipe',
        description: 'This is a sample recipe description',
        trigger: 'monday_item_created',
        action: 'create_sheet_row'
      };
    }
  });

  const handleSave = async () => {
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Recipe configuration saved successfully!');
    } catch (error) {
      toast.error('Failed to save recipe configuration');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <RecipeConfigSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Recipe Name</Label>
            <Input
              id="name"
              value={name || recipeData?.name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter recipe name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description || recipeData?.description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter recipe description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger">Trigger</Label>
            <Select value={trigger || recipeData?.trigger} onValueChange={setTrigger}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday_item_created">Item Created in Monday</SelectItem>
                <SelectItem value="monday_item_updated">Item Updated in Monday</SelectItem>
                <SelectItem value="monday_status_changed">Status Changed in Monday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Select value={action || recipeData?.action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create_sheet_row">Create Row in Sheet</SelectItem>
                <SelectItem value="update_sheet_row">Update Row in Sheet</SelectItem>
                <SelectItem value="delete_sheet_row">Delete Row in Sheet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecipeConfig;
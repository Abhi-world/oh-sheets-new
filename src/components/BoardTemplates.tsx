import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Briefcase, Code, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { useMonday } from '@/hooks/useMonday';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  columns: Array<{
    title: string;
    type: string;
  }>;
  groups: Array<{
    title: string;
  }>;
}

const templates: Template[] = [
  {
    id: 'dev',
    name: 'Development Sprint Board',
    description: 'Track development tasks, bugs, and feature requests',
    icon: <Code className="w-6 h-6" />,
    columns: [
      { title: 'Priority', type: 'status' },
      { title: 'Status', type: 'status' },
      { title: 'Due Date', type: 'date' },
      { title: 'Owner', type: 'person' },
      { title: 'Story Points', type: 'numbers' }
    ],
    groups: [
      { title: 'Backlog' },
      { title: 'In Progress' },
      { title: 'Code Review' },
      { title: 'Done' }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign Board',
    description: 'Plan and execute marketing campaigns',
    icon: <Megaphone className="w-6 h-6" />,
    columns: [
      { title: 'Campaign Status', type: 'status' },
      { title: 'Launch Date', type: 'date' },
      { title: 'Budget', type: 'numbers' },
      { title: 'Channel', type: 'text' },
      { title: 'Owner', type: 'person' }
    ],
    groups: [
      { title: 'Planning' },
      { title: 'Content Creation' },
      { title: 'Review' },
      { title: 'Live' }
    ]
  },
  {
    id: 'hr',
    name: 'HR Recruitment Board',
    description: 'Manage recruitment pipeline and candidates',
    icon: <Briefcase className="w-6 h-6" />,
    columns: [
      { title: 'Application Status', type: 'status' },
      { title: 'Interview Date', type: 'date' },
      { title: 'Position', type: 'text' },
      { title: 'Recruiter', type: 'person' },
      { title: 'Experience Level', type: 'text' }
    ],
    groups: [
      { title: 'New Applications' },
      { title: 'Screening' },
      { title: 'Interviewing' },
      { title: 'Offer Stage' },
      { title: 'Hired' }
    ]
  }
];

const BoardTemplates = () => {
  const { data: mondayData } = useMonday();

  const createBoard = async (template: Template) => {
    try {
      console.log('Creating board from template:', template.name);
      // Here we'll implement the Monday.com API call to create a board
      // This is a placeholder for now
      toast.success(`Template "${template.name}" applied successfully!`);
    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('Failed to create board from template');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Copy className="w-5 h-5 text-monday-blue" />
          Board Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="border-2 hover:border-monday-blue transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {template.icon}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Columns:</h4>
                      <ul className="text-sm space-y-1">
                        {template.columns.map((column, index) => (
                          <li key={index} className="text-gray-600">
                            • {column.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Groups:</h4>
                      <ul className="text-sm space-y-1">
                        {template.groups.map((group, index) => (
                          <li key={index} className="text-gray-600">
                            • {group.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      onClick={() => createBoard(template)}
                      className="w-full bg-monday-blue hover:bg-monday-blue/90"
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BoardTemplates;
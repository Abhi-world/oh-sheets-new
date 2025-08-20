import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const formSchema = z.object({
  columnName: z.string().min(1, "Column name is required"),
  searchValues: z.string().min(1, "Search values are required"),
  newValues: z.string().min(1, "New values are required"),
  isActive: z.boolean().default(true),
});

interface Trigger {
  id: string;
  columnName: string;
  searchValues: string;
  newValues: string;
  isActive: boolean;
}

export default function ColumnChangeTriggerForm() {
  const [triggers, setTriggers] = React.useState<Trigger[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      columnName: "",
      searchValues: "",
      newValues: "",
      isActive: true,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newTrigger: Trigger = {
      id: crypto.randomUUID(),
      columnName: values.columnName,
      searchValues: values.searchValues,
      newValues: values.newValues,
      isActive: values.isActive,
    };

    setTriggers((prev) => [...prev, newTrigger]);
    form.reset();
    toast.success("Column change trigger created");
  }

  const deleteTrigger = (id: string) => {
    setTriggers((prev) => prev.filter((trigger) => trigger.id !== id));
    toast.success("Trigger deleted");
  };

  const toggleTrigger = (id: string) => {
    setTriggers((prev) =>
      prev.map((trigger) =>
        trigger.id === id
          ? { ...trigger, isActive: !trigger.isActive }
          : trigger
      )
    );
    toast.success("Trigger status updated");
  };

  return (
    <div className="space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="columnName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Column Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter column name" 
                  {...field}
                  className="bg-navy-light border-google-green focus:ring-google-green/50"
                />
              </FormControl>
              <FormDescription className="text-white/60">
                The name of the column to monitor for changes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="searchValues"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Search Values</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Value1, Value2, Value3" 
                  {...field}
                  className="bg-navy-light border-google-green focus:ring-google-green/50"
                />
              </FormControl>
              <FormDescription className="text-white/60">
                Comma-separated values to search for in the spreadsheet
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newValues"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">New Values</FormLabel>
              <FormControl>
                <Input 
                  placeholder="NewValue1, NewValue2, NewValue3" 
                  {...field}
                  className="bg-navy-light border-google-green focus:ring-google-green/50"
                />
              </FormControl>
              <FormDescription className="text-white/60">
                Comma-separated values to update in the spreadsheet
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-google-green/30 p-4 bg-navy-light/50">
              <div className="space-y-0.5">
                <FormLabel className="text-white">Active</FormLabel>
                <FormDescription className="text-white/60">
                  Enable or disable this trigger
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button 
          type="submit"
          className="bg-google-green hover:bg-google-green/90 text-navy font-medium"
        >
          Create Trigger
        </Button>
      </form>

      {triggers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Active Triggers</h3>
          {triggers.map((trigger) => (
            <Card
              key={trigger.id}
              className="bg-navy-light/50 border-google-green/30"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="font-medium text-white">
                    Column: <span className="text-google-green">{trigger.columnName}</span>
                  </p>
                  <p className="text-sm text-white/80">
                    Search: <span className="bg-navy-dark/60 px-2 py-1 rounded text-google-green">{trigger.searchValues}</span>
                  </p>
                  <p className="text-sm text-white/80">
                    Update: <span className="bg-navy-dark/60 px-2 py-1 rounded text-google-green">{trigger.newValues}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={trigger.isActive}
                    onCheckedChange={() => toggleTrigger(trigger.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTrigger(trigger.id)}
                    className="text-white hover:text-red-400 hover:bg-red-400/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
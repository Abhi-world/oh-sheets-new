import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";

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
    // Since our form schema ensures all fields are required, we can safely create the trigger
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="columnName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Column Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter column name" {...field} />
                </FormControl>
                <FormDescription>
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
                <FormLabel>Search Values</FormLabel>
                <FormControl>
                  <Input placeholder="Value1, Value2, Value3" {...field} />
                </FormControl>
                <FormDescription>
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
                <FormLabel>New Values</FormLabel>
                <FormControl>
                  <Input placeholder="NewValue1, NewValue2, NewValue3" {...field} />
                </FormControl>
                <FormDescription>
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
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>
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

          <Button type="submit">Create Trigger</Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Active Triggers</h3>
        {triggers.map((trigger) => (
          <div
            key={trigger.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="space-y-1">
              <p className="font-medium">Column: {trigger.columnName}</p>
              <p className="text-sm text-gray-500">
                Search: {trigger.searchValues}
              </p>
              <p className="text-sm text-gray-500">
                Update: {trigger.newValues}
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
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
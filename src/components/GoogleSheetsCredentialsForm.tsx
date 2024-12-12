import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const credentialsSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  client_secret: z.string().min(1, 'Client Secret is required'),
  refresh_token: z.string().min(1, 'Refresh Token is required'),
});

export default function GoogleSheetsCredentialsForm() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
  });

  const onSubmit = async (values: z.infer<typeof credentialsSchema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to save credentials');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          google_sheets_credentials: values,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Google Sheets credentials saved successfully');
      navigate('/');
    } catch (error) {
      console.error('Error saving Google Sheets credentials:', error);
      toast.error('Failed to save Google Sheets credentials');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Connect Google Sheets</CardTitle>
        <CardDescription>
          Enter your Google Sheets API credentials to enable integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Google Client ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    Found in your Google Cloud Console credentials
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Secret</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="Enter your Google Client Secret" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Your Google OAuth 2.0 client secret
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refresh_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refresh Token</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="Enter your Google Refresh Token" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The refresh token from OAuth 2.0 authorization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button type="submit">Save Credentials</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
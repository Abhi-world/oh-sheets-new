import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface FormData {
  apiKey: string;
}

export default function MondayApiKeyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ monday_api_key: data.apiKey })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast.success("Monday.com API key saved successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Connect Monday.com</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">Monday.com API Key</Label>
          <Input
            id="apiKey"
            type="password"
            {...register("apiKey", { required: "API key is required" })}
            placeholder="Enter your Monday.com API key"
          />
          {errors.apiKey && (
            <p className="text-sm text-red-500">{errors.apiKey.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save API Key"}
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            You can find your API key in your Monday.com account settings under the
            "Admin" section → "API".
          </p>
        </div>
      </form>
    </div>
  );
}
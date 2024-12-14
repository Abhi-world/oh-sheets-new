import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useMonday = () => {
  const fetchBoards = async () => {
    console.log("Fetching Monday.com boards...");
    
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) {
      console.error("No user found");
      throw new Error("No user found");
    }

    const { data: userData } = await supabase
      .from("profiles")
      .select("monday_api_key")
      .eq("id", profile.user.id)
      .single();

    if (!userData?.monday_api_key) {
      console.error("Monday.com API key not found");
      throw new Error("Please connect your Monday.com account first");
    }

    console.log("Making request to Monday.com API...");
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: userData.monday_api_key,
      },
      body: JSON.stringify({
        query: `
          query {
            boards {
              id
              name
              items {
                id
                name
                column_values {
                  id
                  title
                  value
                }
              }
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      console.error("Monday.com API request failed:", response.status);
      throw new Error("Failed to fetch Monday.com boards. Please check your API key.");
    }

    const data = await response.json();
    if (data.errors) {
      console.error("Monday.com API returned errors:", data.errors);
      throw new Error(data.errors[0]?.message || "Error fetching boards");
    }

    console.log("Successfully fetched Monday.com boards:", data);
    return data;
  };

  return useQuery({
    queryKey: ["monday-boards"],
    queryFn: fetchBoards,
    meta: {
      onError: (error: Error) => {
        console.error("Error in useMonday hook:", error);
        toast.error(error.message);
      }
    }
  });
};

export default useMonday;
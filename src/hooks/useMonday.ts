import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useMonday = () => {
  const fetchBoards = async () => {
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) throw new Error("No user found");

    const { data: userData } = await supabase
      .from("profiles")
      .select("monday_api_key")
      .eq("id", profile.user.id)
      .single();

    if (!userData?.monday_api_key) {
      throw new Error("Monday.com API key not found");
    }

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

    const data = await response.json();
    console.log("Monday.com boards data:", data);
    return data;
  };

  return useQuery({
    queryKey: ["monday-boards"],
    queryFn: fetchBoards,
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching Monday.com boards:", error);
        toast.error(error.message);
      }
    }
  });
};

export default useMonday;
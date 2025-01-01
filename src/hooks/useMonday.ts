import { useQuery } from "@tanstack/react-query";

// Mock data for testing
const mockBoards = [
  { id: "1", name: "Development Board" },
  { id: "2", name: "Marketing Board" },
  { id: "3", name: "Sales Board" }
];

const mockColumns = [
  { 
    id: "status1", 
    title: "Status",
    type: "status",
    settings_str: JSON.stringify({
      labels: {
        "1": "Working on it",
        "2": "Done",
        "3": "Stuck",
        "4": "In Review"
      }
    })
  },
  {
    id: "status2",
    title: "Priority",
    type: "color",
    settings_str: JSON.stringify({
      labels: {
        "1": "High",
        "2": "Medium",
        "3": "Low"
      }
    })
  }
];

export const useMonday = () => {
  console.log("Using mock Monday.com data for testing");
  
  return useQuery({
    queryKey: ["monday-boards"],
    queryFn: async () => {
      console.log("Returning mock Monday.com boards");
      return {
        data: {
          boards: mockBoards
        }
      };
    }
  });
};

export const useMondayColumns = (boardId: string) => {
  console.log("Fetching mock columns for board:", boardId);
  
  return useQuery({
    queryKey: ["monday-columns", boardId],
    queryFn: async () => {
      console.log("Returning mock Monday.com columns");
      return mockColumns;
    },
    enabled: !!boardId
  });
};

export default useMonday;
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { Loader2 } from "lucide-react";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // Remove suspense from here as it should be used at the component level
    },
  },
});

// Loading fallback for data fetching
const QueryLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
    <div className="bg-white rounded-lg p-4 shadow-xl flex items-center gap-3">
      <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
      <p className="text-gray-700">Loading data...</p>
    </div>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
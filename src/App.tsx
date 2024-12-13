import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import ConnectMonday from '@/pages/ConnectMonday';
import ConnectSheets from '@/pages/ConnectSheets';
import MondayOAuth from '@/pages/MondayOAuth';
import { useState } from 'react';

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="/connect-monday" element={<ConnectMonday />} />
          <Route path="/connect-sheets" element={<ConnectSheets />} />
          <Route path="/oauth/monday" element={<MondayOAuth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
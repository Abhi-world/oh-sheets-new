import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Index from '@/pages/Index';
import ConnectMonday from '@/pages/ConnectMonday';
import ConnectSheets from '@/pages/ConnectSheets';
import MondayOAuth from '@/pages/MondayOAuth';
import RecipeConfig from '@/components/recipes/RecipeConfig';
import InstallationFlow from '@/components/installation/InstallationFlow';
import ItemMenu from '@/components/monday-menus/ItemMenu';
import MultiItemMenu from '@/components/monday-menus/MultiItemMenu';
import MondayBoards from '@/components/MondayBoards';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { Loader2 } from "lucide-react";
import { Suspense } from 'react';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#7B61FF] via-[#9B87F5] to-[#7E69AB]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-white" />
      <p className="text-white text-lg">Loading...</p>
    </div>
  </div>
);

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
              <Route path="/connect-monday" element={<PageWrapper><ConnectMonday /></PageWrapper>} />
              <Route path="/connect-sheets" element={<PageWrapper><ConnectSheets /></PageWrapper>} />
              <Route path="/monday-oauth" element={<PageWrapper><MondayOAuth /></PageWrapper>} />
              <Route path="/recipe/:recipeId" element={<PageWrapper><RecipeConfig /></PageWrapper>} />
              <Route path="/install" element={<PageWrapper><InstallationFlow /></PageWrapper>} />
              <Route path="/recipe/item-menu" element={<PageWrapper><ItemMenu /></PageWrapper>} />
              <Route path="/recipe/multi-item-menu" element={<PageWrapper><MultiItemMenu /></PageWrapper>} />
              <Route path="/board-view" element={<PageWrapper><MondayBoards /></PageWrapper>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
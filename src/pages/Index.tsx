
import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '@/components/home/Hero';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7B61FF] via-[#9B87F5] to-[#7E69AB]">
      <Hero />
      
      <div className="container mx-auto px-4 py-8">
        <Link to="/board-view">
          <Button 
            className="bg-white text-[#7B61FF] hover:bg-gray-100 flex items-center gap-2"
          >
            <FileSpreadsheet className="w-5 h-5" />
            View Monday.com Boards
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;

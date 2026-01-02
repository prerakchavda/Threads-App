
import React, { useState, useEffect } from 'react';
import { View, ClothingItem, Outfit } from './types';
import { db } from './db';
import WardrobeView from './views/WardrobeView';
import CanvasView from './views/CanvasView';
import LibraryView from './views/LibraryView';
import SplashScreen from './components/SplashScreen';
import { Grid, Shirt, Library, Plus } from 'lucide-react';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState<View>('Wardrobe');
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [activeOutfit, setActiveOutfit] = useState<Outfit | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const loadedItems = db.getItems();
        const loadedOutfits = db.getOutfits();
        setItems(loadedItems);
        setOutfits(loadedOutfits);
        
        setTimeout(() => setIsInitializing(false), 800);
      } catch (error) {
        setIsInitializing(false);
      }
    };
    initializeApp();
  }, []);

  const refreshData = () => {
    setItems(db.getItems());
    setOutfits(db.getOutfits());
  };

  const handleEditOutfit = (outfit: Outfit) => {
    setActiveOutfit(outfit);
    setCurrentView('Canvas');
  };

  if (isInitializing) return <SplashScreen />;

  return (
    <div className="flex flex-col h-screen bg-[#F2F2F7] max-w-lg mx-auto overflow-hidden relative font-sans">
      {/* View Content */}
      <main className="flex-1 overflow-hidden relative">
        {currentView === 'Wardrobe' && (
          <WardrobeView items={items} onRefresh={refreshData} />
        )}
        {currentView === 'Canvas' && (
          <CanvasView 
            items={items} 
            initialOutfit={activeOutfit} 
            onSave={() => {
              refreshData();
              setCurrentView('Library');
            }} 
          />
        )}
        {currentView === 'Library' && (
          <LibraryView outfits={outfits} onEdit={handleEditOutfit} onRefresh={refreshData} />
        )}
      </main>

      {/* iOS Tab Bar */}
      <nav className="ios-blur border-t border-black/5 flex justify-around px-2 pt-2 pb-safe z-[90] shrink-0">
        <TabButton 
          active={currentView === 'Wardrobe'} 
          onClick={() => setCurrentView('Wardrobe')} 
          icon={<Grid size={26} strokeWidth={currentView === 'Wardrobe' ? 2.5 : 2} />} 
          label="Closet" 
        />
        <TabButton 
          active={currentView === 'Canvas'} 
          onClick={() => {
            setActiveOutfit(null);
            setCurrentView('Canvas');
          }} 
          icon={<Shirt size={26} strokeWidth={currentView === 'Canvas' ? 2.5 : 2} />} 
          label="Studio" 
        />
        <TabButton 
          active={currentView === 'Library'} 
          onClick={() => setCurrentView('Library')} 
          icon={<Library size={26} strokeWidth={currentView === 'Library' ? 2.5 : 2} />} 
          label="Library" 
        />
      </nav>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 pt-1 px-4 transition-all active:opacity-50 ${active ? 'text-indigo-600' : 'text-[#8E8E93]'}`}
  >
    <div className="h-7 flex items-center">{icon}</div>
    <span className="text-[10px] font-semibold tracking-tight leading-none">{label}</span>
  </button>
);

export default App;

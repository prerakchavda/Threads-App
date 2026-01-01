
import React, { useState, useEffect } from 'react';
import { View, ClothingItem, Outfit } from './types';
import { db } from './db';
import WardrobeView from './views/WardrobeView';
import CanvasView from './views/CanvasView';
import LibraryView from './views/LibraryView';
import SplashScreen from './components/SplashScreen';
import { LayoutGrid, Shirt, Library, Plus } from 'lucide-react';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState<View>('Wardrobe');
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [activeOutfit, setActiveOutfit] = useState<Outfit | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Step 1: Initialize local database & load items
        const loadedItems = db.getItems();
        const loadedOutfits = db.getOutfits();

        // Step 2: Data Validation & Integrity Check
        // Cleanup outfits that might reference non-existent items
        const validItemIds = new Set(loadedItems.map(i => i.id));
        const validatedOutfits = loadedOutfits.map(outfit => ({
          ...outfit,
          items: outfit.items.filter(item => validItemIds.has(item.clothingId))
        }));

        // Set memory-cached items for fast rendering
        setItems(loadedItems);
        setOutfits(validatedOutfits);

        // Step 3: Transition smoothly from Splash Screen
        // Using requestAnimationFrame to ensure splash is painted at least once
        requestAnimationFrame(() => {
          // Minimal moment to allow the splash to be perceived and transition smoothly
          setTimeout(() => {
            setIsInitializing(false);
          }, 600);
        });
      } catch (error) {
        console.error("Critical initialization failure:", error);
        // Fail-safe to allow users to interact with whatever data remains
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

  const startNewOutfit = () => {
    setActiveOutfit(null);
    setCurrentView('Canvas');
  };

  if (isInitializing) {
    return <SplashScreen />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 max-w-md mx-auto border-x border-gray-200 shadow-2xl relative animate-in fade-in duration-700">
      {/* Header */}
      <header className="p-4 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Closet Canvas</h1>
        <button 
          onClick={startNewOutfit}
          className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative no-scrollbar">
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

      {/* Navigation Bar */}
      <nav className="bg-white border-t border-gray-100 flex justify-around p-3 pb-6 shrink-0 shadow-lg">
        <button 
          onClick={() => setCurrentView('Wardrobe')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'Wardrobe' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <LayoutGrid size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Closet</span>
        </button>
        <button 
          onClick={() => setCurrentView('Canvas')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'Canvas' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <Shirt size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Canvas</span>
        </button>
        <button 
          onClick={() => setCurrentView('Library')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'Library' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <Library size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Library</span>
        </button>
      </nav>
    </div>
  );
};

export default App;

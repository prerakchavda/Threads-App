
import React, { useState, useRef, useEffect } from 'react';
import { ClothingItem, Outfit, OutfitItem } from '../types';
import { db } from '../db';
import { Save, RefreshCw, Layers, Plus, Minus, RotateCw, Trash2, ChevronUp, Shirt, Dices, Sparkles, Tag } from 'lucide-react';

interface CanvasViewProps {
  items: ClothingItem[];
  initialOutfit: Outfit | null;
  onSave: () => void;
}

const CanvasView: React.FC<CanvasViewProps> = ({ items, initialOutfit, onSave }) => {
  const [canvasItems, setCanvasItems] = useState<OutfitItem[]>(initialOutfit?.items || []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [outfitName, setOutfitName] = useState(initialOutfit?.name || '');
  const [includeAccessories, setIncludeAccessories] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addItemToCanvas = (clothingId: string, customPos?: {x: number, y: number, zIndex?: number}) => {
    const newItem: OutfitItem = {
      clothingId,
      x: customPos?.x ?? 80 + (Math.random() * 20),
      y: customPos?.y ?? 100 + (Math.random() * 20),
      scale: 1,
      rotate: 0,
      zIndex: customPos?.zIndex ?? canvasItems.length + 1
    };
    setCanvasItems(prev => [...prev, newItem]);
    setDrawerOpen(false);
    setSelectedId((canvasItems.length).toString());
  };

  const generateRandomOutfit = () => {
    const tops = items.filter(i => i.category === 'Top');
    const bottoms = items.filter(i => i.category === 'Bottom');
    const shoes = items.filter(i => i.category === 'Shoes');
    const accessories = items.filter(i => i.category === 'Accessory');

    const missing = [];
    if (tops.length === 0) missing.push('Tops');
    if (bottoms.length === 0) missing.push('Bottoms');
    if (shoes.length === 0) missing.push('Shoes');

    if (missing.length > 0) {
      alert(`The Magic Randomizer requires at least one item from each core category to create a complete look. Missing: ${missing.join(', ')}.`);
      return;
    }

    setCanvasItems([]); // Clear current canvas for a fresh start
    
    const randomTop = tops[Math.floor(Math.random() * tops.length)];
    const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
    const randomShoes = shoes[Math.floor(Math.random() * shoes.length)];

    // Core layout positions (Centered vertically)
    const newSet: OutfitItem[] = [
      { clothingId: randomTop.id, x: 100, y: 50, scale: 1, rotate: 0, zIndex: 10 },
      { clothingId: randomBottom.id, x: 100, y: 220, scale: 1, rotate: 0, zIndex: 5 },
      { clothingId: randomShoes.id, x: 100, y: 400, scale: 0.8, rotate: 0, zIndex: 1 }
    ];

    if (includeAccessories && accessories.length > 0) {
      // Defined non-overlapping side slots for accessories
      const accessorySlots = [
        { x: 10, y: 100 },   // Mid-Left
        { x: 260, y: 120 },  // Mid-Right
        { x: 15, y: 320 },   // Lower-Left
        { x: 270, y: 350 },  // Lower-Right
      ];
      
      // Shuffle slots
      const shuffledSlots = [...accessorySlots].sort(() => Math.random() - 0.5);
      
      const count = Math.min(2, accessories.length);
      const usedAccIds = new Set();

      for(let i=0; i<count; i++) {
        // Try to get a unique accessory
        let acc = accessories[Math.floor(Math.random() * accessories.length)];
        if (usedAccIds.has(acc.id) && accessories.length > 1) {
           acc = accessories.find(a => !usedAccIds.has(a.id)) || acc;
        }
        
        usedAccIds.add(acc.id);
        const slot = shuffledSlots[i];
        
        newSet.push({ 
          clothingId: acc.id, 
          x: slot.x, 
          y: slot.y, 
          scale: 0.6, 
          rotate: (Math.random() * 20) - 10, // Subtle random tilt
          zIndex: 15 
        });
      }
    }

    setCanvasItems(newSet);
    setSelectedId(null);
  };

  const updateItem = (index: number, changes: Partial<OutfitItem>) => {
    const newItems = [...canvasItems];
    newItems[index] = { ...newItems[index], ...changes };
    setCanvasItems(newItems);
  };

  const removeItem = (index: number) => {
    setCanvasItems(canvasItems.filter((_, i) => i !== index));
    setSelectedId(null);
  };

  const moveZ = (index: number, direction: 'up' | 'down') => {
    const newItems = [...canvasItems];
    const item = newItems[index];
    if (direction === 'up') item.zIndex += 1;
    else item.zIndex = Math.max(1, item.zIndex - 1);
    setCanvasItems(newItems);
  };

  const handleSave = () => {
    if (canvasItems.length === 0) {
      alert("Add some items to your canvas before saving!");
      return;
    }
    
    const outfit: Outfit = {
      id: initialOutfit?.id || crypto.randomUUID(),
      name: outfitName || `Outfit ${new Date().toLocaleDateString()}`,
      items: canvasItems,
      tags: [],
      createdAt: initialOutfit?.createdAt || Date.now()
    };
    db.saveOutfit(outfit);
    onSave();
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    setSelectedId(index.toString());
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const initialX = canvasItems[index].x;
    const initialY = canvasItems[index].y;

    const onMove = (moveEvent: any) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const dx = currentX - startX;
      const dy = currentY - startY;
      
      updateItem(index, { 
        x: initialX + dx,
        y: initialY + dy 
      });
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  return (
    <div className="h-full flex flex-col relative bg-gray-100 overflow-hidden">
      <div className="p-3 bg-white border-b border-gray-100 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-2">
           <input 
            type="text" 
            value={outfitName} 
            onChange={(e) => setOutfitName(e.target.value)}
            placeholder="Outfit Name..."
            className="bg-transparent border-none font-semibold text-gray-700 focus:ring-0 w-32 text-sm"
          />
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={generateRandomOutfit}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 group"
            title="Randomize Outfit"
          >
            <Dices size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-tight hidden sm:inline">Randomize</span>
          </button>
          <div className="w-px h-6 bg-gray-100 mx-1" />
          <button 
            onClick={handleSave}
            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      <div 
        ref={canvasRef}
        className="flex-1 relative bg-white overflow-hidden"
        onClick={() => setSelectedId(null)}
        style={{ 
          backgroundImage: 'linear-gradient(45deg, #fbfbfb 25%, transparent 25%), linear-gradient(-45deg, #fbfbfb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fbfbfb 75%), linear-gradient(-45deg, transparent 75%, #fbfbfb 75%)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px'
        }}
      >
        {canvasItems.map((item, index) => {
          const clothing = items.find(i => i.id === item.clothingId);
          if (!clothing) return null;

          return (
            <div
              key={index}
              onMouseDown={(e) => handleDrag(e, index)}
              onTouchStart={(e) => handleDrag(e, index)}
              onClick={(e) => e.stopPropagation()}
              className={`absolute cursor-move select-none transition-shadow ${selectedId === index.toString() ? 'ring-2 ring-indigo-500/50 shadow-2xl z-50' : ''}`}
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                transform: `scale(${item.scale}) rotate(${item.rotate}deg)`,
                zIndex: item.zIndex,
                width: '180px'
              }}
            >
              <img 
                src={clothing.image} 
                draggable={false}
                className="w-full h-auto object-contain pointer-events-none drop-shadow-xl" 
                alt="outfit piece"
              />
            </div>
          );
        })}

        {canvasItems.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none p-8 text-center">
            <Sparkles size={64} strokeWidth={1} className="mb-4 opacity-30 text-indigo-600" />
            <p className="text-lg font-bold text-gray-500">Your Canvas awaits</p>
            <p className="text-sm max-w-[200px]">Pull items from the drawer or hit the dice for a random fit! (Needs Top, Bottom, and Shoes)</p>
          </div>
        )}
      </div>

      {selectedId !== null && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center z-[60] animate-in slide-in-from-bottom-4 duration-300">
           <div className="flex items-center gap-1 bg-white p-2 rounded-full shadow-2xl border border-gray-100">
            <button 
              onClick={() => moveZ(parseInt(selectedId), 'up')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              title="Bring Forward"
            >
              <ChevronUp size={18} />
            </button>
            <div className="w-px h-6 bg-gray-100" />
            <button 
              onClick={() => updateItem(parseInt(selectedId), { scale: canvasItems[parseInt(selectedId)].scale + 0.1 })}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Plus size={18} />
            </button>
            <button 
               onClick={() => updateItem(parseInt(selectedId), { scale: Math.max(0.3, canvasItems[parseInt(selectedId)].scale - 0.1) })}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Minus size={18} />
            </button>
            <button 
               onClick={() => updateItem(parseInt(selectedId), { rotate: canvasItems[parseInt(selectedId)].rotate + 15 })}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <RotateCw size={18} />
            </button>
            <div className="w-px h-6 bg-gray-100 mx-1" />
            <button 
              onClick={() => removeItem(parseInt(selectedId))}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}

      <div className={`absolute bottom-0 left-0 right-0 bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.1)] rounded-t-[32px] transition-transform duration-500 z-50 ${drawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-64px)]'}`}>
        <button 
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="w-full flex flex-col items-center justify-center p-4 text-gray-400"
        >
          <div className="w-12 h-1.5 bg-gray-100 rounded-full mb-2" />
          <div className="flex items-center gap-4 w-full justify-center">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Wardrobe Picker</span>
          </div>
        </button>
        
        <div className="px-6 pb-6 pt-0 flex flex-col gap-4">
           <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-indigo-600" />
                <span className="text-xs font-bold text-gray-700">Include Accessories</span>
              </div>
              <button 
                onClick={() => setIncludeAccessories(!includeAccessories)}
                className={`w-10 h-5 rounded-full transition-colors relative ${includeAccessories ? 'bg-indigo-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${includeAccessories ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
              </button>
           </div>

           <div className="grid grid-cols-4 gap-4 overflow-y-auto max-h-[300px] no-scrollbar">
            {items.map(item => (
              <button 
                key={item.id}
                onClick={() => addItemToCanvas(item.id)}
                className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:border-indigo-300 active:scale-90 transition-all shadow-sm"
              >
                <img src={item.image} className="w-full h-full object-contain p-1" alt="item thumbnail" />
              </button>
            ))}
            {items.length === 0 && (
              <div className="col-span-4 py-16 text-center">
                <Shirt size={40} className="mx-auto text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm font-medium">Closet is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasView;


import React, { useState, useRef } from 'react';
import { ClothingItem, Category } from '../types';
import { db } from '../db';
import { Camera, Image as ImageIcon, X, Loader2, Trash2, Plus, Shirt, Wand2, Check, Edit2, Eraser, ChevronRight } from 'lucide-react';
import { analyzeClothingImage, removeBackgroundAI } from '../services/gemini';
import ImageRefiner from '../components/ImageRefiner';

interface WardrobeViewProps {
  items: ClothingItem[];
  onRefresh: () => void;
}

const WardrobeView: React.FC<WardrobeViewProps> = ({ items, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [showManualForm, setShowManualForm] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [manualCategory, setManualCategory] = useState<Category>('Top');
  const [manualSubcategory, setManualSubcategory] = useState('');
  const [manualTags, setManualTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const categories: Category[] = ['Top', 'Bottom', 'Outerwear', 'Shoes', 'Accessory'];

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setIsAdding(false);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      if (useAI) {
        const aiProcessed = await removeBackgroundAI(base64);
        setEditingImage(aiProcessed || base64);
      } else {
        setEditingImage(base64);
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRefinementComplete = async (finalImage: string) => {
    setEditingImage(null);
    setTempImage(finalImage);
    if (!activeItemId && useAI) {
      setLoading(true);
      const analysis = await analyzeClothingImage(finalImage);
      if (analysis) {
        setManualCategory(analysis.category as Category);
        setManualSubcategory(analysis.subcategory);
        setManualTags(analysis.tags || []);
      }
      setLoading(false);
    }
    setShowManualForm(true);
  };

  const handleSave = () => {
    if (!tempImage) return;
    const itemData = {
      image: tempImage,
      category: manualCategory,
      subcategory: manualSubcategory || 'New Piece',
      colors: [],
      tags: manualTags,
      createdAt: Date.now(),
    };
    if (activeItemId) {
      db.updateItem({ ...itemData, id: activeItemId });
    } else {
      db.saveItem({ ...itemData, id: crypto.randomUUID() });
    }
    onRefresh();
    resetState();
  };

  const resetState = () => {
    setShowManualForm(false);
    setActiveItemId(null);
    setTempImage(null);
    setManualSubcategory('');
    setManualCategory('Top');
    setManualTags([]);
    setIsAdding(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#F2F2F7]">
      {editingImage && (
        <ImageRefiner 
          imageSrc={editingImage} 
          onConfirm={handleRefinementComplete} 
          onCancel={() => setEditingImage(null)} 
        />
      )}

      {/* Header Area */}
      <header className="px-5 pt-safe bg-[#F2F2F7]">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-3xl font-bold tracking-tight text-black">Closet</h1>
          <button 
            onClick={() => setIsAdding(true)}
            className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>
        
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
          <Pill active={selectedCategory === 'All'} onClick={() => setSelectedCategory('All')}>All</Pill>
          {categories.map(c => (
            <Pill key={c} active={selectedCategory === c} onClick={() => setSelectedCategory(c)}>{c}</Pill>
          ))}
        </div>
      </header>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 no-scrollbar">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-indigo-600">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-sm font-semibold">Removing background...</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => {
                setActiveItemId(item.id);
                setTempImage(item.image);
                setManualCategory(item.category);
                setManualSubcategory(item.subcategory);
                setManualTags(item.tags);
                setShowManualForm(true);
              }}
              className="bg-white rounded-2xl p-2 shadow-sm active:scale-95 transition-transform"
            >
              <div className="aspect-[4/5] bg-[#F9F9F9] rounded-xl overflow-hidden mb-2">
                <img src={item.image} className="w-full h-full object-contain" alt={item.subcategory} />
              </div>
              <div className="px-1">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide leading-none mb-1">{item.category}</p>
                <p className="text-xs font-semibold text-black truncate">{item.subcategory}</p>
              </div>
            </div>
          ))}
        </div>
        
        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-20">
            <Shirt size={48} className="mx-auto text-[#C7C7CC] mb-4" />
            <p className="text-[#8E8E93] font-semibold">Your closet is empty</p>
          </div>
        )}
      </div>

      {/* iOS Action Sheet for Adding */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end">
          <div className="w-full bg-white rounded-t-[20px] pb-safe animate-ios-sheet px-5 pt-2">
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-bold mb-6">Add New Item</h2>
            
            <div className="flex flex-col gap-3 mb-8">
              <ActionButton 
                onClick={() => fileInputRef.current?.click()} 
                icon={<Camera className="text-indigo-600" />} 
                title="Take Photo" 
              />
              <ActionButton 
                onClick={() => fileInputRef.current?.click()} 
                icon={<ImageIcon className="text-indigo-600" />} 
                title="Choose from Gallery" 
              />
            </div>
            
            <div className="flex items-center justify-between bg-[#F2F2F7] p-4 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Wand2 size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm">AI Auto-Crop</p>
                  <p className="text-[10px] text-[#8E8E93]">Removes background automatically</p>
                </div>
              </div>
              <button 
                onClick={() => setUseAI(!useAI)}
                className={`w-12 h-6 rounded-full transition-colors relative ${useAI ? 'bg-indigo-600' : 'bg-[#D1D1D6]'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${useAI ? 'translate-x-6.5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            
            <button onClick={() => setIsAdding(false)} className="w-full py-4 text-indigo-600 font-bold text-lg border-t border-gray-100">Cancel</button>
          </div>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
        </div>
      )}

      {/* iOS Edit Modal */}
      {showManualForm && tempImage && (
        <div className="fixed inset-0 z-[110] bg-white pt-safe flex flex-col">
          <header className="px-5 py-3 flex justify-between items-center border-b border-gray-100">
            <button onClick={resetState} className="text-indigo-600 font-medium">Cancel</button>
            <h3 className="font-bold">{activeItemId ? 'Edit Item' : 'Details'}</h3>
            <button onClick={handleSave} className="text-indigo-600 font-bold">Save</button>
          </header>
          
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
            <div className="relative w-48 aspect-[4/5] mx-auto bg-[#F9F9F9] rounded-2xl overflow-hidden shadow-inner">
              <img src={tempImage} className="w-full h-full object-contain" alt="item" />
              <button 
                onClick={() => setEditingImage(tempImage)}
                className="absolute bottom-2 right-2 bg-white/80 backdrop-blur p-2 rounded-lg text-indigo-600 shadow-sm flex items-center gap-1.5 text-[10px] font-bold"
              >
                <Eraser size={12} /> REFINE
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F2F2F7] rounded-xl overflow-hidden">
                <div className="px-4 py-3 flex justify-between items-center border-b border-gray-200">
                  <span className="text-sm font-medium">Category</span>
                  <select 
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as Category)}
                    className="bg-transparent text-sm font-semibold text-indigo-600 outline-none appearance-none text-right"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="px-4 py-3 flex items-center">
                  <span className="text-sm font-medium w-24">Name</span>
                  <input 
                    type="text"
                    value={manualSubcategory}
                    onChange={(e) => setManualSubcategory(e.target.value)}
                    placeholder="White Tee, Blue Jeans..."
                    className="flex-1 bg-transparent text-sm font-semibold text-right outline-none placeholder:text-[#C7C7CC]"
                  />
                </div>
              </div>

              {activeItemId && (
                <button 
                  onClick={() => {
                    if (confirm('Delete this item permanently?')) {
                      db.deleteItem(activeItemId);
                      onRefresh();
                      resetState();
                    }
                  }}
                  className="w-full py-4 bg-white text-red-500 font-bold rounded-xl border border-red-100 active:bg-red-50"
                >
                  Delete Item
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Pill: React.FC<{ active: boolean; children: React.ReactNode; onClick: () => void }> = ({ active, children, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${active ? 'bg-black text-white' : 'bg-white text-black shadow-sm'}`}
  >
    {children}
  </button>
);

const ActionButton: React.FC<{ onClick: () => void; icon: React.ReactNode; title: string }> = ({ onClick, icon, title }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-4 bg-[#F2F2F7] p-4 rounded-xl active:bg-[#E5E5EA] transition-colors"
  >
    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">{icon}</div>
    <span className="font-semibold text-base flex-1 text-left">{title}</span>
    <ChevronRight size={20} className="text-[#C7C7CC]" />
  </button>
);

export default WardrobeView;

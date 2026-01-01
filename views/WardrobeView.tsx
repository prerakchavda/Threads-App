
import React, { useState, useRef } from 'react';
import { ClothingItem, Category } from '../types';
import { db } from '../db';
import { Camera, Image as ImageIcon, X, Loader2, Trash2, Plus, Shirt, Wand2, Check, Tag, Edit2, Eraser } from 'lucide-react';
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
  
  // Edit/Add Meta States
  const [showManualForm, setShowManualForm] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null); // null means adding new
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

    // Only auto-analyze if adding NEW and AI is on
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

  const addTag = () => {
    if (tagInput.trim() && !manualTags.includes(tagInput.trim())) {
      setManualTags([...manualTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setManualTags(manualTags.filter(t => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!tempImage) return;

    if (activeItemId) {
      // Update existing
      const updatedItem: ClothingItem = {
        id: activeItemId,
        image: tempImage,
        category: manualCategory,
        subcategory: manualSubcategory || 'Unnamed Piece',
        colors: [],
        tags: manualTags,
        createdAt: Date.now(), // update timestamp or keep old?
      };
      db.updateItem(updatedItem);
    } else {
      // Create new
      const newItem: ClothingItem = {
        id: crypto.randomUUID(),
        image: tempImage,
        category: manualCategory,
        subcategory: manualSubcategory || 'Unnamed Piece',
        colors: [],
        tags: manualTags,
        createdAt: Date.now(),
      };
      db.saveItem(newItem);
    }

    onRefresh();
    resetState();
  };

  const startEdit = (item: ClothingItem) => {
    setActiveItemId(item.id);
    setTempImage(item.image);
    setManualCategory(item.category);
    setManualSubcategory(item.subcategory);
    setManualTags(item.tags);
    setShowManualForm(true);
  };

  const resetState = () => {
    setIsAdding(false);
    setShowManualForm(false);
    setActiveItemId(null);
    setTempImage(null);
    setManualSubcategory('');
    setManualCategory('Top');
    setManualTags([]);
    setTagInput('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this item? It will be removed from all outfits.')) {
      db.deleteItem(id);
      onRefresh();
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      {editingImage && (
        <ImageRefiner 
          imageSrc={editingImage} 
          onConfirm={handleRefinementComplete} 
          onCancel={() => setEditingImage(null)} 
        />
      )}

      {showManualForm && tempImage && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold text-gray-800 mb-4 shrink-0">
              {activeItemId ? 'Edit Item' : 'New Item Details'}
            </h3>
            
            <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar pr-1">
              <div className="relative group aspect-[4/5] bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden mb-2">
                <img src={tempImage} className="w-full h-full object-contain" alt="item preview" />
                <button 
                  onClick={() => setEditingImage(tempImage)}
                  className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md p-2 rounded-xl text-indigo-600 shadow-lg border border-indigo-100 flex items-center gap-2 text-xs font-bold active:scale-95 transition-transform"
                >
                  <Eraser size={14} /> Refine Cutout
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</label>
                <select 
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as Category)}
                  className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Item Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Vintage Denim, White Tee..."
                  value={manualSubcategory}
                  onChange={(e) => setManualSubcategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {manualTags.map(tag => (
                    <span key={tag} className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-indigo-100">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button onClick={addTag} className="bg-indigo-100 text-indigo-600 p-3 rounded-xl hover:bg-indigo-200 transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 shrink-0">
              <button onClick={resetState} className="flex-1 py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors">Cancel</button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 transition-all"
              >
                <Check size={18} /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button 
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${selectedCategory === 'All' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isAdding ? (
        <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-gray-300 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between w-full mb-2">
            <h3 className="font-semibold text-gray-700">Add New Item</h3>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex flex-col items-center gap-2 py-8 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <Camera size={32} />
              <span className="text-sm font-medium">Camera</span>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex flex-col items-center gap-2 py-8 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ImageIcon size={32} />
              <span className="text-sm font-medium">Gallery</span>
            </button>
          </div>
          
          <div className="w-full pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600">
              <Wand2 size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">AI Features</span>
            </div>
            <button 
              onClick={() => setUseAI(!useAI)}
              className={`w-12 h-6 rounded-full transition-colors relative ${useAI ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${useAI ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
        </div>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span className="font-medium">Add Clothing Item</span>
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-10">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
          <p className="text-sm text-gray-500 font-medium text-center">Processing clothing item...</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
              <img src={item.image} alt={item.subcategory} className="relative w-full h-full object-contain" />
            </div>
            <div className="p-3 bg-white">
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tighter">{item.category}</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{item.subcategory}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.tags.slice(0, 2).map(t => (
                  <span key={t} className="text-[8px] bg-gray-50 text-gray-400 px-1 rounded border border-gray-100">#{t}</span>
                ))}
              </div>
            </div>
            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                className="p-2 bg-white/80 backdrop-blur-sm text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-100"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                className="p-2 bg-red-50/80 backdrop-blur-sm text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors border border-red-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && !loading && (
          <div className="col-span-2 text-center py-20">
            <Shirt size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">Your closet is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardrobeView;

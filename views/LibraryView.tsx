
import React from 'react';
import { Outfit } from '../types';
import { db } from '../db';
import { Calendar, Trash2, Edit2, ChevronRight } from 'lucide-react';

interface LibraryViewProps {
  outfits: Outfit[];
  onEdit: (outfit: Outfit) => void;
  onRefresh: () => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ outfits, onEdit, onRefresh }) => {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this outfit?')) {
      db.deleteOutfit(id);
      onRefresh();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F2F2F7]">
      <header className="px-5 pt-safe bg-[#F2F2F7] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-black py-4">Library</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-4 no-scrollbar">
        {outfits.map(outfit => (
          <div 
            key={outfit.id} 
            onClick={() => onEdit(outfit)}
            className="bg-white rounded-2xl shadow-sm flex overflow-hidden active:scale-95 transition-transform"
          >
            <div className="w-24 h-24 bg-[#F9F9F9] grid grid-cols-2 p-1 gap-0.5 shrink-0">
              {outfit.items.slice(0, 4).map((item, idx) => {
                const clothing = db.getItems().find(i => i.id === item.clothingId);
                return clothing ? (
                  <img key={idx} src={clothing.image} className="w-full h-full object-cover rounded-[2px]" alt="pv" />
                ) : <div key={idx} className="bg-gray-100 rounded-[2px]" />;
              })}
            </div>
            
            <div className="flex-1 p-3 flex flex-col justify-center">
              <h3 className="font-bold text-black text-sm mb-0.5">{outfit.name}</h3>
              <p className="text-[10px] text-[#8E8E93] font-medium">
                {new Date(outfit.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center px-4">
              <ChevronRight size={18} className="text-[#C7C7CC]" />
            </div>
          </div>
        ))}

        {outfits.length === 0 && (
          <div className="text-center py-20 px-8">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} className="text-[#C7C7CC]" />
            </div>
            <p className="text-lg font-bold text-black mb-2">No Saved Outfits</p>
            <p className="text-sm text-[#8E8E93]">Your collection will appear here once you save a creation from the Studio.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;

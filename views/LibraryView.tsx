
import React from 'react';
import { Outfit } from '../types';
import { db } from '../db';
import { Calendar, Trash2, Edit2, Play } from 'lucide-react';

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
    <div className="p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Your Outfits</h2>
        <span className="text-xs font-medium text-gray-400">{outfits.length} saved</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {outfits.map(outfit => (
          <div 
            key={outfit.id} 
            onClick={() => onEdit(outfit)}
            className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
          >
            <div className="flex">
              {/* Simple Multi-item Preview */}
              <div className="w-32 h-32 bg-indigo-50 grid grid-cols-2 gap-0.5 p-0.5 shrink-0 overflow-hidden">
                {outfit.items.slice(0, 4).map((item, idx) => {
                  const clothing = db.getItems().find(i => i.id === item.clothingId);
                  return clothing ? (
                    <img key={idx} src={clothing.image} className="w-full h-full object-cover" alt="preview" />
                  ) : <div key={idx} className="bg-gray-100" />;
                })}
                {outfit.items.length === 0 && (
                  <div className="col-span-2 row-span-2 flex items-center justify-center text-indigo-200">
                    <Calendar size={32} />
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{outfit.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(outfit.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(outfit); }}
                    className="flex-1 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-100"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, outfit.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="absolute top-2 right-2 p-2 bg-indigo-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Play size={16} fill="white" />
            </div>
          </div>
        ))}

        {outfits.length === 0 && (
          <div className="text-center py-24 px-6 border-2 border-dashed border-gray-200 rounded-3xl">
            <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold text-lg">No outfits saved yet.</p>
            <p className="text-gray-400 text-sm mt-1">Start mixing and matching in the Canvas tab!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;

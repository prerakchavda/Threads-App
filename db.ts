
import { ClothingItem, Outfit } from './types';

const CLOTHING_KEY = 'closet_canvas_items';
const OUTFITS_KEY = 'closet_canvas_outfits';

export const db = {
  getItems: (): ClothingItem[] => {
    const data = localStorage.getItem(CLOTHING_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveItem: (item: ClothingItem) => {
    const items = db.getItems();
    items.push(item);
    localStorage.setItem(CLOTHING_KEY, JSON.stringify(items));
  },
  deleteItem: (id: string) => {
    const items = db.getItems().filter(i => i.id !== id);
    localStorage.setItem(CLOTHING_KEY, JSON.stringify(items));
  },
  getOutfits: (): Outfit[] => {
    const data = localStorage.getItem(OUTFITS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveOutfit: (outfit: Outfit) => {
    const outfits = db.getOutfits();
    const index = outfits.findIndex(o => o.id === outfit.id);
    if (index >= 0) {
      outfits[index] = outfit;
    } else {
      outfits.push(outfit);
    }
    localStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits));
  },
  deleteOutfit: (id: string) => {
    const outfits = db.getOutfits().filter(o => o.id !== id);
    localStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits));
  }
};

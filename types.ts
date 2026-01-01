
export type Category = 'Top' | 'Bottom' | 'Outerwear' | 'Shoes' | 'Accessory';

export interface ClothingItem {
  id: string;
  image: string; // Base64
  category: Category;
  subcategory: string;
  colors: string[];
  season?: string[];
  tags: string[];
  createdAt: number;
}

export interface CanvasPosition {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  zIndex: number;
}

export interface OutfitItem extends CanvasPosition {
  clothingId: string;
}

export interface Outfit {
  id: string;
  name: string;
  items: OutfitItem[];
  tags: string[];
  createdAt: number;
  thumbnail?: string; // Base64 of the canvas
}

export type View = 'Wardrobe' | 'Canvas' | 'Library';

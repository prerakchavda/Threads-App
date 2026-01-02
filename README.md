# Closet Canvas
## AI-Powered Wardrobe Management and Outfit Composition Studio

Closet Canvas is a high-fidelity, offline-first mobile web application designed to digitize and optimize personal wardrobes. Utilizing Google’s Gemini AI, the platform transforms user-generated photography into a structured digital catalog, offering a precision interface for outfit composition, algorithmic randomization, and wardrobe analytics.

---

## Core Features

### AI-Driven Digitization
* **Automated Background Removal**: Utilizes `gemini-2.5-flash-image` to extract clothing items from images with high fidelity, preserving textures and complex edge detail.
* **Intelligent Categorization**: Automatically determines item categories (e.g., Outerwear, Formal, Footwear) and generates descriptive metadata using `gemini-3-flash-preview`.

### Studio Canvas
* **Composition Workspace**: A specialized drag-and-drop environment allowing users to layer, scale, and rotate digitized assets to visualize ensembles.
* **Algorithmic Randomization**: Generates optimized outfit suggestions through a logic-based engine that prioritizes core items (Top, Bottom, Shoes) while positioning accessories in non-overlapping peripheral slots.

### Precision Image Refinement
* **Manual Extraction Tools**: Professional-grade erase and restore functionality for post-AI cleanup.
* **Dynamic Viewport**: Supports up to 500% magnification for pixel-perfect edge refinement.
* **Advanced Brush Controls**: Adjustable hardness and size parameters for seamless asset blending.

### Architecture and User Experience
* **Design Standards**: Implements Apple Human Interface Guidelines (HIG), featuring glassmorphism effects, detent sheets, and San Francisco typography.
* **Privacy-Centric Data Model**: All wardrobe data and visual assets are persisted locally via `localStorage`, ensuring full offline functionality and data sovereignty.

---

## Application Preview

| Wardrobe Catalog | Outfit Studio | Manual Refiner |
| :--- | :--- | :--- |
| ![Closet Catalog View](https://via.placeholder.com/300x600.png?text=Wardrobe+Grid+Interface) | ![Outfit Builder View](https://via.placeholder.com/300x600.png?text=Canvas+Composition+Interface) | ![Image Refiner View](https://via.placeholder.com/300x600.png?text=Extraction+Tools+Interface) |
| *Categorized Grid View* | *Asset Manipulation* | *Pixel-Level Refinement* |

---

## Technical Specifications

* **Frontend Framework**: [React 19](https://react.dev/)
* **AI Integration**: [Google Gemini API](https://ai.google.dev/)
    * `gemini-3-flash-preview` (Logic and Schema-driven Data Analysis)
    * `gemini-2.5-flash-image` (Computer Vision and Visual Processing)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Iconography**: [Lucide React](https://lucide.dev/)
* **Data Persistence**: Browser-based `localStorage` (Offline-First)

---

## Installation and Deployment

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/closet-canvas.git](https://github.com/your-username/closet-canvas.git)
cd closet-canvas

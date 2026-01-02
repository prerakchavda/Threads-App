# 👗 Closet Canvas
### **AI-Powered Visual Wardrobe Manager & Outfit Studio**

Closet Canvas is a high-fidelity, offline-first mobile web application designed to help you rediscover your wardrobe. Using Google's Gemini AI, the app transforms messy mirror selfies into a professional digital catalog, allowing you to compose, randomize, and save outfits with a precision "Xcode-style" interface.

---

## ✨ Key Features

### 🤖 **AI-Driven Digitization**
*   **Instant Background Removal**: Leverages `gemini-2.5-flash-image` to precisely extract clothing items from photos, preserving textures and fine edges.
*   **Smart Categorization**: Automatically identifies categories (Tops, Bottoms, etc.) and suggests tags using `gemini-3-flash-preview`.

### 🎨 **Studio Canvas**
*   **Visual Outfit Builder**: A drag-and-drop workspace where you can layer, scale, and rotate your clothes to visualize a look before putting it on.
*   **Smart Randomizer**: Generate "Magic Outfits" with one tap. Our algorithm ensures core pieces (Top, Bottom, Shoes) are centered while accessories are placed in non-overlapping "peripheral slots."

### 🛠️ **Precision Image Refiner**
*   **Granular Erase/Restore**: A professional-grade manual tool to clean up AI extractions.
*   **Pan & Zoom**: Zoom up to 500% to ensure every pixel is perfect.
*   **Adjustable Hardness**: Control brush softness for realistic blending.

### 📱 **Native iOS Experience**
*   **Apple HIG Design**: Glassmorphism tab bars, Detent Sheets, and San Francisco typography.
*   **Privacy First**: All wardrobe data and images are stored locally on your device via `localStorage`.

---

## 📸 App Preview

| **Closet Catalog** | **Outfit Studio** | **Manual Refiner** |
|:---:|:---:|:---:|
| <img src="https://via.placeholder.com/300x600.png?text=iOS+Wardrobe+Grid" width="200" /> | <img src="https://via.placeholder.com/300x600.png?text=Canvas+Outfit+Builder" width="200" /> | <img src="https://via.placeholder.com/300x600.png?text=Precision+Refiner+Tools" width="200" /> |
| *Browse by Category* | *Drag & Drop Layout* | *Pixel-Perfect Editing* |

---

## 🚀 Technical Stack

-   **Framework**: [React 19](https://react.dev/)
-   **AI Engine**: [Google Gemini API](https://ai.google.dev/)
    -   `gemini-3-flash-preview` (Logic & Data Analysis)
    -   `gemini-2.5-flash-image` (Visual Processing)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Persistence**: `localStorage` (Offline-Ready)

---

## 🛠️ Setup & Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/closet-canvas.git
    cd closet-canvas
    ```

2.  **Environment Configuration**
    Ensure you have an API key from [Google AI Studio](https://aistudio.google.com/).
    ```bash
    # Set your API Key in your environment variables
    export API_KEY='your_gemini_api_key_here'
    ```

3.  **Run the App**
    Since the project uses ES6 modules directly:
    ```bash
    # Simply serve the root directory
    npx serve .
    ```

---

## 🧠 How the AI Works

### **Automatic Background Removal**
When you upload a photo, the app sends a request to `gemini-2.5-flash-image` with a specialized prompt:
> *"Extract the clothing item from this image with extreme precision... Remove the background entirely and replace it with solid black."*

The app then converts this into a transparent PNG by processing the black pixels as alpha channels, giving you a clean digital item for your canvas.

### **Metadata Intelligence**
Using `gemini-3-flash-preview` with a defined JSON Schema, the app instantly understands if you uploaded a "Denim Jacket" or "Leather Boots," tagging colors and styles automatically.

---

## 📄 License
MIT License - Created with ❤️ for organized fashion.

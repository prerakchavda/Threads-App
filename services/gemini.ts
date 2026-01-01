
import { GoogleGenAI, Type } from "@google/genai";

export async function analyzeClothingImage(base64Image: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          { text: "Analyze this clothing item and provide details in JSON format." },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { 
              type: Type.STRING, 
              enum: ['Top', 'Bottom', 'Outerwear', 'Shoes', 'Accessory'] 
            },
            subcategory: { type: Type.STRING },
            colors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ['category', 'subcategory', 'colors', 'tags']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
}

/**
 * Attempts to remove background using Gemini 2.5 Flash Image.
 * Note: While the model generates images, we prompt it to isolate the subject.
 */
export async function removeBackgroundAI(base64Image: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: 'Isolate the clothing item in this image. Remove the entire background and return the clothing item centered on a solid, pure black background for easy masking.',
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("AI Background Removal Error:", error);
    return null;
  }
}

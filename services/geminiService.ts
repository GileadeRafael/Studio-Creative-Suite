import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio } from '../types';

// Singleton instance of the AI client
let aiInstance: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI instance.
 * This prevents the app from crashing on load if the API key is missing.
 * @returns {GoogleGenAI} The initialized GoogleGenAI client.
 * @throws {Error} If the VITE_API_KEY environment variable is not set.
 */
const getAiClient = (): GoogleGenAI => {
    // Vite exposes client-safe env variables on `import.meta.env`
    const apiKey = import.meta.env.VITE_API_KEY;

    if (!apiKey) {
        throw new Error("A variável de ambiente VITE_API_KEY está ausente. Por favor, configure-a.");
    }

    if (!aiInstance) {
        aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
};


export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = (reader.result as string).split(',')[1];
            resolve(result);
        };
        reader.onerror = error => reject(error);
    });
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio, numberOfImages: number): Promise<string[]> => {
  // Moved out of try-catch: Let config errors propagate to the UI.
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: numberOfImages,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    } else {
      throw new Error("A geração de imagem falhou, nenhuma imagem foi retornada.");
    }
  } catch (error) {
    console.error("Erro ao gerar imagem com o Gemini:", error);
    throw new Error(`Falha ao gerar a imagem. ${error.message.includes("API key not valid") ? "Sua chave de API parece ser inválida." : "Verifique seu prompt e tente novamente."}`);
  }
};

export const editImage = async (prompt: string, referenceImages: {data: string, mimeType: string}[]): Promise<string> => {
    // Moved out of try-catch: Let config errors propagate to the UI.
    const ai = getAiClient();
    
    try {
        const imageParts = referenceImages.map(image => ({
            inlineData: {
                data: image.data,
                mimeType: image.mimeType,
            },
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    ...imageParts,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            const base64ImageBytes = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        } else {
            throw new Error("A edição de imagem falhou, nenhuma parte da imagem foi retornada.");
        }
    } catch (error) {
        console.error("Erro ao editar imagem com o Gemini:", error);
        throw new Error(`Falha ao editar a imagem. ${error.message.includes("API key not valid") ? "Sua chave de API parece ser inválida." : "Verifique seu prompt e tente novamente."}`);
    }
};
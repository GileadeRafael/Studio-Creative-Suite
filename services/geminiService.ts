import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio } from '../types';

// Singleton instance of the AI client
let aiInstance: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI instance.
 * This prevents the app from crashing on load if the API key is missing.
 * @returns {GoogleGenAI} The initialized GoogleGenAI client.
 * @throws {Error} If the API_KEY environment variable is not set.
 */
const getAiClient = (): GoogleGenAI => {
    // FIX: Switched from import.meta.env.VITE_API_KEY to process.env.API_KEY to follow the Gemini API guidelines.
    // This resolves the "Property 'env' does not exist on type 'ImportMeta'" error.
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        throw new Error("A variável de ambiente API_KEY está ausente. Por favor, configure-a.");
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
    if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();
        if (lowerCaseMessage.includes("api key not valid") || lowerCaseMessage.includes("permission denied")) {
            // FIX: Updated error message to refer to API_KEY to align with API key handling changes.
            throw new Error("Falha na autenticação. Verifique se sua API_KEY está correta e se a API Generative Language está ativada em seu projeto Google Cloud.");
        }
        if (lowerCaseMessage.includes("billed users")) {
            throw new Error("A API de Imagens do Google requer uma conta de faturamento ativa. Por favor, habilite o faturamento no seu projeto do Google Cloud para usar este recurso.");
        }
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Falha ao gerar a imagem. Detalhe: ${errorMessage}`);
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
        // FIX: Updated error message to refer to API_KEY to align with API key handling changes.
        if (error instanceof Error && (error.message.toLowerCase().includes("api key not valid") || error.message.toLowerCase().includes("permission denied"))) {
            throw new Error("Falha na autenticação. Verifique se sua API_KEY está correta e se a API Generative Language está ativada em seu projeto Google Cloud.");
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Falha ao editar a imagem. Detalhe: ${errorMessage}`);
    }
};
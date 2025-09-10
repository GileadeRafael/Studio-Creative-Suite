import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio } from "../types";

// Singleton instance of the AI client
let aiInstance: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI instance.
 * This prevents the app from crashing on load if the API key is missing.
 * @returns {GoogleGenAI} The initialized GoogleGenAI client.
 * @throws {Error} If the API_KEY environment variable is not set.
 */
const getAiClient = (): GoogleGenAI => {
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
            // Check for safety feedback. The structure is assumed based on other Gemini APIs.
            // Using `any` to access potential properties that may not be in the strict type definition.
            const feedback = (response as any).promptFeedback;
            if (feedback?.blockReason) {
                let reason = `Sua solicitação foi bloqueada por razões de segurança (${feedback.blockReason}).`;
                
                // Try to get more details from safetyRatings
                if (Array.isArray(feedback.safetyRatings)) {
                    const blockedCategories = feedback.safetyRatings
                        .filter((rating: any) => rating.blocked === true)
                        .map((rating: any) => rating.category.replace('HARM_CATEGORY_', ''))
                        .join(', ');
                    
                    if (blockedCategories) {
                        reason += ` Categoria(s) detectada(s): ${blockedCategories}.`;
                    }
                }
                
                reason += " Por favor, ajuste seu prompt e tente novamente.";
                throw new Error(reason);
            }
            throw new Error('A API não retornou nenhuma imagem. Isso pode ser devido a filtros de segurança ou a um prompt muito vago. Tente ser mais descritivo.');
        }

    } catch (error) {
        console.error("Erro ao gerar imagem com o Gemini:", error);
         if (error instanceof Error) {
            if (error.message.toLowerCase().includes("billing")) {
                 throw new Error("A API de Imagens do Google requer uma conta de faturamento ativa. Por favor, habilite o faturamento no seu projeto do Google Cloud para usar este recurso.");
            }
            if (error.message.toLowerCase().includes("api key not valid") || error.message.toLowerCase().includes("permission denied")) {
                throw new Error("Falha na autenticação. Verifique se sua API_KEY está correta e se a API Generative Language está ativada em seu projeto Google Cloud.");
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
            const textResponse = response.candidates?.[0]?.content?.parts.find(part => part.text)?.text;
            throw new Error(`A edição de imagem falhou. Resposta da IA: ${textResponse || 'Nenhuma imagem retornada.'}`);
        }
    } catch (error) {
        console.error("Erro ao editar imagem com o Gemini:", error);
        if (error instanceof Error && (error.message.toLowerCase().includes("api key not valid") || error.message.toLowerCase().includes("permission denied"))) {
            throw new Error("Falha na autenticação. Verifique se sua API_KEY está correta e se a API Generative Language está ativada em seu projeto Google Cloud.");
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Falha ao editar a imagem. Detalhe: ${errorMessage}`);
    }
};
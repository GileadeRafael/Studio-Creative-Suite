import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio } from '../types';

if (!process.env.API_KEY) {
  throw new Error("A variável de ambiente API_KEY está ausente. Defina-a nas configurações do seu projeto Vercel.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    throw new Error("Falha ao gerar a imagem. Verifique seu prompt ou a chave da API.");
  }
};

export const editImage = async (prompt: string, referenceImages: {data: string, mimeType: string}[]): Promise<string> => {
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
        throw new Error("Falha ao editar a imagem. Verifique seu prompt, imagem de referência ou chave da API.");
    }
};

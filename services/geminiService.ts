import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = (): string => {
    // A chave da API é obtida da variável de ambiente `process.env.API_KEY`
    // que é configurada externamente no ambiente de execução.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("A chave da API do Gemini não está configurada. Verifique as variáveis de ambiente.");
    }
    return apiKey;
};

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType:string; } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Failed to read file as base64 string.'));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const tableSchema = {
    type: Type.OBJECT,
    properties: {
        headers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Os títulos das colunas da tabela."
        },
        rows: {
            type: Type.ARRAY,
            items: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            },
            description: "Os dados da linha da tabela, com cada array interno representando uma linha."
        },
    },
    required: ["headers", "rows"],
};

export const generateFollowUp = async (prompt: string): Promise<string> => {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Erro na API Gemini para ação de acompanhamento:", error);
        throw new Error("Falha ao processar a solicitação. Verifique o console para mais detalhes.");
    }
};


export const extractTextFromImage = async (imageFile: File, isTable: boolean): Promise<{ data: string }> => {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const imagePart = await fileToGenerativePart(imageFile);
    let extractedData = "";
    
    if (isTable) {
        const textPart = {
            text: "Analise a imagem, identifique a estrutura da tabela, incluindo os cabeçalhos. Extraia todos os dados da tabela. Retorne os dados como um objeto JSON que corresponda ao esquema fornecido. Se nenhuma tabela for encontrada, retorne um objeto com 'headers' e 'rows' vazios."
        };
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: tableSchema,
                }
            });
            extractedData = response.text;
        } catch (error) {
            console.error("Erro na API Gemini para extração de tabela:", error);
            throw new Error("Falha ao extrair a tabela da imagem. Verifique o console para mais detalhes.");
        }
    } else {
        const textPart = {
            text: "Extraia todo o texto visível desta imagem. Responda apenas com o texto extraído, sem qualquer formatação, explicação ou texto adicional."
        };

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });
            
            extractedData = response.text.trim();

        } catch(error) {
            console.error("Erro na API Gemini:", error);
            throw new Error("Falha ao extrair texto da imagem. Verifique o console para mais detalhes.");
        }
    }

    return { data: extractedData };
};
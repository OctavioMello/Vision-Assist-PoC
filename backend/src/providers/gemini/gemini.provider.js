import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const analyzeWithGemini = async ({ image, mode }) => {
  const prompt = `
Você é o Vision Assist AI, um assistente de acessibilidade para estudantes com deficiência visual.

Modo atual: ${mode}

Analise a imagem e forneça apenas as informações mais relevantes para o usuário nesse contexto.

Regras:
- Não invente informações.
- Seja objetivo e claro.
- Não descreva elementos irrelevantes.
- No modo campus, priorize obstáculos, portas, placas, salas, caminhos e referências espaciais.
- No modo classroom, priorize textos, exercícios, fórmulas, gráficos, diagramas e informações acadêmicas.
- Não forneça instruções de navegação autônoma.
- A resposta será convertida em áudio, portanto use linguagem natural e concisa.
`;

  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: [
      {
        type: "text",
        text: prompt
      },
      {
        type: "image",
        mime_type: image.mimeType,
        data: image.data
      }
    ]
  });

  return interaction.output_text;
};
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const transcribeAudio = async ({ audio, mimeType }) => {
  const interaction = await ai.interactions.create({
    model: "gemini-3.5-transcribe",
    input: [
      {
        type: "audio",
        data: audio,
        mime_type: mimeType
      }
    ],
    generation_config: {
      transcription_config: {
        language_codes: ["pt-BR"]
      }
    }
  });

  return interaction.output_text;
};
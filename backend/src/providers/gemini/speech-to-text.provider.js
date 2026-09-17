import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const transcribeAudio = async ({ audio, mimeType }) => {
  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: [
      {
        type: "text",
        text: "Generate a transcript of the speech. Respond only with the exact spoken text in Brazilian Portuguese."
      },
      {
        type: "audio",
        data: audio,
        mime_type: "audio/webm"
      }
    ]
  });

  return interaction.output_text;
};
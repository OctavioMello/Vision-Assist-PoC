import { analyzeWithGemini } from "../providers/gemini/gemini.provider.js";
import { synthesizeSpeech } from "../providers/gemini/text-to-speech.provider.js";

export const analyzeImage = async ({ image, mode }) => {
  console.time("⏱️ GEMINI ANALYZE");

  const result = await analyzeWithGemini({ image, mode });

  console.timeEnd("⏱️ GEMINI ANALYZE");

  let audio = null;

  try {
    console.time("⏱️ TTS ANALYZE");

    audio = await synthesizeSpeech(result);

    console.timeEnd("⏱️ TTS ANALYZE");
  } catch (error) {
    console.error("Erro ao gerar áudio:", error);
    console.timeEnd("⏱️ TTS ANALYZE");
  }

  return { result, audio };
};
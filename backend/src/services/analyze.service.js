import { analyzeWithGemini } from "../providers/gemini/gemini.provider.js";
import { synthesizeSpeech } from "../providers/gemini/text-to-speech.provider.js";

export const analyzeImage = async ({ image, mode }) => {
  const result = await analyzeWithGemini({
    image,
    mode
  });

  let audio = null;

  try {
    audio = await synthesizeSpeech(result);
  } catch (error) {
    console.error("Erro ao gerar áudio:", error);
  }

  return {
    result,
    audio
  };
};
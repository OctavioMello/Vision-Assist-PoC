import { analyzeWithGemini } from "../providers/gemini/gemini.provider.js";
import { synthesizeSpeech } from "../providers/gemini/text-to-speech.provider.js";

export const analyzeImage = async ({ image, mode }) => {
  const result = await analyzeWithGemini({
    image,
    mode
  });

  const audio = await synthesizeSpeech(result);

  return {
    result,
    audio
  };
};
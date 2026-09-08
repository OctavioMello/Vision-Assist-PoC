import { analyzeWithGemini } from "../providers/gemini/gemini.provider.js";

export const analyzeImage = async ({ image, mode }) => {
  return await analyzeWithGemini({
    image,
    mode
  });
};
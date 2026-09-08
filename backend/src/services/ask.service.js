import { analyzeWithGemini } from "../providers/gemini/gemini.provider.js";

export const askQuestion = async ({ image, mode, question, context }) => {
  return await analyzeWithGemini({
    image,
    mode,
    question,
    context
  });
};
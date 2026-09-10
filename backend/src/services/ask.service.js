import { analyzeWithGemini } from "../providers/gemini/gemini.provider.js";
import { synthesizeSpeech } from "../providers/gemini/text-to-speech.provider.js";

export const askQuestion = async ({ image, mode, question, context }) => {
  const result = await analyzeWithGemini({
    image,
    mode,
    question,
    context,
  });

  let audio = null;

  try {
    audio = await synthesizeSpeech(result);
  } catch (error) {
    console.error("Erro ao gerar áudio:", error);
  }

  return {
    result,
    audio,
  };
};

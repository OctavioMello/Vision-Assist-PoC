import { analyzeWithGemini } from "../providers/gemini/gemini.provider.js";
import { synthesizeSpeech } from "../providers/gemini/text-to-speech.provider.js";

export const askQuestion = async ({ image, mode, question, context }) => {
  console.time("⏱️ GEMINI ASK");

  const result = await analyzeWithGemini({
    image,
    mode,
    question,
    context,
  });

  console.timeEnd("⏱️ GEMINI ASK");

  let audio = null;

  try {
    console.time("⏱️ TTS ASK");

    audio = await synthesizeSpeech(result);

    console.timeEnd("⏱️ TTS ASK");
  } catch (error) {
    console.error("Erro ao gerar áudio:", error);
    console.timeEnd("⏱️ TTS ASK");
  }

  return { result, audio };
};
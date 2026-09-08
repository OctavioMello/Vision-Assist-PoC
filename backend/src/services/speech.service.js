import { transcribeAudio } from "../providers/gemini/speech-to-text.provider.js";
import { synthesizeSpeech } from "../providers/gemini/text-to-speech.provider.js";

export const speechToText = async ({ audio, mimeType }) => {
  return await transcribeAudio({
    audio,
    mimeType
  });
};

export const textToSpeech = async (text) => {
  return await synthesizeSpeech(text);
};
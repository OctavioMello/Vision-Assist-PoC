import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const createWav = (pcmData) => {
  const channels = 1;
  const sampleRate = 24000;
  const bitsPerSample = 16;

  const blockAlign = channels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;

  const buffer = Buffer.alloc(44 + pcmData.length);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + pcmData.length, 4);
  buffer.write("WAVE", 8);

  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  buffer.write("data", 36);
  buffer.writeUInt32LE(pcmData.length, 40);

  pcmData.copy(buffer, 44);

  return buffer;
};

export const synthesizeSpeech = async (text) => {
  const interaction = await ai.interactions.create({
    model: "gemini-3.1-flash-tts-preview",
    input: text,
    response_format: {
      type: "audio"
    },
    generation_config: {
      speech_config: [
        {
          voice: "Kore"
        }
      ]
    }
  });

  const pcmData = Buffer.from(
    interaction.output_audio.data,
    "base64"
  );

  const wavData = createWav(pcmData);

  return wavData.toString("base64");
};
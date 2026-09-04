require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const wav = require("wav");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

function saveWaveFile(filename, pcmData) {
    return new Promise((resolve, reject) => {
        const writer = new wav.FileWriter(filename, {
            channels: 1,
            sampleRate: 24000,
            bitDepth: 16,
        });

        writer.on("finish", resolve);
        writer.on("error", reject);

        writer.write(pcmData);
        writer.end();
    });
}

async function main() {
    const interaction = await ai.interactions.create({
        model: "gemini-3.1-flash-tts-preview",
        input: "Há uma mesa e algumas cadeiras à sua frente.",
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

    const audioBuffer = Buffer.from(
        interaction.output_audio.data,
        "base64"
    );

    await saveWaveFile("teste-tts.wav", audioBuffer);

    console.log("Áudio gerado com sucesso: teste-tts.wav");
}

main();
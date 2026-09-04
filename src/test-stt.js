require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function main() {
    const audioFile = await ai.files.upload({
        file: "teste-audio-2.wav",
        config: {
            mime_type: "audio/wav"
        }
    });

    const interaction = await ai.interactions.create({
        model: "gemini-3.5-transcribe",
        input: [
            {
                type: "audio",
                uri: audioFile.uri,
                mime_type: audioFile.mimeType,
            },
        ],
    });

    console.log("Texto reconhecido:");
    console.log(interaction.output_text);
}

main();
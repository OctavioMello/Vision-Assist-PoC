require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const wav = require("wav");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const imageData = fs.readFileSync("imagem-coworking.jpg");
const base64Image = imageData.toString("base64");

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

    // 1. Pergunta em áudio → texto
    const audioFile = await ai.files.upload({
        file: "teste-audio-2.wav",
        config: {
            mime_type: "audio/wav"
        }
    });

    const transcription = await ai.interactions.create({
        model: "gemini-3.5-transcribe",

        input: [
            {
                type: "audio",
                uri: audioFile.uri,
                mime_type: audioFile.mimeType,
            },
        ],
    });

    const question = transcription.output_text;

    console.log("Pergunta reconhecida:");
    console.log(question);

    // 2. Imagem + pergunta → resposta contextual
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: [
            {
                inlineData: {
                    mimeType: "image/jpg",
                    data: base64Image,
                },
            },
            {
                text: `
Você é um assistente de acessibilidade para um estudante
com deficiência visual.

Responda à pergunta do usuário utilizando a imagem como
contexto.

Pergunta do usuário:
"${question}"

Responda somente com as informações visuais relevantes
para responder à pergunta.

Se a pergunta envolver obstáculos ou circulação, considere
como relevantes objetos que possam interferir na circulação,
como mesas, cadeiras, bancos ou outros elementos presentes
no ambiente.

Não descreva toda a imagem se isso não for necessário.

Não forneça instruções de navegação e não tome decisões
pelo usuário.

Não invente informações.

Responda em português do Brasil, de forma natural,
objetiva e adequada para ser convertida em áudio.
`
            }
        ],
    });

    const answer = response.text;

    console.log("\nResposta contextual:");
    console.log(answer);

    // 3. Resposta textual → áudio
    const interaction = await ai.interactions.create({
        model: "gemini-3.1-flash-tts-preview",

        input: answer,

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

    await saveWaveFile(
        "teste-fluxo-completo.wav",
        audioBuffer
    );

    console.log("\nÁudio gerado com sucesso: teste-fluxo-completo.wav");
}

main();
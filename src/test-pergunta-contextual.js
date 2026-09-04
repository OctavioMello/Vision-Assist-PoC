require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const imageData = fs.readFileSync("imagem-coworking.jpg");
const base64Image = imageData.toString("base64");

async function main() {

    // 1. Transcrever a pergunta do usuário
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

    // 2. Enviar imagem + pergunta para a IA
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

Responda somente com as informações que podem ser
identificadas visualmente na imagem e que sejam relevantes
para a pergunta.

Se a pergunta envolver obstáculos ou circulação, considere
como relevantes objetos que possam interferir na circulação,
como mesas, cadeiras, bancos ou outros elementos presentes
no ambiente.

Não descreva toda a imagem se isso não for necessário para
responder à pergunta.

Não forneça instruções de navegação e não tome decisões
pelo usuário.

Não invente informações. Se a pergunta não puder ser
respondida com segurança pela imagem, deixe isso claro.

Responda em português do Brasil, de forma natural e objetiva.
`
            }
        ],
    });

    console.log("\nResposta contextual:");
    console.log(response.text);
}

main();
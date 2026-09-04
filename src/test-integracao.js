require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
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
    // ==========================================
    // ETAPA 1 — IMAGEM → RESPOSTA TEXTUAL
    // ==========================================

    const imageData = fs.readFileSync("imagem-coworking.jpg");
    const base64Image = imageData.toString("base64");

    const visionResponse = await ai.models.generateContent({
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
Analise esta imagem como um assistente de acessibilidade
para um estudante com deficiência visual.

A resposta será convertida em áudio. Portanto, apresente
as informações de forma natural, objetiva e fácil de
compreender ao ouvir.

Organize mentalmente as informações por ordem de relevância,
mas NÃO revele essa organização na resposta.

Considere a perspectiva da câmera como uma referência
aproximada da posição e do campo de visão do usuário.

Ao descrever os elementos, considere também sua proximidade
aparente em relação à câmera. Elementos que ocupam a região
inferior da imagem ou aparecem mais próximos do ponto de vista
da câmera podem ser descritos como próximos, enquanto
elementos ao fundo podem ser descritos como mais distantes.

Use referências como "próximo à câmera", "mais à frente",
"ao fundo", "ao lado" ou "próximo à porta" somente quando
essas relações puderem ser observadas visualmente.

Quando houver uma referência espacial clara em relação ao
campo de visão da câmera, ela deve ser incluída, especialmente
para obstáculos ou objetos que possam interferir na circulação.

Não informe distâncias numéricas e não finja conhecer a
posição física exata do usuário no ambiente.

Priorize:
- obstáculos ou objetos que possam interferir na circulação;
- elementos que estejam próximos ao campo de visão do usuário;
- referências espaciais importantes, como portas, mesas,
  paredes e áreas de passagem;
- placas, textos e sinalizações relevantes;
- outros elementos somente quando contribuírem para
  compreender o ambiente.

A resposta deve ser uma descrição contínua e natural.

NÃO use:
- números ou listas;
- títulos ou subtítulos;
- nomes de categorias;
- expressões como "obstáculos", "referências espaciais"
  ou "outros elementos" para organizar a resposta.

Não descreva cores, materiais, texturas ou elementos decorativos,
a menos que sejam importantes para compreender o ambiente.

Não forneça instruções de navegação e não tome decisões pelo usuário.

Não invente informações. Identifique somente aquilo que puder
ser confirmado visualmente.

Se uma relação espacial não puder ser determinada com segurança,
simplesmente não a mencione.

Seja objetivo e responda em português do Brasil.
`
            }
        ],
    });

    const textoResposta = visionResponse.text;

    console.log("Resposta da IA:");
    console.log(textoResposta);

    // ==========================================
    // ETAPA 2 — RESPOSTA TEXTUAL → ÁUDIO
    // ==========================================

    try {
    const interaction = await ai.interactions.create({
        model: "gemini-3.1-flash-tts-preview",
        input: textoResposta,
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

    console.log("\nResposta recebida do TTS.");

    const audioBuffer = Buffer.from(
        interaction.output_audio.data,
        "base64"
    );

    console.log("Tamanho do áudio:", audioBuffer.length, "bytes");

    await saveWaveFile("teste-integracao.wav", audioBuffer);

    console.log("Áudio gerado com sucesso: teste-integracao.wav");

} catch (error) {
    console.error("\nERRO NO TTS:");
    console.error(error);
}
}
main();
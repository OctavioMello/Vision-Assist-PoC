require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const imageData = fs.readFileSync("imagem-coworking.jpg");
const base64Image = imageData.toString("base64");

async function main() {
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
Analise esta imagem como um assistente de acessibilidade
para um estudante com deficiência visual.

Responda à seguinte pergunta considerando somente as
informações que podem ser identificadas visualmente na imagem:

"Existe algum obstáculo próximo à mesa?"

Se houver um obstáculo, explique de forma objetiva qual é
e qual é sua relação espacial com a mesa.

Não forneça instruções de navegação e não tome decisões
pelo usuário.

Não invente informações. Se a resposta não puder ser
determinada com segurança pela imagem, deixe isso claro.

Responda em português do Brasil, de forma natural e objetiva.
`
            }
        ],
    });

    console.log("Resposta contextual:");
    console.log(response.text);
}

main();
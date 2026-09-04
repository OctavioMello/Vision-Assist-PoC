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
                    mimeType: "image/jpeg",
                    data: base64Image,
                },
            },
            {
                text: `
Analise esta imagem como um assistente de acessibilidade
para um estudante com deficiência visual.

Identifique somente informações que possam ser confirmadas
visualmente na imagem.

Dê prioridade a:
1. obstáculos ou elementos que possam interferir na circulação;
2. referências espaciais importantes;
3. placas, textos e sinalizações;
4. outros elementos relevantes para compreender o ambiente.

Para cada elemento, descreva apenas características
que sejam claramente visíveis.

Não presuma:
- o que existe fora do campo de visão;
- o que existe atrás de portas ou paredes;
- a função de um objeto quando ela não puder ser identificada
com segurança;
- o destino de um caminho;
- se uma área é segura ou insegura;
- informações que não estejam visíveis na imagem.

Não forneça instruções de navegação e não tome decisões pelo usuário.

Se houver alguma informação que não possa ser identificada
com segurança, simplesmente não a mencione.

Não invente informações.

Responda em português do Brasil, de forma objetiva e clara.
`,
            },
        ],
    });

    console.log(response.text);
}

main();
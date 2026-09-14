# Vision Assist AI

> Transformamos informações visuais do campus em informações acessíveis por áudio.

O Vision Assist AI é um assistente de percepção visual desenvolvido para estudantes universitários com deficiência visual.

Utilizando câmera, inteligência artificial e síntese de voz, o sistema identifica informações visuais relevantes do ambiente universitário ou de materiais acadêmicos e as comunica ao usuário por áudio, de forma objetiva e contextual.

> A IA fornece a informação. O usuário decide.

---

## Sobre o projeto

O ambiente universitário apresenta diversas informações que dependem da visão: placas, portas, salas, obstáculos, quadros, exercícios, textos, gráficos e outros conteúdos acadêmicos.

Para uma pessoa com deficiência visual, o acesso a essas informações pode depender frequentemente da ajuda de outra pessoa.

O Vision Assist AI busca reduzir essa dependência oferecendo uma camada de percepção visual acessível por voz.

O sistema segue o princípio:

**Perceber → Interpretar → Comunicar**

---

## Problema

Informações visuais estão presentes constantemente no ambiente universitário, mas nem sempre são acessíveis para estudantes com deficiência visual.

Entre os exemplos estão:

- Identificação de salas e portas
- Placas e sinalizações
- Obstáculos e passagens
- Informações escritas em ambientes
- Conteúdos apresentados em quadros e slides
- Exercícios e instruções
- Gráficos, tabelas e diagramas

O desafio não é apenas reconhecer o que está diante da câmera, mas identificar o que é relevante naquele contexto.

---

## Solução

O Vision Assist AI utiliza a câmera do dispositivo para capturar uma imagem e uma inteligência artificial para interpretá-la de acordo com o contexto selecionado pelo usuário.

O resultado é transformado em áudio por meio de síntese de voz.

O usuário pode escolher entre dois modos principais:

### AMBIENTE

Focado na compreensão do espaço ao redor.

O sistema prioriza informações como:

- Portas
- Salas
- Placas
- Referências visuais
- Obstáculos
- Passagens e áreas de circulação

A resposta utiliza referências espaciais relativas somente quando elas podem ser identificadas visualmente.

O Vision Assist AI não realiza navegação autônoma, GPS, mapas ou cálculo de distância.

### SALA

Focado em ambientes acadêmicos e conteúdos de aula.

O sistema identifica e prioriza elementos como:

- Quadros
- Slides
- Textos
- Exercícios
- Fórmulas
- Gráficos
- Tabelas
- Diagramas
- Instruções acadêmicas

O princípio central desse modo é:

> Perceber tudo não significa falar tudo.

A inteligência artificial analisa a imagem completa para compreender o contexto, mas comunica somente as informações relevantes para aquele momento.

---

## Interação por voz

O Vision Assist AI foi projetado como uma experiência voice-first.

O usuário pode utilizar comandos de voz para:

- Escolher o modo
- Solicitar uma análise
- Pedir um resumo
- Solicitar contextualização
- Realizar perguntas relacionadas ao conteúdo analisado
- Trocar de modo

A interface visual funciona como suporte à experiência, enquanto a comunicação principal acontece por áudio.

---

## Resumo e contextualização

No modo SALA, o usuário pode aprofundar uma análise realizada anteriormente.

### Resumo

Apresenta de forma condensada o que está visualmente presente no material.

O objetivo é responder:

> "O que esse material apresenta?"

O resumo deve permanecer focado no conteúdo visual, sem transformar a imagem em uma aula ou adicionar informações desnecessárias.

### Contextualização

Explica o significado do conteúdo apresentado.

O objetivo é responder:

> "O que esse conteúdo significa?"

A contextualização pode utilizar conhecimento geral quando isso for relevante para compreender o material, mantendo a resposta objetiva e relacionada ao contexto acadêmico.

---

## Arquitetura

O projeto utiliza uma arquitetura separando frontend, backend e serviços de inteligência artificial.

Frontend:
React + Vite

Backend:
Node.js + Express

Inteligência Artificial:
Google Gemini

Fluxo principal:

Câmera
↓
Captura da imagem
↓
Backend
↓
Gemini
↓
Interpretação contextual
↓
Resposta
↓
Síntese de voz
↓
Áudio para o usuário

---

## Tecnologias

### Frontend

- React
- Vite
- JavaScript
- CSS
- HTML5
- MediaDevices API
- MediaRecorder API
- Web Audio API

### Backend

- Node.js
- Express
- CORS
- REST API

### Inteligência Artificial

- Google Gemini para análise multimodal
- Gemini para transcrição de voz
- Gemini TTS para síntese de voz

### Deploy

- Vercel — Frontend
- Render — Backend

---

## Estrutura do projeto

vision-assist-poc/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── providers/
│   │   │   └── gemini/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   │
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── audio/
│   │       └── welcome.wav
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── Eye.jsx
│   │   └── appState.js
│   │
│   └── package.json
│
├── package.json
└── package-lock.json

---

## Como executar localmente

### Pré-requisitos

- Node.js
- npm
- Chave de API do Google Gemini

### Backend

Entre na pasta:

cd backend

Instale as dependências:

npm install

Configure a variável de ambiente:

GEMINI_API_KEY=sua_chave_aqui

Execute:

npm run dev

O backend será iniciado em:

http://localhost:3000

### Frontend

Em outro terminal:

cd frontend

Instale as dependências:

npm install

Execute:

npm run dev

O Vite disponibilizará a aplicação localmente.

---

## Variáveis de ambiente

O backend utiliza:

GEMINI_API_KEY=

A chave da API deve permanecer exclusivamente no backend.

Nunca exponha a chave da API no frontend ou no repositório Git.

---

## Deploy

O projeto utiliza dois serviços independentes.

### Frontend

Hospedado na Vercel:

https://vision-assist-ai-sable.vercel.app/

### Backend

Hospedado no Render.

O frontend realiza as requisições para o backend por HTTP.

A chave da API do Gemini permanece configurada somente no ambiente do backend.

---

## Limitações atuais

O Vision Assist AI é um protótipo desenvolvido para demonstrar a proposta do produto.

Atualmente, o sistema não possui:

- Navegação autônoma
- GPS
- Mapas
- Cálculo de distância
- Localização interna
- Treinamento de modelo próprio
- Infraestrutura de escala para produção
- Análise visual contínua

O sistema depende da qualidade da imagem capturada e pode apresentar limitações quando o conteúdo está:

- Borrado
- Parcialmente oculto
- Distante
- Cortado
- Com baixa iluminação
- Ilegível

Nessas situações, o sistema deve comunicar a limitação em vez de inventar informações.

---

## Princípios do produto

### Relevância antes de quantidade

O objetivo não é descrever tudo que a câmera encontra.

O sistema deve identificar o que é relevante para o contexto e para a solicitação do usuário.

### Transparência

Quando uma informação não pode ser identificada com segurança, o sistema deve reconhecer essa limitação.

### Autonomia

A inteligência artificial não toma decisões pelo usuário.

> A IA fornece informação. O usuário decide.

### Contexto

A mesma imagem pode possuir significados diferentes dependendo do ambiente e da intenção do usuário.

Por isso, o Vision Assist AI utiliza modos específicos para direcionar a interpretação.

---

## Visão de produto

O Vision Assist AI busca transformar informações visuais presentes no ambiente universitário em informações acessíveis por áudio.

Mais do que reconhecer objetos, a proposta é fornecer ao usuário a informação relevante para que ele possa agir com maior autonomia.

> Mais informação para que você precise de menos ajuda.

---

## Projeto acadêmico

Projeto desenvolvido no contexto do FIAP Challenge, no curso de Engenharia de Software.

O projeto foi desenvolvido como um protótipo funcional para demonstrar a aplicação de inteligência artificial multimodal em acessibilidade no ambiente universitário.

---

## Status

**Protótipo funcional — versão de apresentação**

O fluxo principal está implementado:

- Captura de câmera
- Interação por voz
- Seleção de modo
- Análise visual
- Perguntas contextuais
- Resumo
- Contextualização
- Síntese de voz
- Interface responsiva
- Frontend e backend publicados

---

## Licença

Projeto acadêmico desenvolvido para fins educacionais e de demonstração.

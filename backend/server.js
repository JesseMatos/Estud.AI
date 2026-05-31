require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

app.post("/resumir", async (req, res) => {

  try{

    const { texto } = req.body;
    const prompt = `
    Você é um educador especialista.

    Resuma esse conteúdo destacando os principais pontos com uma linguagem clara, objetiva e de fácil compreensão:

    ${texto}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resumo = await response.text();

    console.log(resumo);

    res.json({
      resumo
    });

  }catch(error){

    console.log(error);

    res.status(500).json({
      erro: "Erro ao gerar resumo."
    });

  }

});

app.post("/quiz", async (req, res) => {
  try{
    const { texto } = req.body;
    const prompt = `
    Você é um professor especialista.

    Com base no conteúdo abaixo, crie 10 questões de multipla escolha.

    Regras:

    - Cada questão deve ter 4 alternativas (A, B, C e D)
    - Informe a resposta correta ao final de cada questão
    - Utilize linguagem clara e didática
    - Formate utilizando Markdown

    Conteúdo:

    ${texto}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const quiz = await response.text();
    res.json({
      quiz
    });
  }catch(error){
    console.log(error);
    res.status(500).json({
      erro: "Erro ao gerar quiz."
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
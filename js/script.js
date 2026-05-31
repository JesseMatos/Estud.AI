const pdfInput = document.getElementById("pdfInput");
const fileName = document.getElementById("fileName");
const uploadArea = document.getElementById("uploadArea");
const removeFileBtn = document.getElementById("removeFileBtn");
const generateBtn = document.getElementById("generateBtn");
const loading = document.getElementById("loading");
const result = document.getElementById("result");
const summaryText = document.getElementById("summaryText");
const loadingText = document.getElementById("loadingText");
const downloadBtn = document.getElementById("downloadBtn");
const quizBtn = document.getElementById("quizBtn");
const quizResult = document.getElementById("quizResult");
const quizText = document.getElementById("quizText");

uploadArea.addEventListener("click", () => {
  pdfInput.click();
});

pdfInput.addEventListener("change", () => {

  const file = pdfInput.files[0];

  if(file){
    fileName.textContent = `Arquivo selecionado: ${file.name}`;

    removeFileBtn.style.display = "flex";
  }

});

const loadingMessages = [
  "🧠 Analisando conteúdo do PDF...",

  "📚 Identificando tópicos importantes...",

  "✍️ Gerando resumo inteligente...",

  "✨ Organizando informações...",

  "🚀 Finalizando resultado..."
]

generateBtn.addEventListener("click", async () => {

  const file = pdfInput.files[0];

  if(!file){
    alert("Selecione um PDF primeiro.");
    return;
  }

  loading.style.display = "flex";

  let messageIndex = 0;

  loadingText.textContent = loadingMessages[0];

  const loadingInterval = setInterval(() => {

    if(messageIndex < loadingMessages.length - 1){
      messageIndex++;
      loadingText.textContent = loadingMessages[messageIndex];
    }

  }, 3500);

  result.style.display = "none";

  const reader = new FileReader();

  reader.onload = async function() {

    const typedArray = new Uint8Array(this.result);

    const pdf = await pdfjsLib.getDocument(typedArray).promise;

    let fullText = "";

    for(let pageNum = 1; pageNum <= pdf.numPages; pageNum++){

      const page = await pdf.getPage(pageNum);

      const textContent = await page.getTextContent();

      const textItems = textContent.items.map(item => item.str);

      fullText += textItems.join(" ");
    }

    try{

      const response = await fetch("https://estud-ai-backend.onrender.com/resumir", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          texto: fullText
        })

      });

      const data = await response.json();

      clearInterval(loadingInterval);

      loading.style.display = "none";

      result.style.display = "block";

      summaryText.innerHTML = marked.parse(data.resumo);

    }catch(error){

      console.log(error);

      clearInterval(loadingInterval);

      loading.style.display = "none";

      alert("Erro ao gerar resumo.");

    }

  };

  reader.readAsArrayBuffer(file);

});

removeFileBtn.addEventListener("click", () => {

  pdfInput.value = "";

  fileName.textContent = "";

  result.style.display = "none";

  removeFileBtn.style.display = "none";

});

uploadArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
})

uploadArea.addEventListener("drop", (event) => {
  event.preventDefault();
  uploadArea.classList.remove("dragover");
  const file = event.dataTransfer.files[0];
  if (file && file.type === "application/pdf"){
    pdfInput.files = event.dataTransfer.files;
    fileName.textContent = `Arquivo selecionado: ${file.name}`;
    removeFileBtn.style.display = "flex";
  }else{
    alert("Por favor, envie um arquivo PDF.");
  }
});

downloadBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const resumo = summaryText.innerText;
  const dataAtual = new Date().toLocaleDateString("pt-BR");
  const larguraPagina = doc.internal.pageSize.getWidth();

  //TITULO
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(30, 41, 59);
  doc.text("ESTUD.AI", larguraPagina / 2, 25, { align: "center" });

  //SUBTITULO
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Resumo Inteligente gerado por IA", larguraPagina / 2, 35, { align: "center" });

  //LINHA DECORATIVA
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(1);
  doc.line(20, 45, 190, 45);

  //DATA
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Gerado em: ${dataAtual}`, 20, 55);

  //TEXTO
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.setTextColor(40);
  const linhas = doc.splitTextToSize(resumo, 170);
  let posicaoY = 75;
  linhas.forEach((linha) => {
    if(posicaoY > 270){
      doc.addPage();
      posicaoY = 30;
    }
    doc.text(linha, 20, posicaoY);
    posicaoY += 10;
  });

  //RODAPE
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Gerado automaticamente por Estud.AI", larguraPagina / 2, 285, { aligh: "center" });

  //DOWNLOAD
  doc.save("resumo-estud-ai.pdf");
});

quizBtn.addEventListener("click", async () => {
  try{
    quizBtn.disabled = true;
    quizBtn.textContent = "Gerando Quiz...";

    const response = await fetch(
      "https://estud-ai-backend.onrender.com/quiz",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        
        body: JSON.stringify({
          texto: summaryText.innerText
        })
      }
    );

    const data = await response.json();

    quizResult.style.display = "block";
    quizText.innerHTML = marked.parse(data.quiz);
    quizBtn.textContent = "📝 Gerar Quiz";
    quizBtn.disabled = false;

  }catch(error){
    console.log(error);
    alert("Erro ao gerar quiz.");
    quizBtn.textContent = "📝 Gerar Quiz";
    quizBtn.disabled = false;
  }
});
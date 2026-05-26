const pdfInput = document.getElementById("pdfInput");
const fileName = document.getElementById("fileName");
const uploadArea = document.getElementById("uploadArea");
const removeFileBtn = document.getElementById("removeFileBtn");
const generateBtn = document.getElementById("generateBtn");
const loading = document.getElementById("loading");
const result = document.getElementById("result");
const summaryText = document.getElementById("summaryText");
const loadingText = document.getElementById("loadingText");

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
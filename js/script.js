const pdfInput = document.getElementById("pdfInput");
const fileName = document.getElementById("fileName");
const uploadArea = document.getElementById("uploadArea");
const removeFileBtn = document.getElementById("removeFileBtn");

const generateBtn = document.getElementById("generateBtn");

const loading = document.getElementById("loading");

const result = document.getElementById("result");

const summaryText = document.getElementById("summaryText");

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

generateBtn.addEventListener("click", async () => {

  const file = pdfInput.files[0];

  if(!file){
    alert("Selecione um PDF primeiro.");
    return;
  }

  loading.style.display = "block";

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

      const response = await fetch("http://localhost:3000/resumir", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          texto: fullText
        })

      });

      const data = await response.json();

      loading.style.display = "none";

      result.style.display = "block";

      summaryText.innerHTML = marked.parse(data.resumo);

    }catch(error){

      console.log(error);

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
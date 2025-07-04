document.addEventListener("DOMContentLoaded", () => {
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  document.getElementById("dataAtual").textContent = dataFormatada;
  document.getElementById("numeroOrcamento").textContent =
    new Date().getFullYear() +
    "." +
    Math.floor(100000 + Math.random() * 900000);
  document
    .querySelectorAll(".qtd, .valor")
    .forEach((input) => input.addEventListener("input", atualizarTotais));
  atualizarTotais();
});

document.getElementById("cnpj").addEventListener("input", function (e) {
  let valor = e.target.value.replace(/\D/g, ""); // remove tudo que não é número

  if (valor.length > 14) valor = valor.slice(0, 14); // limita a 14 dígitos

  let formatado = valor;
  if (valor.length >= 3) formatado = valor.slice(0, 2) + "." + valor.slice(2);
  if (valor.length >= 6)
    formatado = formatado.slice(0, 6) + "." + valor.slice(5);
  if (valor.length >= 9)
    formatado = formatado.slice(0, 10) + "/" + valor.slice(8);
  if (valor.length >= 13)
    formatado = formatado.slice(0, 15) + "-" + valor.slice(12);

  e.target.value = formatado;
});

function atualizarTotais() {
  let total = 0;
  document.querySelectorAll("#corpoTabela tr").forEach((linha) => {
    const qtd = parseFloat(linha.querySelector(".qtd")?.value || 0);
    const valor = parseFloat(linha.querySelector(".valor")?.value || 0);
    const subtotal = qtd * valor;
    linha.querySelector(".subtotal").textContent = subtotal.toFixed(2);
    total += subtotal;
  });
  document.getElementById("valorTotal").textContent = total.toFixed(2);
}

function adicionarProduto() {
  const linha = document.createElement("tr");
  linha.innerHTML = `
        <td><input type="number" class="qtd" value="1" min="1" /></td>
        <td><input type="text" class="descricao" placeholder="Descrição do produto" /></td>
        <td><input type="number" class="valor" value="0.00" step="0.01" /></td>
        <td class="subtotal">0.00</td>
      `;
  document.getElementById("corpoTabela").appendChild(linha);
  linha.querySelector(".qtd").addEventListener("input", atualizarTotais);
  linha.querySelector(".valor").addEventListener("input", atualizarTotais);
}

function gerarPDF() {
  const area = document.getElementById("orcamentoArea");
  const opt = {
    margin: 10,
    filename: `Orcamento_${Date.now()}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };
  html2pdf().set(opt).from(area).save();
}

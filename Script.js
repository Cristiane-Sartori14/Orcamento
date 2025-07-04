document.addEventListener("DOMContentLoaded", () => {
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  document.getElementById("dataAtual").textContent = dataFormatada;

  const anoAtual = new Date().getFullYear();
  let contador = localStorage.getItem("contadorOrcamento");

  if (!contador || !contador.startsWith(anoAtual.toString())) {
    contador = `${anoAtual}.0001`;
  } else {
    const numeroAtual = parseInt(contador.split(".")[1], 10) + 1;
    contador = `${anoAtual}.${String(numeroAtual).padStart(4, "0")}`;
  }

  localStorage.setItem("contadorOrcamento", contador);
  document.getElementById("numeroOrcamento").textContent = contador;

  // Máscara dinâmica para CPF/CNPJ

  function aplicarMascaraDocumento(valor, tipo) {
    valor = valor.replace(/\D/g, ""); // remove não-dígitos

    if (tipo === "cnpj") {
      valor = valor.slice(0, 14);
      return valor
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    } else {
      valor = valor.slice(0, 11);
      return valor
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    }
  }
  // Aplica quando digita
  const inputDocumento = document.getElementById("documento");
  const selectTipo = document.getElementById("tipoDocumento");

  inputDocumento.addEventListener("input", () => {
    const tipo = selectTipo.value;
    inputDocumento.value = aplicarMascaraDocumento(inputDocumento.value, tipo);
  });

  // Muda placeholder quando muda tipo
  selectTipo.addEventListener("change", () => {
    inputDocumento.value = "";
    inputDocumento.placeholder =
      selectTipo.value === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00";
  });

  // Ativa os cálculos de totais da primeira linha
  document.querySelectorAll(".qtd, .valor").forEach((input) => {
    input.addEventListener("input", atualizarTotais);
  });

  atualizarTotais(); // executa cálculo inicial
});

function atualizarTotais() {
  let total = 0;
  document.querySelectorAll("#corpoTabela tr").forEach((linha) => {
    const qtd = parseFloat(linha.querySelector(".qtd")?.value || 0);
    const valor = parseFloat(linha.querySelector(".valor")?.value || 0);
    const subtotal = qtd * valor;

    // Formata o subtotal com vírgula
    linha.querySelector(".subtotal").textContent = subtotal
      .toFixed(2)
      .replace('.', ',');

    total += subtotal;
  });

  // Formata o total também com vírgula
  document.getElementById("valorTotal").textContent = total
    .toFixed(2)
    .replace('.', ',');
}

// Formatar valor com vírgula ao sair do campo
 document.querySelectorAll(".valor").forEach((input) => {
    input.addEventListener("blur", () => {
      const raw = input.value.replace(',', '.');
      const val = parseFloat(raw);
      if (!isNaN(val)) {
        input.value = val.toFixed(2).replace('.', ',');
      } else {
        input.value = '0,00'; // evita ficar vazio
      }
    });
  });


function adicionarProduto() {
  const linha = document.createElement("tr");
  linha.innerHTML = `
    <td><input type="number" class="qtd" value="1" min="1" /></td>
    <td><input type="text" class="descricao" placeholder="Descrição do produto" /></td>
    <td><input type="number" class="valor" value="0.00" step="0.01" /></td>
    <td class="subtotal">0,00</td>
  `;
  document.getElementById("corpoTabela").appendChild(linha);

  const qtdInput = linha.querySelector(".qtd");
  const valorInput = linha.querySelector(".valor");

  qtdInput.addEventListener("input", atualizarTotais);
  valorInput.addEventListener("input", atualizarTotais); // <--- ESSA LINHA FALTAVA!

  valorInput.addEventListener("blur", () => {
    const raw = valorInput.value.replace(',', '.');
    const val = parseFloat(raw);
    if (!isNaN(val)) {
      valorInput.value = val.toFixed(2).replace('.', ',');
    } else {
      valorInput.value = '0,00';
    }

    atualizarTotais(); // <- Garante que atualiza depois de formatar!
  });
}


function visualizarOrcamentoEmNovaPagina() {
  const original = document.getElementById("orcamentoArea");
  const clone = original.cloneNode(true); // Apenas uma vez!

  // Remove botões como "+ Produto"
  clone.querySelectorAll("button").forEach((btn) => btn.remove());

  // Remove elementos marcados para edição apenas
  clone.querySelectorAll(".apenas-edicao").forEach((el) => el.remove());

  // Substitui campos input/select por texto
  clone.querySelectorAll("input, select, textarea").forEach((campo) => {
    const span = document.createElement("span");

    if (campo.tagName === "SELECT") {
      span.textContent = campo.options[campo.selectedIndex]?.text || "";
    } else if (campo.classList.contains("valor")) {
      // valor unitário: força 2 casas e vírgula
      const val = parseFloat(campo.value.replace(',', '.')) || 0;
      span.textContent = val.toFixed(2).replace('.', ',');
    } else if (campo.classList.contains("qtd")) {
      // quantidade: mostra como inteiro
      span.textContent = parseInt(campo.value, 10);
    } else {
      // campo genérico
      span.textContent = campo.value;
    }

    span.className = campo.className;
    span.style.display = "inline-block";
    span.style.minWidth = "50px";

    campo.replaceWith(span);
  });

  // Abre nova aba limpa
  const novaJanela = window.open("", "_blank");
  if (!novaJanela) {
    alert("O navegador bloqueou a nova aba. Permita pop-ups.");
    return;
  }

  // Insere conteúdo e estilos
  novaJanela.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Orçamento</title>
      <link rel="stylesheet" href="Styles.css">
      <style>
        body {
          font-family: "Segoe UI", sans-serif;
          margin: 0;
          padding: 40px;
          background: #f9f9f9;
        }
        #orcamentoArea {
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          max-width: 900px;
          margin: auto;
          background: #fff;
          padding: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
          background-color: #f9f9f9;
        }
        th {
          background-color: #e0e0e0;
          font-weight: bold;
          text-align: left;
        }
        button, .botao {
          display: none !important;
        }
      </style>
    </head>
    <body>
      ${clone.outerHTML}
    </body>
    </html>
  `);
  novaJanela.document.close();
}
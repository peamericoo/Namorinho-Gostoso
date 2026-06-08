import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const cwd = "C:\\Users\\pedro.paletot\\Documents\\Codex\\2026-06-08\\files-mentioned-by-the-user-texto";
const outputDir = path.join(cwd, "outputs");
const previewDir = path.join(cwd, "work", "previews");
const outputPath = path.join(outputDir, "planejamento_financeiro_relacionamento_distancia.xlsx");

const PEDRO = "Pedro Américo Paletot";
const CAMILLY = "Camilly Queiroz";
const START_ROW = 6;
const END_ROW = 205;
const MAX_ROWS = END_ROW - START_ROW + 1;

const palette = {
  ink: "#263238",
  muted: "#64748B",
  navy: "#334E68",
  blue: "#DDEBFF",
  blueStrong: "#4779C4",
  pink: "#FCE0EC",
  lilac: "#EEE3FF",
  green: "#DDF7E9",
  greenStrong: "#2F9E65",
  purple: "#6C63B7",
  yellow: "#FFF3C4",
  red: "#FEE2E2",
  softRed: "#F8B4B4",
  surface: "#F8FAFC",
  line: "#D9E2EC",
  white: "#FFFFFF",
  formula: "#F1F5F9",
  input: "#EFF6FF",
  optional: "#FDF2F8",
};

const moneyFmt = 'R$ #,##0.00;[Red]-R$ #,##0.00;R$ -';
const pctFmt = '0.0%';
const dateFmt = 'dd/mm/yyyy';
const intFmt = '#,##0';

const categorias = [
  "Transporte principal",
  "Transporte local",
  "Hospedagem",
  "Alimentação",
  "Lazer e encontros",
  "Casa e estadia",
  "Comunicação e internet",
  "Saúde e segurança",
  "Documentos e taxas",
  "Presentes e relacionamento",
  "Beleza e autocuidado",
  "Trabalho e estudo",
  "Pets, família e casa",
  "Imprevistos",
];

const subcategoriasPorCategoria = {
  "Transporte principal": [
    "Passagem aérea",
    "Passagem de ônibus",
    "Passagem de trem",
    "Combustível",
    "Pedágio",
    "Estacionamento",
    "Bagagem despachada",
    "Bagagem de mão extra",
    "Marcação de assento",
    "Taxa de embarque",
    "Seguro viagem",
    "Transporte até aeroporto",
    "Transporte até rodoviária",
    "Transporte saindo do aeroporto",
    "Transporte saindo da rodoviária",
    "Remarcação de passagem",
    "Cancelamento de passagem",
  ],
  "Transporte local": [
    "Uber",
    "99",
    "Táxi",
    "Metrô",
    "Ônibus local",
    "Aluguel de carro",
    "Bicicleta",
    "Patinete",
    "Estacionamento local",
    "Transporte noturno",
    "Transporte emergencial",
  ],
  "Hospedagem": [
    "Airbnb",
    "Hotel",
    "Pousada",
    "Hostel",
    "Taxa de limpeza",
    "Taxa de serviço",
    "Caução",
    "Early check-in",
    "Late check-out",
    "Diária extra",
    "Hospedagem emergencial",
  ],
  "Alimentação": [
    "Café da manhã",
    "Almoço",
    "Jantar",
    "Lanches",
    "Delivery",
    "Mercado",
    "Bebidas",
    "Cafeteria",
    "Restaurante especial",
    "Comida no aeroporto",
    "Comida na rodoviária",
    "Sobremesas",
    "Comida para casa",
  ],
  "Lazer e encontros": [
    "Cinema",
    "Shows",
    "Passeios",
    "Restaurantes especiais",
    "Experiências românticas",
    "Fotos",
    "Eventos",
    "Museus",
    "Parques",
    "Praia",
    "Baladas",
    "Jogos",
    "Atividades gratuitas",
    "Atividades pagas",
  ],
  "Casa e estadia": [
    "Mercado para casa",
    "Produtos de higiene",
    "Produtos de limpeza",
    "Lavanderia",
    "Itens emergenciais",
    "Água",
    "Gás proporcional",
    "Luz proporcional",
    "Internet proporcional",
    "Pequenos reparos",
    "Itens esquecidos",
  ],
  "Comunicação e internet": [
    "Chip temporário",
    "Pacote de dados",
    "Wi-Fi",
    "Recarga de celular",
    "Ligações",
    "Apps pagos",
  ],
  "Saúde e segurança": [
    "Farmácia",
    "Consulta emergencial",
    "Seguro",
    "Absorventes/produtos pessoais",
    "Medicamentos",
    "Máscaras",
    "Álcool em gel",
    "Repelente",
    "Protetor solar",
    "Curativos",
  ],
  "Documentos e taxas": [
    "Documento",
    "Segunda via",
    "Taxas bancárias",
    "IOF",
    "Câmbio",
    "Multas",
    "Remarcações",
    "Cancelamentos",
    "Impressões",
    "Cópias",
    "Guarda-volumes",
  ],
  "Presentes e relacionamento": [
    "Flores",
    "Chocolates",
    "Cartas",
    "Presentes surpresa",
    "Aniversário de namoro",
    "Aniversário pessoal",
    "Datas especiais",
    "Mimos",
    "Decoração",
    "Álbum de fotos",
    "Lembranças",
  ],
  "Beleza e autocuidado": [
    "Cabelo",
    "Unhas",
    "Maquiagem",
    "Barba",
    "Roupa especial",
    "Perfume",
    "Acessórios",
    "Cuidados pessoais",
  ],
  "Trabalho e estudo": [
    "Coworking",
    "Internet extra",
    "Impressões",
    "Materiais de estudo",
    "Transporte para compromissos",
    "Alimentação em horário de trabalho",
    "Adaptações de agenda",
  ],
  "Pets, família e casa": [
    "Pet sitter",
    "Hospedagem de pet",
    "Ajuda para família",
    "Cuidador",
    "Organização da casa antes da viagem",
    "Serviços domésticos",
  ],
  "Imprevistos": [
    "Emergência",
    "Mudança de plano",
    "Hospedagem extra",
    "Transporte extra",
    "Alimentação extra",
    "Perda de item",
    "Roupa extra",
    "Remédio extra",
    "Taxas inesperadas",
    "Outros",
  ],
};

const flatSubcategorias = Object.values(subcategoriasPorCategoria).flat();
const pessoas = [PEDRO, CAMILLY, "Ambos"];
const formasPagamento = ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito", "Transferência", "Boleto", "Carteira digital"];
const statusViagem = ["Planejada", "Em andamento", "Concluída", "Cancelada", "Adiada"];
const statusTarefa = ["Pendente", "Em andamento", "Concluído", "Atrasado", "Cancelado"];
const statusAcerto = ["Pendente", "Parcial", "Concluído", "Cancelado"];
const prioridades = ["Alta", "Média", "Baixa"];
const tiposCusto = ["Fixo", "Variável", "Emergencial", "Opcional"];
const tiposHospedagem = ["Airbnb", "Hotel", "Pousada", "Hostel", "Casa de família", "Sem hospedagem"];
const tiposTransporte = ["Avião", "Ônibus", "Carro", "Trem", "Transporte local", "Misto"];
const politicasDivisao = ["50/50", "Pedro 60% / Camilly 40%", "Pedro 40% / Camilly 60%", "Quem pagou assume", "Personalizada"];
const simNao = ["Sim", "Não"];
const statusPlanejamento = ["Ideia", "Orçado", "Reservado", "Comprado", "Cancelado"];
const cidades = ["João Pessoa", "Cuiabá", "Campina Grande", "Recife", "São Paulo", "Brasília", "Natal", "Rio de Janeiro"];
const meses = ["jan/2026", "fev/2026", "mar/2026", "abr/2026", "mai/2026", "jun/2026", "jul/2026", "ago/2026", "set/2026", "out/2026", "nov/2026", "dez/2026"];

function colLetter(n) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function a1(col, row) {
  return `${colLetter(col)}${row}`;
}

function rangeA1(c1, r1, c2, r2) {
  return `${a1(c1, r1)}:${a1(c2, r2)}`;
}

function excelDate(y, m, d) {
  return new Date(y, m - 1, d);
}

function padRows(rows, width, count = MAX_ROWS) {
  return Array.from({ length: count }, (_, i) => {
    const src = rows[i] || [];
    return Array.from({ length: width }, (_, j) => src[j] ?? null);
  });
}

function formulaColumn(formulaFn, count = MAX_ROWS, startRow = START_ROW) {
  return Array.from({ length: count }, (_, i) => [formulaFn(startRow + i)]);
}

function safe(label, fn) {
  try {
    return fn();
  } catch (error) {
    console.warn(`Aviso: ${label}: ${error.message}`);
    return undefined;
  }
}

function setFormat(range, format) {
  safe("format", () => {
    range.format = format;
  });
}

function setNumberFormat(range, format) {
  safe("number format", () => {
    range.format.numberFormat = format;
  });
}

function setWidth(sheet, col, widthPx) {
  safe(`largura coluna ${col}`, () => {
    sheet.getRange(`${col}1:${col}260`).format.columnWidthPx = widthPx;
  });
}

function setHeight(sheet, row, heightPx, lastCol = 20) {
  safe(`altura linha ${row}`, () => {
    sheet.getRange(rangeA1(1, row, lastCol, row)).format.rowHeightPx = heightPx;
  });
}

function initSheet(sheet, title, subtitle, lastCol) {
  sheet.showGridLines = false;
  const last = colLetter(lastCol);
  safe(`merge título ${title}`, () => sheet.getRange(`A1:${last}1`).merge());
  sheet.getRange("A1").values = [[title]];
  setFormat(sheet.getRange(`A1:${last}1`), {
    fill: palette.navy,
    font: { bold: true, color: palette.white, size: 18 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
  });
  setHeight(sheet, 1, 34, lastCol);
  safe(`merge subtítulo ${title}`, () => sheet.getRange(`A2:${last}2`).merge());
  sheet.getRange("A2").values = [[subtitle]];
  setFormat(sheet.getRange(`A2:${last}2`), {
    fill: palette.surface,
    font: { color: palette.muted, italic: true },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
  });
  setHeight(sheet, 2, 28, lastCol);
}

function styleHeader(range, fill = palette.purple) {
  setFormat(range, {
    fill,
    font: { bold: true, color: palette.white },
    borders: { preset: "all", style: "thin", color: palette.line },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
  });
}

function styleBody(range) {
  setFormat(range, {
    fill: palette.white,
    font: { color: palette.ink },
    borders: { preset: "all", style: "thin", color: palette.line },
    verticalAlignment: "top",
    wrapText: true,
  });
}

function styleInput(range) {
  setFormat(range, {
    fill: palette.input,
    font: { color: "#0000FF" },
    borders: { preset: "all", style: "thin", color: palette.line },
    verticalAlignment: "top",
    wrapText: true,
  });
}

function styleFormula(range) {
  setFormat(range, {
    fill: palette.formula,
    font: { color: "#000000" },
    borders: { preset: "all", style: "thin", color: palette.line },
    verticalAlignment: "top",
    wrapText: true,
  });
}

function addTable(sheet, range, name, style = "TableStyleMedium2") {
  return safe(`tabela ${name}`, () => {
    const table = sheet.tables.add(range, true, name);
    table.style = style;
    table.showFilterButton = true;
    return table;
  });
}

function addValidation(range, formula1OrValues) {
  safe("validação de dados", () => {
    if (Array.isArray(formula1OrValues)) {
      range.dataValidation = { rule: { type: "list", values: formula1OrValues } };
    } else {
      range.dataValidation = { rule: { type: "list", formula1: formula1OrValues } };
    }
  });
}

function addCf(range, type, config) {
  safe("formatação condicional", () => {
    range.conditionalFormats.add(type, config);
  });
}

function freeze(sheet, rows = 5, cols = 0) {
  safe("congelar painéis", () => {
    if (rows) sheet.freezePanes.freezeRows(rows);
    if (cols) sheet.freezePanes.freezeColumns(cols);
  });
}

function writeTable(sheet, title, subtitle, headers, rows, tableName, options = {}) {
  initSheet(sheet, title, subtitle, headers.length);
  const note = options.note || "Células em azul são preenchidas manualmente. Células em cinza são calculadas automaticamente.";
  sheet.getRange(`A3:${colLetter(headers.length)}3`).values = [[note, ...Array(headers.length - 1).fill(null)]];
  safe(`merge nota ${title}`, () => sheet.getRange(`A3:${colLetter(headers.length)}3`).merge());
  setFormat(sheet.getRange(`A3:${colLetter(headers.length)}3`), {
    fill: palette.yellow,
    font: { color: palette.ink, italic: true },
    borders: { preset: "outside", style: "thin", color: palette.line },
    wrapText: true,
  });
  setHeight(sheet, 3, 30, headers.length);

  const headerRange = sheet.getRange(rangeA1(1, 5, headers.length, 5));
  headerRange.values = [headers];
  styleHeader(headerRange, options.headerFill || palette.purple);
  sheet.getRange(rangeA1(1, START_ROW, headers.length, END_ROW)).values = padRows(rows, headers.length);
  styleBody(sheet.getRange(rangeA1(1, START_ROW, headers.length, END_ROW)));
  addTable(sheet, rangeA1(1, 5, headers.length, END_ROW), tableName, options.tableStyle || "TableStyleMedium2");
  freeze(sheet, 5);
}

function addChart(sheet, type, sourceRange, title, topLeft, bottomRight, numberFormatCode = null, legend = true) {
  return safe(`gráfico ${title}`, () => {
    const chart = sheet.charts.add(type, sheet.getRange(sourceRange));
    chart.title = title;
    chart.hasLegend = legend;
    if (numberFormatCode) chart.yAxis = { numberFormatCode };
    chart.xAxis = { axisType: "textAxis" };
    chart.setPosition(topLeft, bottomRight);
    return chart;
  });
}

const wb = Workbook.create();
const sheetNames = [
  "Dashboard",
  "Configurações",
  "Planejamento de Viagens",
  "Custos Planejados - Pedro",
  "Custos Planejados - Camilly",
  "Histórico de Gastos",
  "Divisão e Acertos",
  "Simulador de Viagem",
  "Checklist de Viagem",
  "Roteiro e Agenda",
  "Economia e Metas",
  "Parcelamentos",
  "Comparativo de Viagens",
  "Base de Categorias",
  "Documentação",
  "Guia Rápido",
];
const sheets = Object.fromEntries(sheetNames.map((name) => [name, wb.worksheets.add(name)]));

const val = {
  pessoas: "'Base de Categorias'!$A$2:$A$4",
  categorias: "'Base de Categorias'!$B$2:$B$15",
  subcategorias: "'Base de Categorias'!$C$2:$C$160",
  formas: "'Base de Categorias'!$D$2:$D$20",
  statusViagem: "'Base de Categorias'!$E$2:$E$10",
  statusTarefa: "'Base de Categorias'!$F$2:$F$12",
  statusAcerto: "'Base de Categorias'!$G$2:$G$10",
  prioridades: "'Base de Categorias'!$H$2:$H$8",
  tiposCusto: "'Base de Categorias'!$I$2:$I$8",
  tiposHospedagem: "'Base de Categorias'!$J$2:$J$12",
  tiposTransporte: "'Base de Categorias'!$K$2:$K$12",
  politicas: "'Base de Categorias'!$L$2:$L$12",
  simNao: "'Base de Categorias'!$M$2:$M$3",
  statusPlanejamento: "'Base de Categorias'!$N$2:$N$10",
  cidades: "'Base de Categorias'!$O$2:$O$30",
  viagens: "'Planejamento de Viagens'!$A$6:$A$205",
};

// Base de Categorias
{
  const s = sheets["Base de Categorias"];
  initSheet(s, "Base de Categorias", "Listas técnicas que alimentam os menus suspensos e mantêm a planilha padronizada.", 16);
  const headers = [
    "Pessoas",
    "Categorias",
    "Subcategorias",
    "Formas de pagamento",
    "Status de viagem",
    "Status de tarefa",
    "Status de acerto",
    "Prioridades",
    "Tipos de custo",
    "Tipos de hospedagem",
    "Tipos de transporte",
    "Políticas de divisão",
    "Sim/Não",
    "Status do planejamento",
    "Cidades frequentes",
    "Categoria da subcategoria",
  ];
  s.getRange("A4:P4").values = [headers];
  styleHeader(s.getRange("A4:P4"), palette.navy);
  const max = Math.max(
    pessoas.length,
    categorias.length,
    flatSubcategorias.length,
    formasPagamento.length,
    statusViagem.length,
    statusTarefa.length,
    statusAcerto.length,
    prioridades.length,
    tiposCusto.length,
    tiposHospedagem.length,
    tiposTransporte.length,
    politicasDivisao.length,
    simNao.length,
    statusPlanejamento.length,
    cidades.length,
  );
  const subcatPairs = Object.entries(subcategoriasPorCategoria).flatMap(([cat, subs]) => subs.map((sub) => [sub, cat]));
  const data = Array.from({ length: max }, (_, i) => [
    pessoas[i] ?? null,
    categorias[i] ?? null,
    flatSubcategorias[i] ?? null,
    formasPagamento[i] ?? null,
    statusViagem[i] ?? null,
    statusTarefa[i] ?? null,
    statusAcerto[i] ?? null,
    prioridades[i] ?? null,
    tiposCusto[i] ?? null,
    tiposHospedagem[i] ?? null,
    tiposTransporte[i] ?? null,
    politicasDivisao[i] ?? null,
    simNao[i] ?? null,
    statusPlanejamento[i] ?? null,
    cidades[i] ?? null,
    subcatPairs[i]?.[1] ?? null,
  ]);
  s.getRange(rangeA1(1, 5, 16, 4 + max)).values = data;
  styleBody(s.getRange(rangeA1(1, 5, 16, 4 + max)));
  addTable(s, rangeA1(1, 4, 16, 4 + max), "TabelaBaseCategorias", "TableStyleMedium9");
  for (const [col, width] of Object.entries({
    A: 190, B: 170, C: 230, D: 160, E: 140, F: 140, G: 140, H: 100,
    I: 130, J: 150, K: 150, L: 190, M: 90, N: 150, O: 150, P: 190,
  })) setWidth(s, col, width);
  freeze(s, 4);
}

// Configurações
{
  const s = sheets["Configurações"];
  initSheet(s, "Configurações", "Ajuste nomes, orçamentos, políticas de divisão e listas usadas no restante do arquivo.", 10);
  const blocks = [
    ["Identidade do casal", "", "", "", "Referência rápida", ""],
    ["Nome da Pessoa 1", PEDRO, "", "", "Células em azul", "Preenchimento manual"],
    ["Nome da Pessoa 2", CAMILLY, "", "", "Células em cinza", "Cálculo automático"],
    ["Moeda padrão", "R$", "", "", "Senha sugerida para proteção", "1234"],
    ["", "", "", "", "", ""],
    ["Orçamentos e metas", "", "", "", "Política padrão", ""],
    ["Orçamento mensal de Pedro", 2200, "", "", "Política padrão de divisão", "50/50"],
    ["Orçamento mensal de Camilly", 1800, "", "", "Percentual padrão Pedro", 0.5],
    ["Orçamento mensal conjunto", 4000, "", "", "Percentual padrão Camilly", 0.5],
    ["Meta mensal conjunta", 900, "", "", "Reserva de emergência percentual", 0.12],
    ["", "", "", "", "", ""],
    ["Cidades frequentes", "Formas de pagamento", "Status de viagem", "Status de tarefa", "Prioridades", "Tipos de custo"],
  ];
  s.getRange("A4:F15").values = blocks;
  setFormat(s.getRange("A4:F15"), { fill: palette.white, borders: { preset: "all", style: "thin", color: palette.line }, wrapText: true });
  styleHeader(s.getRange("A4:F4"), palette.blueStrong);
  styleHeader(s.getRange("A9:F9"), palette.purple);
  styleHeader(s.getRange("A15:F15"), palette.greenStrong);
  styleInput(s.getRange("B5:B7"));
  styleInput(s.getRange("B10:B13"));
  styleInput(s.getRange("F10:F13"));
  setNumberFormat(s.getRange("B10:B12"), moneyFmt);
  setNumberFormat(s.getRange("F12:F13"), pctFmt);
  const listRows = Array.from({ length: 12 }, (_, i) => [
    cidades[i] ?? null,
    formasPagamento[i] ?? null,
    statusViagem[i] ?? null,
    statusTarefa[i] ?? null,
    prioridades[i] ?? null,
    tiposCusto[i] ?? null,
  ]);
  s.getRange("A16:F27").values = listRows;
  styleBody(s.getRange("A16:F27"));
  s.getRange("H4:J4").values = [["Como usar", "", ""]];
  safe("merge como usar", () => s.getRange("H4:J4").merge());
  styleHeader(s.getRange("H4:J4"), palette.navy);
  const help = [
    ["1", "Atualize os orçamentos mensais e a política padrão de divisão antes de cadastrar novas viagens."],
    ["2", "As listas da Base de Categorias alimentam os menus suspensos. Edite lá quando quiser adicionar novas opções."],
    ["3", "Valores de exemplo podem ser apagados com segurança depois que Pedro e Camilly começarem a usar a planilha."],
    ["4", "O Dashboard, a Divisão e Acertos e o Comparativo atualizam a partir das tabelas de planejamento e histórico."],
  ];
  s.getRange("H5:I8").values = help;
  safe("merge ajuda", () => ["I5:J5", "I6:J6", "I7:J7", "I8:J8"].forEach((r) => s.getRange(r).merge()));
  setFormat(s.getRange("H5:J8"), { fill: palette.lilac, borders: { preset: "all", style: "thin", color: palette.line }, wrapText: true });
  for (const [col, width] of Object.entries({ A: 210, B: 210, C: 150, D: 150, E: 210, F: 190, G: 24, H: 50, I: 280, J: 140 })) setWidth(s, col, width);
  freeze(s, 4);
}

// Planejamento de Viagens
const planejamentoHeaders = [
  "ID da viagem",
  "Nome da viagem",
  "Pessoa viajando",
  "Pessoa recebendo",
  "Sentido da viagem",
  "Cidade de origem",
  "Cidade de destino",
  "Data de ida",
  "Data de volta",
  "Dias juntos",
  "Status",
  "Objetivo da viagem",
  "Orçamento planejado",
  "Gasto realizado",
  "Diferença",
  "Percentual usado do orçamento",
  "Total pago por Pedro",
  "Total pago por Camilly",
  "Valor a compensar",
  "Quem deve para quem",
  "Prioridade",
  "Checklist completo?",
  "Link de passagens",
  "Link de hospedagem",
  "Link de roteiro",
  "Data limite para comprar passagem",
  "Data limite para reservar hospedagem",
  "Alerta automático",
  "Observações",
];
const planejamentoRows = [
  [
    "V001",
    "Camilly em João Pessoa",
    CAMILLY,
    PEDRO,
    "Camilly visita Pedro",
    "Cuiabá",
    "João Pessoa",
    excelDate(2026, 7, 12),
    excelDate(2026, 7, 18),
    null,
    "Planejada",
    "Semana juntos com roteiro leve e visita à família.",
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    "Alta",
    null,
    "https://exemplo.com/passagem-v001",
    "",
    "https://exemplo.com/roteiro-v001",
    excelDate(2026, 6, 20),
    excelDate(2026, 6, 25),
    null,
    "Dados fictícios para demonstração.",
  ],
  [
    "V002",
    "Pedro visitando Camilly",
    PEDRO,
    CAMILLY,
    "Pedro visita Camilly",
    "João Pessoa",
    "Cuiabá",
    excelDate(2026, 8, 22),
    excelDate(2026, 8, 27),
    null,
    "Planejada",
    "Visita com foco em descanso e restaurantes especiais.",
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    "Média",
    null,
    "",
    "https://exemplo.com/hospedagem-v002",
    "",
    excelDate(2026, 7, 14),
    excelDate(2026, 7, 22),
    null,
    "Substitua pelos dados reais quando quiser.",
  ],
  [
    "V003",
    "Fim de semana juntos",
    PEDRO,
    CAMILLY,
    "Encontro em cidade neutra",
    "João Pessoa",
    "Recife",
    excelDate(2026, 5, 16),
    excelDate(2026, 5, 18),
    null,
    "Concluída",
    "Fim de semana curto para matar a saudade.",
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    "Baixa",
    null,
    "https://exemplo.com/passagem-v003",
    "https://exemplo.com/hotel-v003",
    "https://exemplo.com/roteiro-v003",
    excelDate(2026, 4, 20),
    excelDate(2026, 4, 25),
    null,
    "Viagem concluída com gastos reais de exemplo.",
  ],
];
{
  const s = sheets["Planejamento de Viagens"];
  writeTable(s, "Planejamento de Viagens", "Cadastro central de cada visita, com orçamento, realizado, divisão de pagamentos e alertas.", planejamentoHeaders, planejamentoRows, "TabelaPlanejamentoViagens", { headerFill: palette.purple });
  s.getRange("J6:J205").formulas = formulaColumn((r) => `=IF(OR($H${r}="",$I${r}=""),"",MAX($I${r}-$H${r}+1,1))`);
  s.getRange("M6:M205").formulas = formulaColumn((r) => `=IF($A${r}="","",SUMIFS('Custos Planejados - Pedro'!$G$6:$G$205,'Custos Planejados - Pedro'!$A$6:$A$205,$A${r})+SUMIFS('Custos Planejados - Camilly'!$G$6:$G$205,'Custos Planejados - Camilly'!$A$6:$A$205,$A${r}))`);
  s.getRange("N6:N205").formulas = formulaColumn((r) => `=IF($A${r}="","",SUMIFS('Histórico de Gastos'!$J$6:$J$205,'Histórico de Gastos'!$B$6:$B$205,$A${r}))`);
  s.getRange("O6:O205").formulas = formulaColumn((r) => `=IF($A${r}="","",$M${r}-$N${r})`);
  s.getRange("P6:P205").formulas = formulaColumn((r) => `=IF($A${r}="","",IFERROR($N${r}/$M${r},0))`);
  s.getRange("Q6:Q205").formulas = formulaColumn((r) => `=IF($A${r}="","",SUMIFS('Histórico de Gastos'!$W$6:$W$205,'Histórico de Gastos'!$B$6:$B$205,$A${r}))`);
  s.getRange("R6:R205").formulas = formulaColumn((r) => `=IF($A${r}="","",SUMIFS('Histórico de Gastos'!$X$6:$X$205,'Histórico de Gastos'!$B$6:$B$205,$A${r}))`);
  s.getRange("S6:S205").formulas = formulaColumn((r) => `=IF($A${r}="","",ABS($Q${r}-SUMIFS('Histórico de Gastos'!$U$6:$U$205,'Histórico de Gastos'!$B$6:$B$205,$A${r})))`);
  s.getRange("T6:T205").formulas = formulaColumn((r) => `=IF($A${r}="","",IF(ABS($Q${r}-SUMIFS('Histórico de Gastos'!$U$6:$U$205,'Histórico de Gastos'!$B$6:$B$205,$A${r}))<0.01,"Tudo certo",IF($Q${r}>SUMIFS('Histórico de Gastos'!$U$6:$U$205,'Histórico de Gastos'!$B$6:$B$205,$A${r}),"Camilly deve para Pedro","Pedro deve para Camilly")))`);
  s.getRange("V6:V205").formulas = formulaColumn((r) => `=IF($A${r}="","",IF(COUNTIFS('Checklist de Viagem'!$A$6:$A$205,$A${r})=0,"Não",IF(COUNTIFS('Checklist de Viagem'!$A$6:$A$205,$A${r},'Checklist de Viagem'!$H$6:$H$205,"Não")=0,"Sim","Não")))`);
  s.getRange("AB6:AB205").formulas = formulaColumn((r) => `=IF($A${r}="","",IF($P${r}>1,"Viagem acima do orçamento",IF(AND($K${r}<>"Concluída",$V${r}<>"Sim",$H${r}-TODAY()<=15),"Viagem próxima sem checklist completo",IF($W${r}="","Passagem ainda não comprada",IF($X${r}="","Falta reservar hospedagem",IF($S${r}>0,"Existe valor pendente de compensação","Tudo certo"))))))`);
  addValidation(s.getRange("C6:D205"), val.pessoas);
  addValidation(s.getRange("F6:G205"), val.cidades);
  addValidation(s.getRange("K6:K205"), val.statusViagem);
  addValidation(s.getRange("U6:U205"), val.prioridades);
  setNumberFormat(s.getRange("H6:I205"), dateFmt);
  setNumberFormat(s.getRange("Z6:AA205"), dateFmt);
  setNumberFormat(s.getRange("J6:J205"), intFmt);
  setNumberFormat(s.getRange("M6:O205"), moneyFmt);
  setNumberFormat(s.getRange("Q6:S205"), moneyFmt);
  setNumberFormat(s.getRange("P6:P205"), pctFmt);
  for (const col of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "U", "W", "X", "Y", "Z", "AA", "AC"]) styleInput(s.getRange(`${col}6:${col}205`));
  for (const col of ["J", "M", "N", "O", "P", "Q", "R", "S", "T", "V", "AB"]) styleFormula(s.getRange(`${col}6:${col}205`));
  addCf(s.getRange("P6:P205"), "cellIs", { operator: "greaterThan", formula: 1, format: { fill: palette.red, font: { bold: true, color: "#991B1B" } } });
  addCf(s.getRange("V6:V205"), "containsText", { text: "Não", format: { fill: palette.yellow, font: { bold: true, color: "#92400E" } } });
  addCf(s.getRange("AB6:AB205"), "notContainsText", { text: "Tudo certo", format: { fill: palette.yellow, font: { bold: true, color: "#92400E" } } });
  const widths = { A: 90, B: 210, C: 185, D: 185, E: 180, F: 140, G: 140, H: 105, I: 105, J: 90, K: 120, L: 260, M: 130, N: 130, O: 120, P: 150, Q: 130, R: 130, S: 130, T: 190, U: 100, V: 130, W: 210, X: 210, Y: 210, Z: 130, AA: 140, AB: 230, AC: 240 };
  for (const [col, width] of Object.entries(widths)) setWidth(s, col, width);
}

function plannedRowsPedro() {
  return [
    ["V002", excelDate(2026, 7, 15), "Transporte principal", "Passagem aérea", "Fixo", "Passagem João Pessoa - Cuiabá", 1180, 950, 1350, 1, "Sim", PEDRO, PEDRO, "Cartão de crédito", "Sim", 3, null, "Orçado", "Exemplo parcelado em 3 vezes."],
    ["V002", excelDate(2026, 8, 22), "Transporte local", "Uber", "Variável", "Transporte até aeroporto", 85, 60, 110, 1, "Sim", PEDRO, PEDRO, "Pix", "Não", 1, null, "Orçado", ""],
    ["V002", excelDate(2026, 8, 22), "Hospedagem", "Airbnb", "Fixo", "Airbnb próximo ao centro", 860, 700, 980, 1, "Sim", PEDRO, "Ambos", "Cartão de crédito", "Sim", 2, null, "Reservado", ""],
    ["V002", excelDate(2026, 8, 23), "Alimentação", "Restaurante especial", "Opcional", "Jantar especial", 240, 180, 320, 0.8, "Não", PEDRO, "Ambos", "Cartão de crédito", "Não", 1, null, "Ideia", ""],
    ["V002", excelDate(2026, 8, 24), "Lazer e encontros", "Cinema", "Opcional", "Cinema e lanche", 120, 90, 160, 0.7, "Não", CAMILLY, "Ambos", "Pix", "Não", 1, null, "Ideia", ""],
    ["V002", excelDate(2026, 8, 26), "Presentes e relacionamento", "Mimos", "Opcional", "Mimo surpresa", 150, 80, 220, 0.6, "Não", PEDRO, CAMILLY, "Pix", "Não", 1, null, "Ideia", ""],
    ["V002", excelDate(2026, 8, 22), "Imprevistos", "Emergência", "Emergencial", "Reserva para imprevistos", 300, 200, 450, 1, "Sim", "Ambos", "Ambos", "Pix", "Não", 1, null, "Orçado", ""],
    ["V003", excelDate(2026, 5, 15), "Transporte principal", "Passagem de ônibus", "Fixo", "Ônibus João Pessoa - Recife", 180, 150, 220, 1, "Sim", PEDRO, PEDRO, "Cartão de crédito", "Não", 1, null, "Comprado", ""],
    ["V003", excelDate(2026, 5, 16), "Alimentação", "Café da manhã", "Variável", "Café do sábado", 70, 50, 90, 1, "Sim", PEDRO, "Ambos", "Pix", "Não", 1, null, "Comprado", ""],
    ["V003", excelDate(2026, 5, 17), "Lazer e encontros", "Passeios", "Opcional", "Passeio pelo centro antigo", 110, 80, 150, 0.9, "Não", PEDRO, "Ambos", "Pix", "Não", 1, null, "Comprado", ""],
  ];
}

function plannedRowsCamilly() {
  return [
    ["V001", excelDate(2026, 6, 18), "Transporte principal", "Passagem aérea", "Fixo", "Passagem Cuiabá - João Pessoa", 1320, 1100, 1500, 1, "Sim", CAMILLY, CAMILLY, "Cartão de crédito", "Sim", 3, null, "Reservado", ""],
    ["V001", excelDate(2026, 7, 12), "Transporte principal", "Bagagem despachada", "Opcional", "Mala para uma semana", 180, 150, 220, 0.7, "Não", CAMILLY, CAMILLY, "Cartão de crédito", "Não", 1, null, "Orçado", ""],
    ["V001", excelDate(2026, 7, 12), "Transporte local", "Uber", "Variável", "Aeroporto para casa", 95, 75, 130, 1, "Sim", PEDRO, "Ambos", "Pix", "Não", 1, null, "Orçado", ""],
    ["V001", excelDate(2026, 7, 13), "Alimentação", "Mercado", "Variável", "Mercado para dias em casa", 310, 240, 380, 1, "Sim", PEDRO, "Ambos", "Pix", "Não", 1, null, "Orçado", ""],
    ["V001", excelDate(2026, 7, 15), "Lazer e encontros", "Praia", "Opcional", "Dia na praia com almoço", 190, 120, 260, 0.8, "Não", "Ambos", "Ambos", "Pix", "Não", 1, null, "Ideia", ""],
    ["V001", excelDate(2026, 7, 16), "Saúde e segurança", "Farmácia", "Emergencial", "Reserva farmácia", 80, 40, 140, 0.5, "Não", CAMILLY, CAMILLY, "Pix", "Não", 1, null, "Ideia", ""],
    ["V001", excelDate(2026, 7, 17), "Presentes e relacionamento", "Flores", "Opcional", "Flores de boas-vindas", 90, 60, 130, 0.8, "Não", PEDRO, CAMILLY, "Pix", "Não", 1, null, "Ideia", ""],
    ["V003", excelDate(2026, 5, 16), "Hospedagem", "Hotel", "Fixo", "Hotel para duas diárias", 620, 520, 760, 1, "Sim", CAMILLY, "Ambos", "Cartão de crédito", "Sim", 2, null, "Comprado", ""],
    ["V003", excelDate(2026, 5, 17), "Alimentação", "Delivery", "Variável", "Delivery domingo à noite", 95, 70, 130, 1, "Sim", CAMILLY, "Ambos", "Pix", "Não", 1, null, "Comprado", ""],
    ["V003", excelDate(2026, 5, 18), "Imprevistos", "Transporte extra", "Emergencial", "Corrida extra para rodoviária", 65, 40, 90, 1, "Sim", CAMILLY, "Ambos", "Pix", "Não", 1, null, "Comprado", ""],
  ];
}

const plannedHeaders = [
  "ID da viagem",
  "Data prevista",
  "Categoria",
  "Subcategoria",
  "Tipo de custo",
  "Descrição",
  "Valor planejado",
  "Valor mínimo estimado",
  "Valor máximo estimado",
  "Probabilidade de acontecer",
  "Obrigatório?",
  "Pago por",
  "Beneficiário",
  "Forma de pagamento prevista",
  "Parcelado?",
  "Número de parcelas",
  "Valor por parcela",
  "Status do planejamento",
  "Observações",
];

function buildPlannedSheet(name, rows, fill) {
  const s = sheets[name];
  writeTable(s, name, "Planeje custos antes da viagem. As linhas de exemplo podem ser substituídas por gastos reais previstos.", plannedHeaders, rows, name.includes("Pedro") ? "TabelaCustosPlanejadosPedro" : "TabelaCustosPlanejadosCamilly", { headerFill: fill, tableStyle: "TableStyleMedium4" });
  s.getRange("Q6:Q205").formulas = formulaColumn((r) => `=IF($A${r}="","",IF($O${r}="Sim",IFERROR($G${r}/MAX($P${r},1),$G${r}),$G${r}))`);
  addValidation(s.getRange("A6:A205"), val.viagens);
  addValidation(s.getRange("C6:C205"), val.categorias);
  addValidation(s.getRange("D6:D205"), val.subcategorias);
  addValidation(s.getRange("E6:E205"), val.tiposCusto);
  addValidation(s.getRange("K6:K205"), val.simNao);
  addValidation(s.getRange("L6:M205"), val.pessoas);
  addValidation(s.getRange("N6:N205"), val.formas);
  addValidation(s.getRange("O6:O205"), val.simNao);
  addValidation(s.getRange("R6:R205"), val.statusPlanejamento);
  setNumberFormat(s.getRange("B6:B205"), dateFmt);
  setNumberFormat(s.getRange("G6:I205"), moneyFmt);
  setNumberFormat(s.getRange("J6:J205"), pctFmt);
  setNumberFormat(s.getRange("P6:Q205"), '0.00');
  setNumberFormat(s.getRange("Q6:Q205"), moneyFmt);
  for (const col of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "R", "S"]) styleInput(s.getRange(`${col}6:${col}205`));
  styleFormula(s.getRange("Q6:Q205"));
  addCf(s.getRange("G6:G205"), "cellIs", { operator: "greaterThan", formula: "=I6", format: { fill: palette.yellow, font: { bold: true, color: "#92400E" } } });
  addCf(s.getRange("R6:R205"), "containsText", { text: "Cancelado", format: { fill: palette.red, font: { bold: true, color: "#991B1B" } } });
  const widths = { A: 90, B: 110, C: 170, D: 210, E: 130, F: 260, G: 130, H: 140, I: 140, J: 145, K: 105, L: 175, M: 160, N: 170, O: 105, P: 120, Q: 125, R: 150, S: 240 };
  for (const [col, width] of Object.entries(widths)) setWidth(s, col, width);
}
buildPlannedSheet("Custos Planejados - Pedro", plannedRowsPedro(), palette.blueStrong);
buildPlannedSheet("Custos Planejados - Camilly", plannedRowsCamilly(), "#C067A0");

// Histórico de Gastos
const historicoHeaders = [
  "ID do gasto",
  "ID da viagem",
  "Data do gasto",
  "Pessoa que pagou",
  "Pessoa beneficiada",
  "Categoria",
  "Subcategoria",
  "Tipo de custo",
  "Descrição",
  "Valor",
  "Forma de pagamento",
  "Cartão/conta usada",
  "Parcelado?",
  "Número de parcelas",
  "Parcela atual",
  "Valor da parcela",
  "Reembolsável?",
  "Deve ser dividido?",
  "Percentual Pedro",
  "Percentual Camilly",
  "Responsabilidade Pedro",
  "Responsabilidade Camilly",
  "Valor pago por Pedro",
  "Valor pago por Camilly",
  "Diferença/compensação",
  "Comprovante/link",
  "Observações",
];
const historicoRows = [
  ["G001", "V003", excelDate(2026, 5, 15), PEDRO, PEDRO, "Transporte principal", "Passagem de ônibus", "Fixo", "Ônibus João Pessoa - Recife", 178, "Cartão de crédito", "Nubank Pedro", "Não", 1, 1, null, "Sim", "Não", 1, 0, null, null, null, null, null, "https://exemplo.com/g001", ""],
  ["G002", "V003", excelDate(2026, 5, 16), CAMILLY, "Ambos", "Hospedagem", "Hotel", "Fixo", "Hotel duas diárias", 640, "Cartão de crédito", "Inter Camilly", "Sim", 2, 1, null, "Sim", "Sim", 0.5, 0.5, null, null, null, null, null, "https://exemplo.com/g002", ""],
  ["G003", "V003", excelDate(2026, 5, 16), PEDRO, "Ambos", "Transporte local", "Uber", "Variável", "Uber rodoviária para hotel", 42, "Pix", "Conta Pedro", "Não", 1, 1, null, "Sim", "Sim", 0.5, 0.5, null, null, null, null, null, "", ""],
  ["G004", "V003", excelDate(2026, 5, 16), PEDRO, "Ambos", "Alimentação", "Café da manhã", "Variável", "Café do sábado", 68, "Pix", "Conta Pedro", "Não", 1, 1, null, "Sim", "Sim", 0.5, 0.5, null, null, null, null, null, "", ""],
  ["G005", "V003", excelDate(2026, 5, 17), CAMILLY, "Ambos", "Alimentação", "Delivery", "Variável", "Delivery domingo", 112, "Pix", "Conta Camilly", "Não", 1, 1, null, "Sim", "Sim", 0.5, 0.5, null, null, null, null, null, "", ""],
  ["G006", "V003", excelDate(2026, 5, 17), PEDRO, "Ambos", "Lazer e encontros", "Passeios", "Opcional", "Passeio e fotos", 124, "Pix", "Conta Pedro", "Não", 1, 1, null, "Sim", "Sim", 0.5, 0.5, null, null, null, null, null, "", ""],
  ["G007", "V003", excelDate(2026, 5, 18), CAMILLY, "Ambos", "Imprevistos", "Transporte extra", "Emergencial", "Corrida extra para rodoviária", 72, "Pix", "Conta Camilly", "Não", 1, 1, null, "Sim", "Sim", 0.5, 0.5, null, null, null, null, null, "", ""],
  ["G008", "V001", excelDate(2026, 6, 18), CAMILLY, CAMILLY, "Transporte principal", "Passagem aérea", "Fixo", "Primeira parcela da passagem", 440, "Cartão de crédito", "Cartão Camilly", "Sim", 3, 1, null, "Sim", "Não", 0, 1, null, null, null, null, null, "https://exemplo.com/g008", "Compra antecipada."],
  ["G009", "V001", excelDate(2026, 6, 19), PEDRO, "Ambos", "Presentes e relacionamento", "Flores", "Opcional", "Flores de boas-vindas", 88, "Pix", "Conta Pedro", "Não", 1, 1, null, "Não", "Não", 1, 0, null, null, null, null, null, "", ""],
  ["G010", "V002", excelDate(2026, 6, 25), PEDRO, PEDRO, "Transporte principal", "Passagem aérea", "Fixo", "Primeira parcela passagem Pedro", 393.33, "Cartão de crédito", "Nubank Pedro", "Sim", 3, 1, null, "Sim", "Não", 1, 0, null, null, null, null, null, "https://exemplo.com/g010", ""],
  ["G011", "V002", excelDate(2026, 6, 28), CAMILLY, "Ambos", "Hospedagem", "Airbnb", "Fixo", "Sinal do Airbnb", 430, "Cartão de crédito", "Inter Camilly", "Sim", 2, 1, null, "Sim", "Sim", 0.5, 0.5, null, null, null, null, null, "", ""],
  ["G012", "V003", excelDate(2026, 5, 17), PEDRO, CAMILLY, "Presentes e relacionamento", "Chocolates", "Opcional", "Chocolate surpresa", 55, "Pix", "Conta Pedro", "Não", 1, 1, null, "Não", "Não", 1, 0, null, null, null, null, null, "", ""],
];
{
  const s = sheets["Histórico de Gastos"];
  writeTable(s, "Histórico de Gastos", "Registre aqui os gastos reais. Esta aba alimenta o Dashboard, acertos e comparativos.", historicoHeaders, historicoRows, "TabelaHistoricoGastos", { headerFill: palette.greenStrong, tableStyle: "TableStyleMedium14" });
  s.getRange("P6:P205").formulas = formulaColumn((r) => `=IF($A${r}="","",IF($M${r}="Sim",IFERROR($J${r}/MAX($N${r},1),$J${r}),$J${r}))`);
  s.getRange("U6:U205").formulas = formulaColumn((r) => `=IF($A${r}="","",$J${r}*$S${r})`);
  s.getRange("V6:V205").formulas = formulaColumn((r) => `=IF($A${r}="","",$J${r}*$T${r})`);
  s.getRange("W6:W205").formulas = formulaColumn((r) => `=IF($A${r}="","",IF($D${r}="${PEDRO}",$J${r},0))`);
  s.getRange("X6:X205").formulas = formulaColumn((r) => `=IF($A${r}="","",IF($D${r}="${CAMILLY}",$J${r},0))`);
  s.getRange("Y6:Y205").formulas = formulaColumn((r) => `=IF($A${r}="","",$W${r}-$U${r})`);
  addValidation(s.getRange("B6:B205"), val.viagens);
  addValidation(s.getRange("D6:E205"), val.pessoas);
  addValidation(s.getRange("F6:F205"), val.categorias);
  addValidation(s.getRange("G6:G205"), val.subcategorias);
  addValidation(s.getRange("H6:H205"), val.tiposCusto);
  addValidation(s.getRange("K6:K205"), val.formas);
  addValidation(s.getRange("M6:M205"), val.simNao);
  addValidation(s.getRange("Q6:R205"), val.simNao);
  setNumberFormat(s.getRange("C6:C205"), dateFmt);
  setNumberFormat(s.getRange("J6:J205"), moneyFmt);
  setNumberFormat(s.getRange("P6:P205"), moneyFmt);
  setNumberFormat(s.getRange("S6:T205"), pctFmt);
  setNumberFormat(s.getRange("U6:Y205"), moneyFmt);
  for (const col of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "Q", "R", "S", "T", "Z", "AA"]) styleInput(s.getRange(`${col}6:${col}205`));
  for (const col of ["P", "U", "V", "W", "X", "Y"]) styleFormula(s.getRange(`${col}6:${col}205`));
  addCf(s.getRange("Y6:Y205"), "cellIs", { operator: "greaterThan", formula: 0, format: { fill: palette.green, font: { bold: true, color: "#166534" } } });
  addCf(s.getRange("Y6:Y205"), "cellIs", { operator: "lessThan", formula: 0, format: { fill: palette.red, font: { bold: true, color: "#991B1B" } } });
  const widths = { A: 90, B: 90, C: 105, D: 185, E: 165, F: 170, G: 210, H: 120, I: 260, J: 110, K: 150, L: 160, M: 100, N: 115, O: 100, P: 120, Q: 120, R: 120, S: 120, T: 120, U: 135, V: 135, W: 130, X: 130, Y: 145, Z: 210, AA: 240 };
  for (const [col, width] of Object.entries(widths)) setWidth(s, col, width);
}

// Divisão e Acertos
const acertosHeaders = [
  "ID da viagem",
  "Nome da viagem",
  "Total pago por Pedro",
  "Total pago por Camilly",
  "Responsabilidade Pedro",
  "Responsabilidade Camilly",
  "Diferença Pedro",
  "Diferença Camilly",
  "Resultado automático",
  "Valor sugerido de acerto",
  "Pessoa que deve pagar",
  "Pessoa que deve receber",
  "Status do acerto",
  "Data do acerto",
  "Forma do acerto",
  "Observações",
];
const acertosRows = [["V001"], ["V002"], ["V003"]];
{
  const s = sheets["Divisão e Acertos"];
  writeTable(s, "Divisão e Acertos", "Mostra automaticamente quem deve transferir para quem em cada viagem.", acertosHeaders, acertosRows, "TabelaDivisaoAcertos", { headerFill: palette.navy, tableStyle: "TableStyleMedium9" });
  s.getRange("B6:B205").formulas = formulaColumn((r) => `=IF($A${r}="","",IFERROR(INDEX('Planejamento de Viagens'!$B$6:$B$205,MATCH($A${r},'Planejamento de Viagens'!$A$6:$A$205,0)),""))`);
  s.getRange("C6:C205").formulas = formulaColumn((r) => `=IF($A${r}="","",SUMIFS('Histórico de Gastos'!$W$6:$W$205,'Histórico de Gastos'!$B$6:$B$205,$A${r}))`);
  s.getRange("D6:D205").formulas = formulaColumn((r) => `=IF($A${r}="","",SUMIFS('Histórico de Gastos'!$X$6:$X$205,'Histórico de Gastos'!$B$6:$B$205,$A${r}))`);
  s.getRange("E6:E205").formulas = formulaColumn((r) => `=IF($A${r}="","",SUMIFS('Histórico de Gastos'!$U$6:$U$205,'Histórico de Gastos'!$B$6:$B$205,$A${r}))`);
  s.getRange("F6:F205").formulas = formulaColumn((r) => `=IF($A${r}="","",SUMIFS('Histórico de Gastos'!$V$6:$V$205,'Histórico de Gastos'!$B$6:$B$205,$A${r}))`);
  s.getRange("G6:G205").formulas = formulaColumn((r) => `=IF($A${r}="","",$C${r}-$E${r})`);
  s.getRange("H6:H205").formulas = formulaColumn((r) => `=IF($A${r}="","",$D${r}-$F${r})`);
  s.getRange("I6:I205").formulas = formulaColumn((r) => `=IF($A${r}="","",IF(ABS($G${r})<0.01,"Tudo certo, ninguém deve nada",IF($G${r}>0,"Camilly deve pagar para Pedro","Pedro deve pagar para Camilly")))`);
  s.getRange("J6:J205").formulas = formulaColumn((r) => `=IF($A${r}="","",ABS($G${r}))`);
  s.getRange("K6:K205").formulas = formulaColumn((r) => `=IF($A${r}="","",IF(ABS($G${r})<0.01,"-",IF($G${r}>0,"${CAMILLY}","${PEDRO}")))`);
  s.getRange("L6:L205").formulas = formulaColumn((r) => `=IF($A${r}="","",IF(ABS($G${r})<0.01,"-",IF($G${r}>0,"${PEDRO}","${CAMILLY}")))`);
  addValidation(s.getRange("A6:A205"), val.viagens);
  addValidation(s.getRange("M6:M205"), val.statusAcerto);
  addValidation(s.getRange("O6:O205"), val.formas);
  setNumberFormat(s.getRange("C6:H205"), moneyFmt);
  setNumberFormat(s.getRange("J6:J205"), moneyFmt);
  setNumberFormat(s.getRange("N6:N205"), dateFmt);
  for (const col of ["A", "M", "N", "O", "P"]) styleInput(s.getRange(`${col}6:${col}205`));
  for (const col of ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]) styleFormula(s.getRange(`${col}6:${col}205`));
  addCf(s.getRange("I6:I205"), "containsText", { text: "deve pagar", format: { fill: palette.yellow, font: { bold: true, color: "#92400E" } } });
  addCf(s.getRange("M6:M205"), "containsText", { text: "Concluído", format: { fill: palette.green, font: { bold: true, color: "#166534" } } });
  const widths = { A: 95, B: 210, C: 140, D: 140, E: 150, F: 150, G: 125, H: 125, I: 280, J: 145, K: 180, L: 180, M: 130, N: 110, O: 150, P: 240 };
  for (const [col, width] of Object.entries(widths)) setWidth(s, col, width);
}

// Simulador
{
  const s = sheets["Simulador de Viagem"];
  initSheet(s, "Simulador de Viagem", "Preencha os campos em azul para estimar o custo total, divisão e necessidade de economia mensal.", 14);
  const inputs = [
    ["Campo", "Valor"],
    ["Pessoa viajando", PEDRO],
    ["Cidade de origem", "João Pessoa"],
    ["Cidade de destino", "Cuiabá"],
    ["Data de ida", excelDate(2026, 10, 10)],
    ["Data de volta", excelDate(2026, 10, 15)],
    ["Quantidade de dias", 6],
    ["Tipo de hospedagem", "Airbnb"],
    ["Valor estimado da passagem", 1250],
    ["Valor estimado de hospedagem por noite", 220],
    ["Valor médio de alimentação por dia", 95],
    ["Valor médio de transporte local por dia", 45],
    ["Valor médio de lazer por dia", 70],
    ["Valor de presentes/mimos", 180],
    ["Valor de beleza/autocuidado", 120],
    ["Valor de mercado/casa", 260],
    ["Valor para emergências", 300],
    ["Margem de segurança %", 0.12],
    ["Divisão Pedro %", 0.5],
    ["Divisão Camilly %", 0.5],
    ["Meses até a viagem", 4],
    ["Economia atual disponível", 900],
  ];
  s.getRange("A5:B26").values = inputs;
  styleHeader(s.getRange("A5:B5"), palette.blueStrong);
  styleInput(s.getRange("B6:B26"));
  setFormat(s.getRange("A6:A26"), { fill: palette.surface, font: { bold: true, color: palette.ink }, borders: { preset: "all", style: "thin", color: palette.line }, wrapText: true });
  addValidation(s.getRange("B6:B6"), val.pessoas);
  addValidation(s.getRange("B7:B8"), val.cidades);
  setNumberFormat(s.getRange("B9:B10"), dateFmt);
  addValidation(s.getRange("B12:B12"), val.tiposHospedagem);
  setNumberFormat(s.getRange("B11:B11"), intFmt);
  setNumberFormat(s.getRange("B13:B21"), moneyFmt);
  setNumberFormat(s.getRange("B22:B24"), pctFmt);
  setNumberFormat(s.getRange("B25:B25"), intFmt);
  setNumberFormat(s.getRange("B26:B26"), moneyFmt);
  const outputs = [
    ["Resultado", "Valor"],
    ["Custo total estimado", "=SUM(B14,B15*MAX(B12-1,0),B16*B12,B17*B12,B18*B12,B19,B20,B21,B22)*(1+B23)"],
    ["Custo por dia", "=IFERROR(E6/B12,0)"],
    ["Custo da passagem", "=B14"],
    ["Custo total de hospedagem", "=B15*MAX(B12-1,0)"],
    ["Custo total de alimentação", "=B16*B12"],
    ["Custo total de transporte local", "=B17*B12"],
    ["Custo total de lazer", "=B18*B12"],
    ["Custo total de imprevistos", "=B22+(SUM(B14,B15*MAX(B12-1,0),B16*B12,B17*B12,B18*B12,B19,B20,B21,B22)*B23)"],
    ["Custo para Pedro", "=E6*B24"],
    ["Custo para Camilly", "=E6*B25"],
    ["Valor recomendado para economizar por mês", "=IFERROR(MAX(E6-B26,0)/MAX(B26*0+B25*0+B24*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B22*0+B26*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B25*0+B24*0+B23*0+B22*0+B21*0+B20*0+B19*0+B18*0+B17*0+B16*0+B15*0+B14*0+B13*0+B12*0+B11*0+B10*0+B9*0+B8*0+B7*0+B6*0+B26),0)"],
    ["Comparação com orçamento mensal", "=IFERROR(E17/'Configurações'!$B$13,0)"],
    ["Viabilidade financeira", "=IF(E17=0,\"Viável\",IF(E18<=0.25,\"Viável\",IF(E18<=0.4,\"Atenção\",\"Risco alto\")))"],
    ["Alerta de risco financeiro", "=IF(E19=\"Risco alto\",\"Reduza passagem, hospedagem ou lazer antes de confirmar.\",IF(E19=\"Atenção\",\"Cabe no orçamento, mas exige disciplina.\",\"Plano confortável para a meta atual.\"))"],
    ["Sugestão de redução de custo", "=IF(E19=\"Risco alto\",\"Priorize hospedagem mais barata e passagem com antecedência.\",\"Manter margem de segurança e revisar preços semanalmente.\")"],
    ["Valor mínimo recomendado com emergência", "=SUM(B14,B15*MAX(B12-1,0),B16*B12,B17*B12,B18*B12,B19,B20,B21,B22)"],
    ["Valor ideal recomendado", "=E6"],
  ];
  s.getRange("D5:E22").values = outputs.map((row) => [row[0], null]);
  s.getRange("E6:E22").formulas = outputs.slice(1).map((row) => [row[1]]);
  styleHeader(s.getRange("D5:E5"), palette.greenStrong);
  styleFormula(s.getRange("E6:E22"));
  setFormat(s.getRange("D6:D22"), { fill: palette.surface, font: { bold: true, color: palette.ink }, borders: { preset: "all", style: "thin", color: palette.line }, wrapText: true });
  setNumberFormat(s.getRange("E6:E16"), moneyFmt);
  setNumberFormat(s.getRange("E17:E17"), pctFmt);
  setNumberFormat(s.getRange("E21:E22"), moneyFmt);
  const chartData = [
    ["Componente", "Valor"],
    ["Passagem", "=E8"],
    ["Hospedagem", "=E9"],
    ["Alimentação", "=E10"],
    ["Transporte local", "=E11"],
    ["Lazer", "=E12"],
    ["Imprevistos", "=E13"],
  ];
  s.getRange("H5:I11").values = chartData.map((r) => [r[0], null]);
  s.getRange("I6:I11").formulas = chartData.slice(1).map((r) => [r[1]]);
  styleHeader(s.getRange("H5:I5"), palette.navy);
  styleBody(s.getRange("H6:I11"));
  setNumberFormat(s.getRange("I6:I11"), moneyFmt);
  addChart(s, "doughnut", "H5:I11", "Composição do custo simulado", "H13", "N31", 'R$ #,##0', true);
  const widths = { A: 250, B: 170, C: 28, D: 280, E: 170, F: 28, G: 28, H: 170, I: 140, J: 90, K: 90, L: 90, M: 90, N: 90 };
  for (const [col, width] of Object.entries(widths)) setWidth(s, col, width);
  freeze(s, 5);
}

// Compact final formulas for the simulator, aligned to the manual input rows.
sheets["Simulador de Viagem"].getRange("E6:E22").formulas = [
  ["=SUM(B13,B14*MAX(B11-1,0),B15*B11,B16*B11,B17*B11,B18,B19,B20,B21)*(1+B22)"],
  ["=IFERROR(E6/B11,0)"],
  ["=B13"],
  ["=B14*MAX(B11-1,0)"],
  ["=B15*B11"],
  ["=B16*B11"],
  ["=B17*B11"],
  ["=B21+(SUM(B13,B14*MAX(B11-1,0),B15*B11,B16*B11,B17*B11,B18,B19,B20,B21)*B22)"],
  ["=E6*B23"],
  ["=E6*B24"],
  ["=IFERROR(MAX(E6-B26,0)/MAX(B25,1),0)"],
  ["=IFERROR(E16/'Configurações'!$B$12,0)"],
  ["=IF(E17=0,\"Viável\",IF(E17<=0.25,\"Viável\",IF(E17<=0.4,\"Atenção\",\"Risco alto\")))"],
  ["=IF(E18=\"Risco alto\",\"Reduza passagem, hospedagem ou lazer antes de confirmar.\",IF(E18=\"Atenção\",\"Cabe no orçamento, mas exige disciplina.\",\"Plano confortável para a meta atual.\"))"],
  ["=IF(E18=\"Risco alto\",\"Priorize hospedagem mais barata e passagem com antecedência.\",\"Manter margem de segurança e revisar preços semanalmente.\")"],
  ["=SUM(B13,B14*MAX(B11-1,0),B15*B11,B16*B11,B17*B11,B18,B19,B20,B21)"],
  ["=E6"],
];

// Checklist
const checklistHeaders = ["ID da viagem", "Item", "Categoria", "Responsável", "Prazo", "Status", "Prioridade", "Concluído?", "Observações"];
const checklistRows = [
  ["V001", "Confirmar datas", "Planejamento", CAMILLY, excelDate(2026, 6, 10), "Concluído", "Alta", "Sim", ""],
  ["V001", "Comprar passagem", "Transporte", CAMILLY, excelDate(2026, 6, 20), "Em andamento", "Alta", "Não", ""],
  ["V001", "Reservar hospedagem", "Hospedagem", PEDRO, excelDate(2026, 6, 25), "Pendente", "Alta", "Não", ""],
  ["V001", "Planejar roteiro", "Roteiro", "Ambos", excelDate(2026, 7, 3), "Pendente", "Média", "Não", ""],
  ["V001", "Separar remédios", "Saúde", CAMILLY, excelDate(2026, 7, 8), "Pendente", "Média", "Não", ""],
  ["V002", "Confirmar datas", "Planejamento", PEDRO, excelDate(2026, 7, 1), "Concluído", "Alta", "Sim", ""],
  ["V002", "Comprar passagem", "Transporte", PEDRO, excelDate(2026, 7, 14), "Pendente", "Alta", "Não", ""],
  ["V002", "Fazer check-in", "Transporte", PEDRO, excelDate(2026, 8, 20), "Pendente", "Alta", "Não", ""],
  ["V002", "Reservar restaurantes", "Lazer", CAMILLY, excelDate(2026, 8, 10), "Pendente", "Média", "Não", ""],
  ["V002", "Revisar orçamento final", "Finanças", "Ambos", excelDate(2026, 8, 15), "Pendente", "Alta", "Não", ""],
  ["V003", "Comprar passagem", "Transporte", PEDRO, excelDate(2026, 4, 20), "Concluído", "Alta", "Sim", ""],
  ["V003", "Reservar hospedagem", "Hospedagem", CAMILLY, excelDate(2026, 4, 25), "Concluído", "Alta", "Sim", ""],
  ["V003", "Salvar comprovantes", "Finanças", "Ambos", excelDate(2026, 5, 18), "Concluído", "Média", "Sim", ""],
];
{
  const s = sheets["Checklist de Viagem"];
  writeTable(s, "Checklist de Viagem", "Acompanhe tarefas críticas para cada visita, com prazos e prioridade.", checklistHeaders, checklistRows, "TabelaChecklistViagem", { headerFill: palette.blueStrong, tableStyle: "TableStyleMedium2" });
  addValidation(s.getRange("A6:A205"), val.viagens);
  addValidation(s.getRange("D6:D205"), val.pessoas);
  addValidation(s.getRange("F6:F205"), val.statusTarefa);
  addValidation(s.getRange("G6:G205"), val.prioridades);
  addValidation(s.getRange("H6:H205"), val.simNao);
  setNumberFormat(s.getRange("E6:E205"), dateFmt);
  addCf(s.getRange("E6:E205"), "timePeriod", { timePeriod: "today", format: { fill: palette.yellow, font: { bold: true, color: "#92400E" } } });
  addCf(s.getRange("E6:E205"), "cellIs", { operator: "lessThan", formula: "=TODAY()", format: { fill: palette.red, font: { bold: true, color: "#991B1B" } } });
  addCf(s.getRange("H6:H205"), "containsText", { text: "Sim", format: { fill: palette.green, font: { bold: true, color: "#166534" } } });
  addCf(s.getRange("G6:G205"), "containsText", { text: "Alta", format: { fill: palette.yellow, font: { bold: true, color: "#92400E" } } });
  const widths = { A: 90, B: 240, C: 130, D: 180, E: 110, F: 130, G: 110, H: 110, I: 240 };
  for (const [col, width] of Object.entries(widths)) setWidth(s, col, width);
}

// Roteiro e Agenda
const roteiroHeaders = ["ID da viagem", "Data", "Horário", "Atividade", "Local", "Categoria", "Custo estimado", "Custo real", "Responsável", "Reserva necessária?", "Link da reserva", "Status", "Observações"];
const roteiroRows = [
  ["V001", excelDate(2026, 7, 12), "18:30", "Chegada e jantar em casa", "João Pessoa", "Alimentação", 120, 0, "Ambos", "Não", "", "Planejado", ""],
  ["V001", excelDate(2026, 7, 13), "10:00", "Praia e almoço", "Cabo Branco", "Lazer e encontros", 190, 0, PEDRO, "Não", "", "Planejado", ""],
  ["V001", excelDate(2026, 7, 15), "20:00", "Restaurante especial", "João Pessoa", "Alimentação", 240, 0, "Ambos", "Sim", "https://exemplo.com/reserva", "Planejado", ""],
  ["V002", excelDate(2026, 8, 23), "19:30", "Jantar especial", "Cuiabá", "Alimentação", 240, 0, CAMILLY, "Sim", "", "Ideia", ""],
  ["V002", excelDate(2026, 8, 24), "16:00", "Cinema", "Shopping", "Lazer e encontros", 120, 0, "Ambos", "Não", "", "Ideia", ""],
  ["V003", excelDate(2026, 5, 16), "14:00", "Check-in hotel", "Recife", "Hospedagem", 0, 0, CAMILLY, "Sim", "https://exemplo.com/hotel", "Concluído", ""],
  ["V003", excelDate(2026, 5, 17), "15:00", "Passeio pelo centro antigo", "Recife", "Lazer e encontros", 110, 124, PEDRO, "Não", "", "Concluído", ""],
];
{
  const s = sheets["Roteiro e Agenda"];
  writeTable(s, "Roteiro e Agenda", "Organize atividades por dia e acompanhe custos estimados e reais do roteiro.", roteiroHeaders, roteiroRows, "TabelaRoteiroAgenda", { headerFill: "#7C6A46", tableStyle: "TableStyleMedium7" });
  addValidation(s.getRange("A6:A205"), val.viagens);
  addValidation(s.getRange("F6:F205"), val.categorias);
  addValidation(s.getRange("I6:I205"), val.pessoas);
  addValidation(s.getRange("J6:J205"), val.simNao);
  addValidation(s.getRange("L6:L205"), [...statusPlanejamento, "Planejado", "Concluído"]);
  setNumberFormat(s.getRange("B6:B205"), dateFmt);
  setNumberFormat(s.getRange("G6:H205"), moneyFmt);
  s.getRange("O5:P10").values = [
    ["Resumo do roteiro", "Valor"],
    ["Total estimado", null],
    ["Total real", null],
    ["Custo por dia", null],
    ["Dia mais caro", null],
    ["Atividades pagas", null],
  ];
  s.getRange("P6:P10").formulas = [
    ["=SUM(G6:G205)"],
    ["=SUM(H6:H205)"],
    ["=IFERROR(P7/MAX(COUNT(B6:B205),1),0)"],
    ["=IFERROR(INDEX(B6:B205,MATCH(MAX(H6:H205),H6:H205,0)),\"\")"],
    ["=COUNTIF(G6:G205,\">0\")"],
  ];
  styleHeader(s.getRange("O5:P5"), palette.navy);
  styleFormula(s.getRange("P6:P10"));
  setNumberFormat(s.getRange("P6:P8"), moneyFmt);
  const widths = { A: 90, B: 105, C: 80, D: 240, E: 150, F: 160, G: 120, H: 120, I: 180, J: 140, K: 210, L: 120, M: 240, N: 24, O: 170, P: 130 };
  for (const [col, width] of Object.entries(widths)) setWidth(s, col, width);
}

// Economia e Metas
const economiaHeaders = ["Mês", "Pessoa", "Viagem relacionada", "Meta de economia", "Valor economizado", "Diferença", "Percentual atingido", "Economia acumulada", "Observações"];
const economiaRows = [
  ["jan/2026", PEDRO, "V003", 450, 500, null, null, null, ""],
  ["jan/2026", CAMILLY, "V003", 350, 320, null, null, null, ""],
  ["fev/2026", PEDRO, "V003", 450, 460, null, null, null, ""],
  ["fev/2026", CAMILLY, "V003", 350, 390, null, null, null, ""],
  ["mar/2026", PEDRO, "V003", 450, 430, null, null, null, ""],
  ["mar/2026", CAMILLY, "V003", 350, 360, null, null, null, ""],
  ["abr/2026", PEDRO, "V001", 500, 520, null, null, null, ""],
  ["abr/2026", CAMILLY, "V001", 420, 400, null, null, null, ""],
  ["mai/2026", PEDRO, "V001", 500, 580, null, null, null, ""],
  ["mai/2026", CAMILLY, "V001", 420, 450, null, null, null, ""],
  ["jun/2026", PEDRO, "V002", 550, 620, null, null, null, ""],
  ["jun/2026", CAMILLY, "V002", 450, 440, null, null, null, ""],
];
{
  const s = sheets["Economia e Metas"];
  writeTable(s, "Economia e Metas", "Controle a economia mensal de Pedro e Camilly para próximas visitas.", economiaHeaders, economiaRows, "TabelaEconomiaMetas", { headerFill: palette.greenStrong, tableStyle: "TableStyleMedium4" });
  s.getRange("F6:F205").formulas = formulaColumn((r) => `=IF($A${r}="","",$E${r}-$D${r})`);
  s.getRange("G6:G205").formulas = formulaColumn((r) => `=IF($A${r}="","",IFERROR($E${r}/$D${r},0))`);
  s.getRange("H6:H205").formulas = formulaColumn((r) => `=IF($A${r}="","",SUMIFS($E$6:$E${r},$B$6:$B${r},$B${r}))`);
  addValidation(s.getRange("B6:B205"), val.pessoas);
  addValidation(s.getRange("C6:C205"), val.viagens);
  setNumberFormat(s.getRange("D6:F205"), moneyFmt);
  setNumberFormat(s.getRange("G6:G205"), pctFmt);
  setNumberFormat(s.getRange("H6:H205"), moneyFmt);
  for (const col of ["A", "B", "C", "D", "E", "I"]) styleInput(s.getRange(`${col}6:${col}205`));
  for (const col of ["F", "G", "H"]) styleFormula(s.getRange(`${col}6:${col}205`));
  addCf(s.getRange("G6:G205"), "dataBar", { color: palette.greenStrong });
  addCf(s.getRange("F6:F205"), "cellIs", { operator: "lessThan", formula: 0, format: { fill: palette.red, font: { bold: true, color: "#991B1B" } } });
  s.getRange("K5:N11").values = [
    ["Mês", "Meta", "Economizado", "Acumulado"],
    ...meses.slice(0, 6).map((m) => [m, null, null, null]),
  ];
  s.getRange("L6:N11").formulas = meses.slice(0, 6).map((m) => [
    `=SUMIFS($D$6:$D$205,$A$6:$A$205,$K${6 + meses.indexOf(m)})`,
    `=SUMIFS($E$6:$E$205,$A$6:$A$205,$K${6 + meses.indexOf(m)})`,
    `=SUM($M$6:$M${6 + meses.indexOf(m)})`,
  ]);
  styleHeader(s.getRange("K5:N5"), palette.navy);
  styleBody(s.getRange("K6:N11"));
  setNumberFormat(s.getRange("L6:N11"), moneyFmt);
  addChart(s, "line", "K5:N11", "Economia mensal acumulada", "K13", "Q30", 'R$ #,##0', true);
  const widths = { A: 100, B: 185, C: 115, D: 130, E: 135, F: 115, G: 135, H: 140, I: 240, J: 24, K: 100, L: 120, M: 130, N: 130, O: 80, P: 80, Q: 80 };
  for (const [col, width] of Object.entries(widths)) setWidth(s, col, width);
}

// Parcelamentos
const parcelasHeaders = ["ID da viagem", "Gasto relacionado", "Pessoa responsável", "Valor total", "Número de parcelas", "Valor da parcela", "Parcela atual", "Data de vencimento", "Status", "Forma de pagamento", "Impacto mensal", "Observações"];
const parcelasRows = [
  ["V001", "Passagem aérea Camilly", CAMILLY, 1320, 3, null, 1, excelDate(2026, 6, 20), "Pendente", "Cartão de crédito", null, ""],
  ["V001", "Passagem aérea Camilly", CAMILLY, 1320, 3, null, 2, excelDate(2026, 7, 20), "Pendente", "Cartão de crédito", null, ""],
  ["V001", "Passagem aérea Camilly", CAMILLY, 1320, 3, null, 3, excelDate(2026, 8, 20), "Pendente", "Cartão de crédito", null, ""],
  ["V002", "Airbnb Pedro visitando Camilly", CAMILLY, 860, 2, null, 1, excelDate(2026, 7, 10), "Pendente", "Cartão de crédito", null, ""],
  ["V002", "Airbnb Pedro visitando Camilly", CAMILLY, 860, 2, null, 2, excelDate(2026, 8, 10), "Pendente", "Cartão de crédito", null, ""],
  ["V003", "Hotel Recife", CAMILLY, 640, 2, null, 2, excelDate(2026, 6, 10), "Concluído", "Cartão de crédito", null, ""],
];
{
  const s = sheets["Parcelamentos"];
  writeTable(s, "Parcelamentos", "Controle parcelas, vencimentos e impacto mensal de compras feitas para as viagens.", parcelasHeaders, parcelasRows, "TabelaParcelamentos", { headerFill: "#8A6FAE", tableStyle: "TableStyleMedium5" });
  s.getRange("F6:F205").formulas = formulaColumn((r) => `=IF($A${r}="","",IFERROR($D${r}/MAX($E${r},1),$D${r}))`);
  s.getRange("K6:K205").formulas = formulaColumn((r) => `=IF($A${r}="","",$F${r})`);
  addValidation(s.getRange("A6:A205"), val.viagens);
  addValidation(s.getRange("C6:C205"), val.pessoas);
  addValidation(s.getRange("I6:I205"), ["Pendente", "Pago", "Concluído", "Atrasado"]);
  addValidation(s.getRange("J6:J205"), val.formas);
  setNumberFormat(s.getRange("D6:D205"), moneyFmt);
  setNumberFormat(s.getRange("F6:F205"), moneyFmt);
  setNumberFormat(s.getRange("H6:H205"), dateFmt);
  setNumberFormat(s.getRange("K6:K205"), moneyFmt);
  for (const col of ["A", "B", "C", "D", "E", "G", "H", "I", "J", "L"]) styleInput(s.getRange(`${col}6:${col}205`));
  for (const col of ["F", "K"]) styleFormula(s.getRange(`${col}6:${col}205`));
  addCf(s.getRange("H6:H205"), "cellIs", { operator: "lessThan", formula: "=TODAY()", format: { fill: palette.red, font: { bold: true, color: "#991B1B" } } });
  addCf(s.getRange("H6:H205"), "timePeriod", { timePeriod: "nextWeek", format: { fill: palette.yellow, font: { bold: true, color: "#92400E" } } });
  addCf(s.getRange("I6:I205"), "containsText", { text: "Concluído", format: { fill: palette.green, font: { bold: true, color: "#166534" } } });
  addCf(s.getRange("K6:K205"), "cellIs", { operator: "greaterThan", formula: 700, format: { fill: palette.yellow, font: { bold: true, color: "#92400E" } } });
  const widths = { A: 95, B: 250, C: 185, D: 120, E: 125, F: 120, G: 110, H: 130, I: 120, J: 155, K: 125, L: 240 };
  for (const [col, width] of Object.entries(widths)) setWidth(s, col, width);
}

// Comparativo de Viagens
{
  const s = sheets["Comparativo de Viagens"];
  initSheet(s, "Comparativo de Viagens", "Análise comparativa de custo, duração, status e eficiência de planejamento por viagem.", 14);
  const headers = ["ID", "Viagem", "Quem viajou", "Origem", "Destino", "Dias", "Status", "Mês", "Ano", "Custo total", "Custo por dia", "Custo por pessoa", "Diferença planejado vs realizado", "Ranking"];
  s.getRange("A5:N5").values = [headers];
  styleHeader(s.getRange("A5:N5"), palette.navy);
  s.getRange("A6:N205").values = padRows([["V001"], ["V002"], ["V003"]], headers.length);
  s.getRange("B6:B205").formulas = formulaColumn((r) => `=IF($A${r}="","",IFERROR(INDEX('Planejamento de Viagens'!$B$6:$B$205,MATCH($A${r},'Planejamento de Viagens'!$A$6:$A$205,0)),""))`);
  s.getRange("C6:C205").formulas = formulaColumn((r) => `=IF($A${r}="","",IFERROR(INDEX('Planejamento de Viagens'!$C$6:$C$205,MATCH($A${r},'Planejamento de Viagens'!$A$6:$A$205,0)),""))`);
  s.getRange("D6:D205").formulas = formulaColumn((r) => `=IF($A${r}="","",IFERROR(INDEX('Planejamento de Viagens'!$F$6:$F$205,MATCH($A${r},'Planejamento de Viagens'!$A$6:$A$205,0)),""))`);
  s.getRange("E6:E205").formulas = formulaColumn((r) => `=IF($A${r}="","",IFERROR(INDEX('Planejamento de Viagens'!$G$6:$G$205,MATCH($A${r},'Planejamento de Viagens'!$A$6:$A$205,0)),""))`);
  s.getRange("F6:F205").formulas = formulaColumn((r) => `=IF($A${r}="","",IFERROR(INDEX('Planejamento de Viagens'!$J$6:$J$205,MATCH($A${r},'Planejamento de Viagens'!$A$6:$A$205,0)),0))`);
  s.getRange("G6:G205").formulas = formulaColumn((r) => `=IF($A${r}="","",IFERROR(INDEX('Planejamento de Viagens'!$K$6:$K$205,MATCH($A${r},'Planejamento de Viagens'!$A$6:$A$205,0)),""))`);
  s.getRange("H6:H205").formulas = formulaColumn((r) => `=IF($A${r}="","",TEXT(INDEX('Planejamento de Viagens'!$H$6:$H$205,MATCH($A${r},'Planejamento de Viagens'!$A$6:$A$205,0)),"mmm/yyyy"))`);
  s.getRange("I6:I205").formulas = formulaColumn((r) => `=IF($A${r}="","",2026)`);
  s.getRange("J6:J205").formulas = formulaColumn((r) => `=IF($A${r}="","",INDEX('Planejamento de Viagens'!$N$6:$N$205,MATCH($A${r},'Planejamento de Viagens'!$A$6:$A$205,0)))`);
  s.getRange("K6:K205").formulas = formulaColumn((r) => `=IF($A${r}="","",IFERROR($J${r}/$F${r},0))`);
  s.getRange("L6:L205").formulas = formulaColumn((r) => `=IF($A${r}="","",$J${r}/2)`);
  s.getRange("M6:M205").formulas = formulaColumn((r) => `=IF($A${r}="","",INDEX('Planejamento de Viagens'!$O$6:$O$205,MATCH($A${r},'Planejamento de Viagens'!$A$6:$A$205,0)))`);
  s.getRange("N6:N205").formulas = formulaColumn((r) => `=IF($A${r}="","",COUNTIF($J$6:$J$205,">"&$J${r})+1)`);
  styleInput(s.getRange("A6:A205"));
  styleFormula(s.getRange("B6:N205"));
  setNumberFormat(s.getRange("J6:M205"), moneyFmt);
  setNumberFormat(s.getRange("F6:F205"), intFmt);
  setNumberFormat(s.getRange("N6:N205"), intFmt);
  addTable(s, "A5:N205", "TabelaComparativoViagens", "TableStyleMedium9");
  s.getRange("P5:R10").values = [
    ["Ranking", "Viagem", "Custo"],
    ["Mais cara", null, null],
    ["Mais econômica", null, null],
    ["Melhor custo-benefício", null, null],
    ["Maior estouro", null, null],
    ["Melhor planejamento", null, null],
  ];
  s.getRange("Q6:R10").formulas = [
    ["=IFERROR(INDEX($B$6:$B$205,MATCH(MAX($J$6:$J$205),$J$6:$J$205,0)),\"\")", "=MAX($J$6:$J$205)"],
    ["=IFERROR(INDEX($B$6:$B$205,MATCH(MINIFS($J$6:$J$205,$J$6:$J$205,\">0\"),$J$6:$J$205,0)),\"\")", "=MINIFS($J$6:$J$205,$J$6:$J$205,\">0\")"],
    ["=IFERROR(INDEX($B$6:$B$205,MATCH(MINIFS($K$6:$K$205,$K$6:$K$205,\">0\"),$K$6:$K$205,0)),\"\")", "=MINIFS($K$6:$K$205,$K$6:$K$205,\">0\")"],
    ["=IFERROR(INDEX($B$6:$B$205,MATCH(MIN($M$6:$M$205),$M$6:$M$205,0)),\"\")", "=MIN($M$6:$M$205)"],
    ["=IFERROR(INDEX($B$6:$B$205,MATCH(MAX($M$6:$M$205),$M$6:$M$205,0)),\"\")", "=MAX($M$6:$M$205)"],
  ];
  styleHeader(s.getRange("P5:R5"), palette.greenStrong);
  styleFormula(s.getRange("Q6:R10"));
  setFormat(s.getRange("P6:P10"), { fill: palette.surface, font: { bold: true, color: palette.ink }, borders: { preset: "all", style: "thin", color: palette.line } });
  setNumberFormat(s.getRange("R6:R10"), moneyFmt);
  addChart(s, "bar", "B5:J8", "Custo total por viagem", "P12", "W29", 'R$ #,##0', false);
  const widths = { A: 80, B: 210, C: 185, D: 130, E: 130, F: 80, G: 120, H: 100, I: 80, J: 125, K: 120, L: 130, M: 150, N: 95, O: 24, P: 170, Q: 220, R: 130, S: 90, T: 90, U: 90, V: 90, W: 90 };
  for (const [col, width] of Object.entries(widths)) setWidth(s, col, width);
  freeze(s, 5);
}

// Dashboard
{
  const s = sheets["Dashboard"];
  s.showGridLines = false;
  safe("merge dashboard title", () => s.getRange("A1:N1").merge());
  s.getRange("A1").values = [["Planejamento Financeiro do Relacionamento à Distância"]];
  setFormat(s.getRange("A1:N1"), { fill: palette.navy, font: { bold: true, color: palette.white, size: 20 }, horizontalAlignment: "center", verticalAlignment: "center" });
  setHeight(s, 1, 38, 14);
  safe("merge dashboard subtitle", () => s.getRange("A2:N2").merge());
  s.getRange("A2").values = [[`${PEDRO} e ${CAMILLY} | orçamento, viagens, acertos e metas em um só lugar`]];
  setFormat(s.getRange("A2:N2"), { fill: palette.lilac, font: { color: palette.ink, italic: true }, horizontalAlignment: "center" });
  s.getRange("A4:N5").values = [
    ["Pessoa viajando", "", "Sentido", "", "Status", "", "Origem", "", "Destino", "", "Período", "", "Categoria", ""],
    ["Todos", "", "Todos", "", "Todos", "", "Todos", "", "Todos", "", "Todos", "", "Todos", ""],
  ];
  for (const r of ["A4:B4", "C4:D4", "E4:F4", "G4:H4", "I4:J4", "K4:L4", "M4:N4"]) safe("merge filtro label", () => s.getRange(r).merge());
  for (const r of ["A5:B5", "C5:D5", "E5:F5", "G5:H5", "I5:J5", "K5:L5", "M5:N5"]) safe("merge filtro valor", () => s.getRange(r).merge());
  styleHeader(s.getRange("A4:N4"), palette.purple);
  styleInput(s.getRange("A5:N5"));
  addValidation(s.getRange("A5:B5"), ["Todos", PEDRO, CAMILLY]);
  addValidation(s.getRange("E5:F5"), ["Todos", ...statusViagem]);
  addValidation(s.getRange("G5:H5"), ["Todos", ...cidades]);
  addValidation(s.getRange("I5:J5"), ["Todos", ...cidades]);
  addValidation(s.getRange("M5:N5"), ["Todos", ...categorias]);

  const kpis = [
    ["Gasto total planejado", "=SUM('Planejamento de Viagens'!$M$6:$M$205)", moneyFmt],
    ["Gasto total realizado", "=SUM('Planejamento de Viagens'!$N$6:$N$205)", moneyFmt],
    ["Diferença planejado vs realizado", "=SUM('Planejamento de Viagens'!$O$6:$O$205)", moneyFmt],
    ["Total pago por Pedro", "=SUM('Planejamento de Viagens'!$Q$6:$Q$205)", moneyFmt],
    ["Total pago por Camilly", "=SUM('Planejamento de Viagens'!$R$6:$R$205)", moneyFmt],
    ["Saldo de compensação", "=SUM('Planejamento de Viagens'!$S$6:$S$205)", moneyFmt],
    ["Próxima viagem", "=IFERROR(INDEX('Planejamento de Viagens'!$B$6:$B$205,MATCH(MINIFS('Planejamento de Viagens'!$H$6:$H$205,'Planejamento de Viagens'!$H$6:$H$205,\">=\"&TODAY(),'Planejamento de Viagens'!$K$6:$K$205,\"<>Concluída\"),'Planejamento de Viagens'!$H$6:$H$205,0)),\"Sem viagem futura\")", "@"],
    ["Custo médio por viagem", "=IFERROR(AVERAGEIF('Planejamento de Viagens'!$N$6:$N$205,\">0\",'Planejamento de Viagens'!$N$6:$N$205),0)", moneyFmt],
    ["Custo médio por dia juntos", "=IFERROR(SUM('Planejamento de Viagens'!$N$6:$N$205)/SUM('Planejamento de Viagens'!$J$6:$J$205),0)", moneyFmt],
    ["Maior categoria de gasto", "=IFERROR(INDEX($AA$5:$AA$18,MATCH(MAX($AB$5:$AB$18),$AB$5:$AB$18,0)),\"Sem gastos\")", "@"],
    ["Mês com maior gasto", "=IFERROR(INDEX($AK$5:$AK$16,MATCH(MAX($AL$5:$AL$16),$AL$5:$AL$16,0)),\"Sem gastos\")", "@"],
    ["Economia acumulada", "=MAX('Economia e Metas'!$H$6:$H$205)", moneyFmt],
    ["Percentual da meta atingida", "=IFERROR(SUM('Economia e Metas'!$E$6:$E$205)/SUM('Economia e Metas'!$D$6:$D$205),0)", pctFmt],
    ["Viagens planejadas", "=COUNTIF('Planejamento de Viagens'!$K$6:$K$205,\"Planejada\")", intFmt],
    ["Viagens concluídas", "=COUNTIF('Planejamento de Viagens'!$K$6:$K$205,\"Concluída\")", intFmt],
  ];
  const cardPositions = [
    ["A7:C9"], ["D7:F9"], ["G7:I9"], ["J7:L9"], ["A11:C13"],
    ["D11:F13"], ["G11:I13"], ["J11:L13"], ["A15:C17"], ["D15:F17"],
    ["G15:I17"], ["J15:L17"], ["A19:C21"], ["D19:F21"], ["G19:I21"],
  ];
  cardPositions.forEach(([rg], idx) => {
    const [start, end] = rg.split(":");
    const labelRange = `${start}:${end.replace(/\d+$/, String(Number(start.match(/\d+$/)[0])))}`;
    const rows = rg.match(/\d+/g).map(Number);
    const cols = rg.match(/[A-Z]+/g);
    const label = `${cols[0]}${rows[0]}:${cols[1]}${rows[0]}`;
    const value = `${cols[0]}${rows[0] + 1}:${cols[1]}${rows[1]}`;
    safe("merge card label", () => s.getRange(label).merge());
    safe("merge card value", () => s.getRange(value).merge());
    s.getRange(cols[0] + rows[0]).values = [[kpis[idx][0]]];
    s.getRange(cols[0] + (rows[0] + 1)).formulas = [[kpis[idx][1]]];
    setFormat(s.getRange(label), { fill: idx % 2 ? palette.pink : palette.blue, font: { bold: true, color: palette.ink }, borders: { preset: "outside", style: "thin", color: palette.line }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true });
    setFormat(s.getRange(value), { fill: palette.white, font: { bold: true, color: palette.navy, size: 14 }, borders: { preset: "outside", style: "thin", color: palette.line }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true });
    setNumberFormat(s.getRange(value), kpis[idx][2]);
  });
  s.getRange("M7:N7").values = [["Alertas inteligentes", ""]];
  safe("merge alert title", () => s.getRange("M7:N7").merge());
  styleHeader(s.getRange("M7:N7"), palette.navy);
  const alerts = [
    ["=IF(COUNTIF('Planejamento de Viagens'!$P$6:$P$205,\">1\")>0,\"A viagem está acima do orçamento.\",\"Nenhuma viagem acima do orçamento.\")"],
    ["=IF(COUNTIFS('Planejamento de Viagens'!$X$6:$X$205,\"\",'Planejamento de Viagens'!$K$6:$K$205,\"Planejada\")>0,\"Falta reservar hospedagem.\",\"Hospedagens principais preenchidas.\")"],
    ["=IF(COUNTIFS('Planejamento de Viagens'!$W$6:$W$205,\"\",'Planejamento de Viagens'!$K$6:$K$205,\"Planejada\")>0,\"Passagem ainda não comprada.\",\"Passagens principais preenchidas.\")"],
    ["=IF(SUM('Planejamento de Viagens'!$S$6:$S$205)>0,\"Existe valor pendente de compensação.\",\"Sem compensações pendentes.\")"],
    ["=IF(COUNTIFS('Checklist de Viagem'!$H$6:$H$205,\"Não\",'Checklist de Viagem'!$E$6:$E$205,\"<\"&TODAY()+15)>0,\"Viagem próxima sem checklist completo.\",\"Checklists sob controle.\")"],
    ["=IF(COUNTIFS('Parcelamentos'!$H$6:$H$205,\"<=\"&TODAY()+7,'Parcelamentos'!$I$6:$I$205,\"Pendente\")>0,\"Há parcelas vencendo nos próximos 7 dias.\",\"Sem parcelas urgentes.\")"],
    ["=IF(SUM('Planejamento de Viagens'!$N$6:$N$205)>SUM('Planejamento de Viagens'!$M$6:$M$205),\"Gasto realizado maior que planejado.\",\"Realizado dentro do planejado geral.\")"],
    ["=IFERROR(IF(SUM('Economia e Metas'!$E$6:$E$205)<SUM('Economia e Metas'!$D$6:$D$205),\"Meta de economia abaixo do esperado.\",\"Meta de economia saudável.\"),\"Cadastre metas de economia.\")"],
  ];
  s.getRange("M8:N15").formulas = alerts.map((r) => [r[0], null]);
  safe("merge alert rows", () => ["M8:N8","M9:N9","M10:N10","M11:N11","M12:N12","M13:N13","M14:N14","M15:N15"].forEach((r) => s.getRange(r).merge()));
  setFormat(s.getRange("M8:N15"), { fill: palette.yellow, font: { color: palette.ink }, borders: { preset: "all", style: "thin", color: palette.line }, wrapText: true });

  // Helper ranges for dashboard charts.
  s.getRange("AA4:AB18").values = [["Categoria", "Gastos"], ...categorias.map((cat) => [cat, null])];
  s.getRange("AB5:AB18").formulas = categorias.map((cat, i) => [`=SUMIFS('Histórico de Gastos'!$J$6:$J$205,'Histórico de Gastos'!$F$6:$F$205,$AA${5 + i})`]);
  s.getRange("AD4:AE6").values = [["Pessoa", "Pago"], [PEDRO, null], [CAMILLY, null]];
  s.getRange("AE5:AE6").formulas = [["=SUM('Histórico de Gastos'!$W$6:$W$205)"], ["=SUM('Histórico de Gastos'!$X$6:$X$205)"]];
  s.getRange("AG4:AI7").values = [["Viagem", "Planejado", "Realizado"], ["=B6", "=M6", "=N6"], ["=B7", "=M7", "=N7"], ["=B8", "=M8", "=N8"]];
  s.getRange("AG5:AI7").formulas = [
    ["='Planejamento de Viagens'!$B$6", "='Planejamento de Viagens'!$M$6", "='Planejamento de Viagens'!$N$6"],
    ["='Planejamento de Viagens'!$B$7", "='Planejamento de Viagens'!$M$7", "='Planejamento de Viagens'!$N$7"],
    ["='Planejamento de Viagens'!$B$8", "='Planejamento de Viagens'!$M$8", "='Planejamento de Viagens'!$N$8"],
  ];
  s.getRange("AK4:AL16").values = [["Mês", "Gastos"], ...meses.map((m) => [m, null])];
  const monthDates = Array.from({ length: 12 }, (_, i) => excelDate(2026, i + 1, 1));
  s.getRange("AM5:AM16").values = monthDates.map((d) => [d]);
  s.getRange("AL5:AL16").formulas = monthsFormula("Histórico de Gastos", "C", "J");
  s.getRange("AN4:AO7").values = [["Viagem", "Custo por dia"], ["=AG5", null], ["=AG6", null], ["=AG7", null]];
  s.getRange("AN5:AO7").formulas = [
    ["=AG5", "='Comparativo de Viagens'!$K$6"],
    ["=AG6", "='Comparativo de Viagens'!$K$7"],
    ["=AG7", "='Comparativo de Viagens'!$K$8"],
  ];
  s.getRange("AQ4:AR18").values = [["Categoria", "Percentual"], ...categorias.map((cat) => [cat, null])];
  s.getRange("AR5:AR18").formulas = categorias.map((cat, i) => [`=IFERROR($AB${5 + i}/SUM($AB$5:$AB$18),0)`]);
  s.getRange("AT4:AV7").values = [["Tipo", "Planejado", "Realizado"], ["Fixo", null, null], ["Variável", null, null], ["Emergencial/Opcional", null, null]];
  s.getRange("AU5:AV7").formulas = [
    ["=SUMIFS('Custos Planejados - Pedro'!$G$6:$G$205,'Custos Planejados - Pedro'!$E$6:$E$205,$AT5)+SUMIFS('Custos Planejados - Camilly'!$G$6:$G$205,'Custos Planejados - Camilly'!$E$6:$E$205,$AT5)", "=SUMIFS('Histórico de Gastos'!$J$6:$J$205,'Histórico de Gastos'!$H$6:$H$205,$AT5)"],
    ["=SUMIFS('Custos Planejados - Pedro'!$G$6:$G$205,'Custos Planejados - Pedro'!$E$6:$E$205,$AT6)+SUMIFS('Custos Planejados - Camilly'!$G$6:$G$205,'Custos Planejados - Camilly'!$E$6:$E$205,$AT6)", "=SUMIFS('Histórico de Gastos'!$J$6:$J$205,'Histórico de Gastos'!$H$6:$H$205,$AT6)"],
    ["=SUMIFS('Custos Planejados - Pedro'!$G$6:$G$205,'Custos Planejados - Pedro'!$E$6:$E$205,\"Emergencial\")+SUMIFS('Custos Planejados - Pedro'!$G$6:$G$205,'Custos Planejados - Pedro'!$E$6:$E$205,\"Opcional\")+SUMIFS('Custos Planejados - Camilly'!$G$6:$G$205,'Custos Planejados - Camilly'!$E$6:$E$205,\"Emergencial\")+SUMIFS('Custos Planejados - Camilly'!$G$6:$G$205,'Custos Planejados - Camilly'!$E$6:$E$205,\"Opcional\")", "=SUMIFS('Histórico de Gastos'!$J$6:$J$205,'Histórico de Gastos'!$H$6:$H$205,\"Emergencial\")+SUMIFS('Histórico de Gastos'!$J$6:$J$205,'Histórico de Gastos'!$H$6:$H$205,\"Opcional\")"],
  ];
  s.getRange("AX4:AY6").values = [["Pessoa", "Valor pago"], [PEDRO, null], [CAMILLY, null]];
  s.getRange("AY5:AY6").formulas = [["=AE5"], ["=AE6"]];
  s.getRange("BA4:BB9").values = [["Mês", "Economia acumulada"], ...meses.slice(0, 5).map((m) => [m, null])];
  s.getRange("BB5:BB9").formulas = meses.slice(0, 5).map((m, i) => [`=SUMIFS('Economia e Metas'!$E$6:$E$205,'Economia e Metas'!$A$6:$A$205,$BA${5 + i})+IF(${i}=0,0,$BB${4 + i})`]);
  s.getRange("BD4:BE13").values = [["Descrição", "Valor"], ...Array.from({ length: 9 }, () => [null, null])];
  s.getRange("BD5:BE13").formulas = Array.from({ length: 9 }, (_, i) => [
    `=IFERROR(INDEX('Histórico de Gastos'!$I$6:$I$205,MATCH(LARGE('Histórico de Gastos'!$J$6:$J$205,ROW(A${i + 1})),'Histórico de Gastos'!$J$6:$J$205,0)),"")`,
    `=IFERROR(LARGE('Histórico de Gastos'!$J$6:$J$205,ROW(A${i + 1})),0)`,
  ]);
  styleHeader(s.getRange("AA4:BE4"), palette.navy);
  setFormat(s.getRange("AA5:BE18"), { fill: palette.white, font: { color: palette.ink }, borders: { preset: "all", style: "thin", color: palette.line }, wrapText: true });
  setNumberFormat(s.getRange("AB5:AB18"), moneyFmt);
  setNumberFormat(s.getRange("AE5:AE6"), moneyFmt);
  setNumberFormat(s.getRange("AH5:AI7"), moneyFmt);
  setNumberFormat(s.getRange("AL5:AL16"), moneyFmt);
  setNumberFormat(s.getRange("AO5:AO7"), moneyFmt);
  setNumberFormat(s.getRange("AR5:AR18"), pctFmt);
  setNumberFormat(s.getRange("AU5:AV7"), moneyFmt);
  setNumberFormat(s.getRange("AY5:AY6"), moneyFmt);
  setNumberFormat(s.getRange("BB5:BB9"), moneyFmt);
  setNumberFormat(s.getRange("BE5:BE13"), moneyFmt);

  addChart(s, "bar", "AA4:AB18", "Gastos por categoria", "A23", "G40", 'R$ #,##0', false);
  addChart(s, "doughnut", "AD4:AE6", "Gastos por pessoa", "H23", "N40", 'R$ #,##0', true);
  addChart(s, "bar", "AG4:AI7", "Planejado vs realizado", "A43", "G60", 'R$ #,##0', true);
  addChart(s, "line", "AK4:AL16", "Evolução mensal dos gastos", "H43", "N60", 'R$ #,##0', false);
  addChart(s, "bar", "AN4:AO7", "Comparativo entre viagens", "A63", "G80", 'R$ #,##0', false);
  addChart(s, "pie", "AQ4:AR18", "Distribuição percentual por categoria", "H63", "N80", '0.0%', true);
  addChart(s, "bar", "AT4:AV7", "Custos fixos vs variáveis", "A83", "G100", 'R$ #,##0', true);
  addChart(s, "doughnut", "AX4:AY6", "Quem pagou o quê", "H83", "N100", 'R$ #,##0', true);
  addChart(s, "area", "BA4:BB9", "Economia mensal acumulada", "A103", "G120", 'R$ #,##0', false);
  addChart(s, "bar", "BD4:BE13", "Top 10 maiores gastos", "H103", "N120", 'R$ #,##0', false);
  for (const [col, width] of Object.entries({ A: 110, B: 110, C: 110, D: 110, E: 110, F: 110, G: 110, H: 110, I: 110, J: 110, K: 110, L: 110, M: 130, N: 130 })) setWidth(s, col, width);
  for (const col of ["O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]) setWidth(s, col, 18);
  for (const col of ["AA", "AB", "AD", "AE", "AG", "AH", "AI", "AK", "AL", "AN", "AO", "AQ", "AR", "AT", "AU", "AV", "AX", "AY", "BA", "BB", "BD", "BE"]) setWidth(s, col, 90);
  freeze(s, 5);
}

function monthsFormula(sheetName, dateCol, valueCol) {
  return meses.map((_, i) => [`=SUMIFS('${sheetName}'!$${valueCol}$6:$${valueCol}$205,'${sheetName}'!$${dateCol}$6:$${dateCol}$205,">="&$AM${5 + i},'${sheetName}'!$${dateCol}$6:$${dateCol}$205,"<"&EDATE($AM${5 + i},1))`]);
}

// Documentação
{
  const s = sheets["Documentação"];
  initSheet(s, "Documentação", "Manual completo para manter a planilha correta, útil e simples de atualizar.", 8);
  const sections = [
    ["Objetivo da planilha", "Organizar viagens de relacionamento à distância em ambos os sentidos, comparando custos planejados, gastos reais, acertos, parcelamentos e metas de economia."],
    ["Como cadastrar uma nova viagem", "Use Planejamento de Viagens. Preencha ID, datas, pessoa viajando, cidades, status e links importantes. Os totais financeiros serão calculados a partir das abas de custos planejados e histórico."],
    ["Como planejar custos", "Use Custos Planejados - Pedro ou Custos Planejados - Camilly conforme quem está organizando aquele conjunto de gastos. Cada linha representa um gasto previsto."],
    ["Como registrar gastos reais", "Use Histórico de Gastos. Preencha quem pagou, categoria, valor, forma de pagamento e percentuais de divisão. A planilha calcula responsabilidades e compensação."],
    ["Como funciona a divisão", "Percentual Pedro e Percentual Camilly definem a responsabilidade de cada um. Se Pedro pagou mais que sua responsabilidade, Camilly aparece devendo a diferença; se pagou menos, Pedro deve compensar Camilly."],
    ["Como ler o Dashboard", "Os cartões mostram totais, médias, compensação, próxima viagem, metas e status geral. Os gráficos usam os registros de exemplo e se atualizam quando as tabelas forem editadas."],
    ["Como usar filtros", "Os seletores no topo do Dashboard ajudam a orientar a análise. Para filtros detalhados, use os filtros das tabelas nativas do Excel em cada aba."],
    ["Como usar o simulador", "Preencha os campos em azul no Simulador de Viagem. Os resultados mostram custo total, custo por dia, divisão por pessoa, valor recomendado de economia mensal e alerta de risco."],
    ["Como atualizar categorias", "Edite a Base de Categorias para incluir novas categorias, subcategorias, status, cidades e formas de pagamento. Os menus suspensos usam essa base."],
    ["Boas práticas", "Cadastre gastos logo após ocorrerem, salve comprovantes, mantenha percentuais revisados antes do acerto e confira alertas de parcelas e checklist antes da viagem."],
    ["Campos manuais", "Células em azul indicam entradas manuais. São exemplos: datas, valores de gastos, links, status, responsáveis, percentuais de divisão e observações."],
    ["Campos automáticos", "Células em cinza são calculadas. Evite editar fórmulas de totais, diferenças, responsabilidades, acertos, alertas, rankings e cartões do Dashboard."],
  ];
  s.getRange("A4:H4").values = [["Seção", "Explicação", "", "", "", "", "", ""]];
  safe("merge docs header", () => s.getRange("B4:H4").merge());
  styleHeader(s.getRange("A4:H4"), palette.navy);
  sections.forEach((sec, i) => {
    const r = 5 + i * 2;
    s.getRange(`A${r}:H${r + 1}`).values = [
      [sec[0], sec[1], null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    safe("merge doc section", () => {
      s.getRange(`A${r}:A${r + 1}`).merge();
      s.getRange(`B${r}:H${r + 1}`).merge();
    });
    setFormat(s.getRange(`A${r}:A${r + 1}`), { fill: i % 2 ? palette.pink : palette.blue, font: { bold: true, color: palette.ink }, borders: { preset: "all", style: "thin", color: palette.line }, verticalAlignment: "center", wrapText: true });
    setFormat(s.getRange(`B${r}:H${r + 1}`), { fill: palette.white, font: { color: palette.ink }, borders: { preset: "all", style: "thin", color: palette.line }, verticalAlignment: "center", wrapText: true });
    setHeight(s, r, 34, 8);
    setHeight(s, r + 1, 34, 8);
  });
  for (const [col, width] of Object.entries({ A: 210, B: 160, C: 160, D: 160, E: 160, F: 160, G: 160, H: 160 })) setWidth(s, col, width);
}

// Guia Rápido
{
  const s = sheets["Guia Rápido"];
  initSheet(s, "Guia Rápido", "Comece por aqui: um guia de uma página para Pedro e Camilly usarem a planilha sem complicação.", 8);
  const qa = [
    ["Como começar?", "Revise Configurações, veja os exemplos e depois cadastre ou edite suas viagens em Planejamento de Viagens."],
    ["Onde eu cadastro uma viagem?", "Na aba Planejamento de Viagens, uma linha por visita."],
    ["Onde eu coloco os gastos planejados?", "Em Custos Planejados - Pedro e Custos Planejados - Camilly."],
    ["Onde eu registro os gastos reais?", "Na aba Histórico de Gastos, preenchendo quem pagou e como o valor deve ser dividido."],
    ["Como sei quem deve para quem?", "Veja a aba Divisão e Acertos. Ela mostra a frase de compensação e o valor sugerido."],
    ["Como uso o simulador?", "Abra Simulador de Viagem, preencha os campos em azul e leia os resultados à direita."],
    ["Como vejo o histórico?", "Use Histórico de Gastos para detalhes e Comparativo de Viagens para análise entre visitas."],
    ["O que eu devo preencher manualmente?", "Campos em azul: viagens, custos, gastos, prazos, status, links, percentuais e observações."],
    ["O que a planilha calcula sozinha?", "Campos em cinza: totais, diferenças, percentuais, acertos, alertas, rankings, metas e indicadores do Dashboard."],
  ];
  s.getRange("A4:H4").values = [["Pergunta", "Resposta", "", "", "", "", "", ""]];
  safe("merge quick header", () => s.getRange("B4:H4").merge());
  styleHeader(s.getRange("A4:H4"), palette.purple);
  qa.forEach((item, i) => {
    const r = 5 + i * 3;
    s.getRange(`A${r}:H${r + 1}`).values = [
      [item[0], item[1], null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];
    safe("merge quick card", () => {
      s.getRange(`A${r}:A${r + 1}`).merge();
      s.getRange(`B${r}:H${r + 1}`).merge();
    });
    setFormat(s.getRange(`A${r}:A${r + 1}`), { fill: i % 2 ? palette.lilac : palette.green, font: { bold: true, color: palette.ink }, borders: { preset: "all", style: "thin", color: palette.line }, verticalAlignment: "center", wrapText: true });
    setFormat(s.getRange(`B${r}:H${r + 1}`), { fill: palette.white, font: { color: palette.ink }, borders: { preset: "all", style: "thin", color: palette.line }, verticalAlignment: "center", wrapText: true });
    setHeight(s, r, 32, 8);
    setHeight(s, r + 1, 32, 8);
  });
  for (const [col, width] of Object.entries({ A: 260, B: 160, C: 160, D: 160, E: 160, F: 160, G: 160, H: 160 })) setWidth(s, col, width);
}

// Apply formats and quick polish for all sheets.
for (const name of sheetNames) {
  const s = sheets[name];
  safe(`linha título ${name}`, () => {
    s.getRange("A1:A1").format.font = { bold: true, color: palette.white, size: 18 };
  });
}

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const dashboardInspect = await wb.inspect({
  kind: "table",
  range: "Dashboard!A1:N21",
  include: "values,formulas",
  tableMaxRows: 25,
  tableMaxCols: 14,
  maxChars: 4000,
});
console.log("INSPECT_DASHBOARD");
console.log(dashboardInspect.ndjson);

const errors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
  maxChars: 4000,
});
console.log("FORMULA_ERRORS");
console.log(errors.ndjson);

for (const name of sheetNames) {
  const preview = await wb.render({ sheetName: name, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(previewDir, `${name.replace(/[\\/:*?"<>|]/g, "_")}.png`), new Uint8Array(await preview.arrayBuffer()));
}
console.log(`PREVIEWS_RENDERED=${sheetNames.length}`);

const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(outputPath);
console.log(`OUTPUT=${outputPath}`);

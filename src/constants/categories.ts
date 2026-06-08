export const personLabels = {
  pedro: "Pedro",
  camilly: "Camilly",
  ambos: "Ambos"
} as const;

export const paymentMethods = ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito", "Transferência", "Boleto"];
export const costTypes = ["fixo", "variavel", "emergencial", "opcional"] as const;
export const tripStatuses = ["planejada", "em_andamento", "concluida", "cancelada", "adiada"] as const;
export const priorities = ["alta", "media", "baixa"] as const;

export const defaultCategoryNames = [
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
  "Imprevistos"
];

export function labelPerson(value?: string | null) {
  if (value === "pedro") return "Pedro";
  if (value === "camilly") return "Camilly";
  return "Ambos";
}

export function labelStatus(value?: string | null) {
  const map: Record<string, string> = {
    planejada: "Planejada",
    em_andamento: "Em andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
    adiada: "Adiada",
    pendente: "Pendente",
    concluido: "Concluído",
    pago: "Pago",
    atrasado: "Atrasado",
    orcado: "Orçado",
    reservado: "Reservado",
    ideia: "Ideia",
    comprado: "Comprado"
  };
  return value ? map[value] ?? value : "Sem status";
}

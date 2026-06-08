import { tableNames } from "../../services/finance.service";

describe("contrato de serviços Supabase", () => {
  it("mantém nomes de tabelas centrais", () => {
    expect(tableNames.trips).toBe("trips");
    expect(tableNames.expenses).toBe("expenses");
    expect(tableNames.plannedExpenses).toBe("planned_expenses");
    expect(tableNames.settlements).toBe("settlements");
    expect(tableNames.installments).toBe("installments");
  });
});

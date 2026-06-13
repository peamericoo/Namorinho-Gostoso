import { deriveTripStatusFromDates, getEffectiveTripStatus, normalizeTripForWrite } from "../../lib/tripLifecycle";

const referenceDate = "2026-06-13";

describe("ciclo de vida da viagem", () => {
  it("marca como concluída quando a volta ficou no passado", () => {
    expect(deriveTripStatusFromDates("2026-01-10", "2026-01-15", referenceDate)).toBe("concluida");
  });

  it("marca como em andamento quando o período contém hoje", () => {
    expect(deriveTripStatusFromDates("2026-06-10", "2026-06-14", referenceDate)).toBe("em_andamento");
  });

  it("marca como planejada quando a ida está no futuro", () => {
    expect(deriveTripStatusFromDates("2026-07-01", "2026-07-05", referenceDate)).toBe("planejada");
  });

  it("preserva viagens canceladas e adiadas como exceções manuais", () => {
    expect(
      getEffectiveTripStatus(
        {
          start_date: "2026-01-10",
          end_date: "2026-01-15",
          status: "cancelada"
        },
        referenceDate
      )
    ).toBe("cancelada");

    expect(
      normalizeTripForWrite(
        {
          start_date: "2026-01-10",
          end_date: "2026-01-15",
          status: "adiada"
        },
        referenceDate
      ).status
    ).toBe("adiada");
  });

  it("normaliza status automático antes de salvar", () => {
    const result = normalizeTripForWrite(
      {
        start_date: "2026-01-10",
        end_date: "2026-01-15",
        status: "planejada"
      },
      referenceDate
    );

    expect(result.status).toBe("concluida");
  });
});

import { readFileSync } from "fs";
import { join } from "path";

describe("hardening de RLS e integridade Supabase", () => {
  const migration = readFileSync(join(process.cwd(), "supabase/migrations/202606100001_backend_audit_hardening.sql"), "utf8");

  it("declara helper de admin e restringe gestão de membros/casal", () => {
    expect(migration).toContain("public.is_couple_admin");
    expect(migration).toContain("couples_delete_admins");
    expect(migration).toContain("members_insert_admins");
    expect(migration).toContain("members_update_admins");
    expect(migration).toContain("members_delete_admins");
  });

  it("mantém um workspace por usuário e criação transacional por RPC", () => {
    expect(migration).toContain("couple_members_one_workspace_per_user");
    expect(migration).toContain("public.create_workspace");
    expect(migration).toContain("gen_random_uuid()");
  });

  it("valida integridade de registros financeiros por casal", () => {
    expect(migration).toContain("validate_finance_row_integrity");
    expect(migration).toContain("A viagem informada nao pertence ao casal do registro.");
    expect(migration).toContain("A categoria informada nao pertence ao casal do registro.");
    expect(migration).toContain("A subcategoria informada nao pertence ao casal do registro.");
  });
});

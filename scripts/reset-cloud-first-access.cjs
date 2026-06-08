const pg = require("pg");

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.RESET_EMAIL;
const password = process.env.RESET_PASSWORD;

if (!databaseUrl || !email || !password) {
  console.error("Defina DATABASE_URL, RESET_EMAIL e RESET_PASSWORD.");
  process.exit(1);
}

const userId = "33333333-3333-4333-8333-333333333333";
const coupleId = "44444444-4444-4444-8444-444444444444";

async function main() {
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  await client.query("begin");

  try {
    await client.query("alter table public.profiles add column if not exists tutorial_completed_at timestamptz");

    await client.query(`
      delete from public.settlements;
      delete from public.installments;
      delete from public.savings_goals;
      delete from public.itinerary_items;
      delete from public.checklist_items;
      delete from public.expenses;
      delete from public.planned_expenses;
      delete from public.trips;
      delete from public.subcategories where category_id in (select id from public.categories where couple_id is not null);
      delete from public.categories where couple_id is not null;
      delete from public.app_settings;
      delete from public.couple_members;
      delete from public.couples;
      delete from public.profiles;
    `);

    await client.query(
      `
        insert into auth.users (
          id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
          confirmation_token, recovery_token, email_change, email_change_token_new,
          email_change_token_current, email_change_confirm_status, reauthentication_token,
          raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user,
          is_anonymous, banned_until, deleted_at, created_at, updated_at
        ) values (
          $1,
          '00000000-0000-0000-0000-000000000000'::uuid,
          'authenticated',
          'authenticated',
          $2,
          extensions.crypt($3, extensions.gen_salt('bf', 10)),
          now(),
          '',
          '',
          '',
          '',
          '',
          0,
          '',
          jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
          jsonb_build_object('full_name', 'Camilly'),
          false,
          false,
          false,
          null,
          null,
          now(),
          now()
        )
        on conflict (id) do update set
          instance_id = '00000000-0000-0000-0000-000000000000'::uuid,
          aud = 'authenticated',
          role = 'authenticated',
          email = excluded.email,
          encrypted_password = excluded.encrypted_password,
          email_confirmed_at = coalesce(auth.users.email_confirmed_at, now()),
          confirmation_token = '',
          recovery_token = '',
          email_change = '',
          email_change_token_new = '',
          email_change_token_current = '',
          email_change_confirm_status = 0,
          reauthentication_token = '',
          raw_app_meta_data = excluded.raw_app_meta_data,
          raw_user_meta_data = excluded.raw_user_meta_data,
          is_sso_user = false,
          is_anonymous = false,
          banned_until = null,
          deleted_at = null,
          updated_at = now()
      `,
      [userId, email, password]
    );

    await client.query(
      `
        insert into auth.identities (
          id, user_id, provider_id, identity_data, provider,
          last_sign_in_at, created_at, updated_at
        ) values (
          gen_random_uuid(),
          $1::uuid,
          $1::uuid::text,
          jsonb_build_object(
            'sub', $1::uuid::text,
            'email', $2::text,
            'email_verified', true,
            'phone_verified', false
          ),
          'email',
          now(),
          now(),
          now()
        )
        on conflict (provider, provider_id) do update set
          user_id = excluded.user_id,
          identity_data = excluded.identity_data,
          updated_at = now()
      `,
      [userId, email]
    );

    await client.query("delete from auth.identities where provider = 'email' and user_id <> $1::uuid and identity_data->>'email' = $2", [userId, email]);
    await client.query("delete from auth.users where id <> $1::uuid and email = $2", [userId, email]);

    await client.query(
      `
        insert into public.profiles (user_id, full_name, display_name, person_key, tutorial_completed_at)
        values ($1::uuid, 'Camilly', 'Camilly', 'camilly', null)
      `,
      [userId]
    );

    await client.query(
      `
        insert into public.couples (
          id, name, created_by, default_currency, default_split_pedro, default_split_camilly,
          monthly_budget_pedro, monthly_budget_camilly, monthly_budget_shared, emergency_reserve_percent
        ) values (
          $1::uuid, 'Pedro e Camilly', $2::uuid, 'BRL', 50, 50, 2200, 1800, 4000, 12
        )
      `,
      [coupleId, userId]
    );

    await client.query(
      `
        insert into public.couple_members (couple_id, user_id, role, person_key)
        values ($1::uuid, $2::uuid, 'admin', 'camilly')
      `,
      [coupleId, userId]
    );

    await client.query(
      `
        insert into public.categories (couple_id, name, type, icon, color, is_default)
        values
          ($1::uuid, 'Transporte principal', 'expense', 'plane', '#4779C4', true),
          ($1::uuid, 'Transporte local', 'expense', 'car', '#7C8DD8', true),
          ($1::uuid, 'Hospedagem', 'expense', 'home', '#8A6FAE', true),
          ($1::uuid, 'Alimentação', 'expense', 'utensils', '#2F9E65', true),
          ($1::uuid, 'Presentes e relacionamento', 'expense', 'heart', '#C067A0', true),
          ($1::uuid, 'Passeios', 'expense', 'map', '#F59E0B', true)
      `,
      [coupleId]
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }

  console.log("Ambiente cloud resetado para primeiro acesso.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

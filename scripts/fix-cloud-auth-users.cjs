const pg = require("pg");

const databaseUrl = process.env.DATABASE_URL;
const password = process.env.DEMO_PASSWORD || "relacionamento123";

if (!databaseUrl) {
  console.error("Defina DATABASE_URL com a connection string do Supabase Pooler ou banco direto.");
  process.exit(1);
}

const users = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "pedro@example.com",
    fullName: "Pedro Americo Paletot",
    displayName: "Pedro",
    personKey: "pedro"
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "camilly@example.com",
    fullName: "Camilly Queiroz",
    displayName: "Camilly",
    personKey: "camilly"
  }
];

async function main() {
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  await client.query("begin");

  try {
    for (const user of users) {
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
            jsonb_build_object('full_name', $4::text),
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
        [user.id, user.email, password, user.fullName]
      );

      await client.query(
        `
          update auth.identities
          set provider_id = user_id::text,
              identity_data = jsonb_build_object(
                'sub', user_id::text,
                'email', $2::text,
                'email_verified', true,
                'phone_verified', false
              ),
              updated_at = now()
          where user_id = $1::uuid and provider = 'email'
        `,
        [user.id, user.email]
      );

      await client.query(
        `
          insert into auth.identities (
            id, user_id, provider_id, identity_data, provider,
            last_sign_in_at, created_at, updated_at
          )
          select
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
          where not exists (
            select 1 from auth.identities where user_id = $1::uuid and provider = 'email'
          )
        `,
        [user.id, user.email]
      );

      await client.query(
        `
          insert into public.profiles (user_id, full_name, display_name, person_key)
          values ($1, $2::text, $3::text, $4::text)
          on conflict (user_id) do update set
            full_name = excluded.full_name,
            display_name = excluded.display_name,
            person_key = excluded.person_key,
            updated_at = now()
        `,
        [user.id, user.fullName, user.displayName, user.personKey]
      );
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }

  console.log("Usuarios demo de Auth corrigidos com sucesso.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

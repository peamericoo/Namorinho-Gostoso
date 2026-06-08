insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pedro@example.com',
  extensions.crypt('relacionamento123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Pedro Américo Paletot"}'::jsonb,
  now(),
  now()
),
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'camilly@example.com',
  extensions.crypt('relacionamento123', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Camilly Queiroz"}'::jsonb,
  now(),
  now()
)
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values
(
  'aaaaaaaa-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'pedro@example.com',
  jsonb_build_object('sub', '11111111-1111-1111-1111-111111111111', 'email', 'pedro@example.com'),
  'email',
  now(),
  now(),
  now()
),
(
  'aaaaaaaa-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'camilly@example.com',
  jsonb_build_object('sub', '22222222-2222-2222-2222-222222222222', 'email', 'camilly@example.com'),
  'email',
  now(),
  now(),
  now()
)
on conflict do nothing;

insert into public.profiles (id, user_id, full_name, display_name, person_key)
values
  ('33333333-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Pedro Américo Paletot', 'Pedro', 'pedro'),
  ('33333333-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Camilly Queiroz', 'Camilly', 'camilly')
on conflict (user_id) do update set full_name = excluded.full_name, display_name = excluded.display_name, person_key = excluded.person_key;

insert into public.couples (
  id, name, created_by, default_currency, default_split_pedro, default_split_camilly,
  monthly_budget_pedro, monthly_budget_camilly, monthly_budget_shared, emergency_reserve_percent
) values (
  '44444444-4444-4444-4444-444444444444',
  'Pedro e Camilly',
  '11111111-1111-1111-1111-111111111111',
  'BRL',
  50,
  50,
  2200,
  1800,
  4000,
  12
) on conflict (id) do update set name = excluded.name;

insert into public.couple_members (couple_id, user_id, role, person_key)
values
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'admin', 'pedro'),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'admin', 'camilly')
on conflict (couple_id, user_id) do nothing;

insert into public.categories (couple_id, name, type, icon, color, is_default)
values
  ('44444444-4444-4444-4444-444444444444', 'Transporte principal', 'expense', 'plane', '#4779C4', true),
  ('44444444-4444-4444-4444-444444444444', 'Transporte local', 'expense', 'car', '#7C8DD8', true),
  ('44444444-4444-4444-4444-444444444444', 'Hospedagem', 'expense', 'home', '#8A6FAE', true),
  ('44444444-4444-4444-4444-444444444444', 'Alimentação', 'expense', 'utensils', '#2F9E65', true),
  ('44444444-4444-4444-4444-444444444444', 'Lazer e encontros', 'expense', 'heart', '#C067A0', true),
  ('44444444-4444-4444-4444-444444444444', 'Casa e estadia', 'expense', 'sofa', '#7C6A46', true),
  ('44444444-4444-4444-4444-444444444444', 'Comunicação e internet', 'expense', 'wifi', '#3B82F6', true),
  ('44444444-4444-4444-4444-444444444444', 'Saúde e segurança', 'expense', 'cross', '#EF7A85', true),
  ('44444444-4444-4444-4444-444444444444', 'Documentos e taxas', 'expense', 'file', '#64748B', true),
  ('44444444-4444-4444-4444-444444444444', 'Presentes e relacionamento', 'expense', 'gift', '#D86BA1', true),
  ('44444444-4444-4444-4444-444444444444', 'Beleza e autocuidado', 'expense', 'sparkles', '#A78BFA', true),
  ('44444444-4444-4444-4444-444444444444', 'Trabalho e estudo', 'expense', 'briefcase', '#0EA5E9', true),
  ('44444444-4444-4444-4444-444444444444', 'Pets, família e casa', 'expense', 'users', '#84A98C', true),
  ('44444444-4444-4444-4444-444444444444', 'Imprevistos', 'expense', 'alert', '#F59E0B', true)
on conflict (couple_id, name) do update set color = excluded.color, is_default = true;

insert into public.subcategories (category_id, name)
select c.id, s.name
from public.categories c
join (
  values
  ('Transporte principal', 'Passagem aérea'), ('Transporte principal', 'Passagem de ônibus'), ('Transporte principal', 'Passagem de trem'),
  ('Transporte principal', 'Combustível'), ('Transporte principal', 'Pedágio'), ('Transporte principal', 'Estacionamento'),
  ('Transporte principal', 'Bagagem despachada'), ('Transporte principal', 'Bagagem de mão extra'), ('Transporte principal', 'Marcação de assento'),
  ('Transporte principal', 'Taxa de embarque'), ('Transporte principal', 'Seguro viagem'), ('Transporte principal', 'Transporte até aeroporto'),
  ('Transporte principal', 'Transporte até rodoviária'), ('Transporte principal', 'Transporte saindo do aeroporto'), ('Transporte principal', 'Transporte saindo da rodoviária'),
  ('Transporte principal', 'Remarcação de passagem'), ('Transporte principal', 'Cancelamento de passagem'),
  ('Transporte local', 'Uber'), ('Transporte local', '99'), ('Transporte local', 'Táxi'), ('Transporte local', 'Metrô'),
  ('Transporte local', 'Ônibus local'), ('Transporte local', 'Aluguel de carro'), ('Transporte local', 'Bicicleta'), ('Transporte local', 'Patinete'),
  ('Transporte local', 'Estacionamento local'), ('Transporte local', 'Transporte noturno'), ('Transporte local', 'Transporte emergencial'),
  ('Hospedagem', 'Airbnb'), ('Hospedagem', 'Hotel'), ('Hospedagem', 'Pousada'), ('Hospedagem', 'Hostel'), ('Hospedagem', 'Taxa de limpeza'),
  ('Hospedagem', 'Taxa de serviço'), ('Hospedagem', 'Caução'), ('Hospedagem', 'Early check-in'), ('Hospedagem', 'Late check-out'),
  ('Hospedagem', 'Diária extra'), ('Hospedagem', 'Hospedagem emergencial'),
  ('Alimentação', 'Café da manhã'), ('Alimentação', 'Almoço'), ('Alimentação', 'Jantar'), ('Alimentação', 'Lanches'),
  ('Alimentação', 'Delivery'), ('Alimentação', 'Mercado'), ('Alimentação', 'Bebidas'), ('Alimentação', 'Cafeteria'),
  ('Alimentação', 'Restaurante especial'), ('Alimentação', 'Comida no aeroporto'), ('Alimentação', 'Comida na rodoviária'),
  ('Alimentação', 'Sobremesas'), ('Alimentação', 'Comida para casa'),
  ('Lazer e encontros', 'Cinema'), ('Lazer e encontros', 'Shows'), ('Lazer e encontros', 'Passeios'), ('Lazer e encontros', 'Restaurantes especiais'),
  ('Lazer e encontros', 'Experiências românticas'), ('Lazer e encontros', 'Fotos'), ('Lazer e encontros', 'Eventos'), ('Lazer e encontros', 'Museus'),
  ('Lazer e encontros', 'Parques'), ('Lazer e encontros', 'Praia'), ('Lazer e encontros', 'Baladas'), ('Lazer e encontros', 'Jogos'),
  ('Lazer e encontros', 'Atividades gratuitas'), ('Lazer e encontros', 'Atividades pagas'),
  ('Casa e estadia', 'Mercado para casa'), ('Casa e estadia', 'Produtos de higiene'), ('Casa e estadia', 'Produtos de limpeza'), ('Casa e estadia', 'Lavanderia'),
  ('Casa e estadia', 'Itens emergenciais'), ('Casa e estadia', 'Água'), ('Casa e estadia', 'Gás proporcional'), ('Casa e estadia', 'Luz proporcional'),
  ('Casa e estadia', 'Internet proporcional'), ('Casa e estadia', 'Pequenos reparos'), ('Casa e estadia', 'Itens esquecidos'),
  ('Comunicação e internet', 'Chip temporário'), ('Comunicação e internet', 'Pacote de dados'), ('Comunicação e internet', 'Wi-Fi'),
  ('Comunicação e internet', 'Recarga de celular'), ('Comunicação e internet', 'Ligações'), ('Comunicação e internet', 'Apps pagos'),
  ('Saúde e segurança', 'Farmácia'), ('Saúde e segurança', 'Consulta emergencial'), ('Saúde e segurança', 'Seguro'),
  ('Saúde e segurança', 'Absorventes/produtos pessoais'), ('Saúde e segurança', 'Medicamentos'), ('Saúde e segurança', 'Máscaras'),
  ('Saúde e segurança', 'Álcool em gel'), ('Saúde e segurança', 'Repelente'), ('Saúde e segurança', 'Protetor solar'), ('Saúde e segurança', 'Curativos'),
  ('Documentos e taxas', 'Documento'), ('Documentos e taxas', 'Segunda via'), ('Documentos e taxas', 'Taxas bancárias'), ('Documentos e taxas', 'IOF'),
  ('Documentos e taxas', 'Câmbio'), ('Documentos e taxas', 'Multas'), ('Documentos e taxas', 'Remarcações'), ('Documentos e taxas', 'Cancelamentos'),
  ('Documentos e taxas', 'Impressões'), ('Documentos e taxas', 'Cópias'), ('Documentos e taxas', 'Guarda-volumes'),
  ('Presentes e relacionamento', 'Flores'), ('Presentes e relacionamento', 'Chocolates'), ('Presentes e relacionamento', 'Cartas'),
  ('Presentes e relacionamento', 'Presentes surpresa'), ('Presentes e relacionamento', 'Aniversário de namoro'), ('Presentes e relacionamento', 'Aniversário pessoal'),
  ('Presentes e relacionamento', 'Datas especiais'), ('Presentes e relacionamento', 'Mimos'), ('Presentes e relacionamento', 'Decoração'),
  ('Presentes e relacionamento', 'Álbum de fotos'), ('Presentes e relacionamento', 'Lembranças'),
  ('Beleza e autocuidado', 'Cabelo'), ('Beleza e autocuidado', 'Unhas'), ('Beleza e autocuidado', 'Maquiagem'), ('Beleza e autocuidado', 'Barba'),
  ('Beleza e autocuidado', 'Roupa especial'), ('Beleza e autocuidado', 'Perfume'), ('Beleza e autocuidado', 'Acessórios'), ('Beleza e autocuidado', 'Cuidados pessoais'),
  ('Trabalho e estudo', 'Coworking'), ('Trabalho e estudo', 'Internet extra'), ('Trabalho e estudo', 'Impressões'), ('Trabalho e estudo', 'Materiais de estudo'),
  ('Trabalho e estudo', 'Transporte para compromissos'), ('Trabalho e estudo', 'Alimentação em horário de trabalho'), ('Trabalho e estudo', 'Adaptações de agenda'),
  ('Pets, família e casa', 'Pet sitter'), ('Pets, família e casa', 'Hospedagem de pet'), ('Pets, família e casa', 'Ajuda para família'),
  ('Pets, família e casa', 'Cuidador'), ('Pets, família e casa', 'Organização da casa antes da viagem'), ('Pets, família e casa', 'Serviços domésticos'),
  ('Imprevistos', 'Emergência'), ('Imprevistos', 'Mudança de plano'), ('Imprevistos', 'Hospedagem extra'), ('Imprevistos', 'Transporte extra'),
  ('Imprevistos', 'Alimentação extra'), ('Imprevistos', 'Perda de item'), ('Imprevistos', 'Roupa extra'), ('Imprevistos', 'Remédio extra'),
  ('Imprevistos', 'Taxas inesperadas'), ('Imprevistos', 'Outros')
) as s(category_name, name) on c.name = s.category_name
where c.couple_id = '44444444-4444-4444-4444-444444444444'
on conflict (category_id, name) do nothing;

insert into public.trips (
  id, couple_id, title, traveler_person, host_person, direction, origin_city, destination_city,
  start_date, end_date, status, purpose, planned_budget, priority, tickets_url, accommodation_url,
  itinerary_url, ticket_deadline, accommodation_deadline, notes, created_by
) values
(
  '55555555-0001-0001-0001-000000000001',
  '44444444-4444-4444-4444-444444444444',
  'Camilly em João Pessoa',
  'camilly',
  'pedro',
  'Camilly visita Pedro',
  'Cuiabá',
  'João Pessoa',
  current_date + interval '34 days',
  current_date + interval '40 days',
  'planejada',
  'Semana juntos com roteiro leve e visita à família.',
  2265,
  'alta',
  'https://exemplo.com/passagem-v001',
  null,
  'https://exemplo.com/roteiro-v001',
  current_date + interval '10 days',
  current_date + interval '16 days',
  'Dados fictícios para demonstração.',
  '11111111-1111-1111-1111-111111111111'
),
(
  '55555555-0002-0002-0002-000000000002',
  '44444444-4444-4444-4444-444444444444',
  'Pedro visitando Camilly',
  'pedro',
  'camilly',
  'Pedro visita Camilly',
  'João Pessoa',
  'Cuiabá',
  current_date + interval '75 days',
  current_date + interval '80 days',
  'planejada',
  'Descanso, restaurantes especiais e organização financeira.',
  2935,
  'media',
  null,
  'https://exemplo.com/hospedagem-v002',
  null,
  current_date + interval '38 days',
  current_date + interval '45 days',
  'Substitua pelos dados reais quando quiser.',
  '11111111-1111-1111-1111-111111111111'
),
(
  '55555555-0003-0003-0003-000000000003',
  '44444444-4444-4444-4444-444444444444',
  'Fim de semana juntos',
  'pedro',
  'camilly',
  'Encontro em cidade neutra',
  'João Pessoa',
  'Recife',
  current_date - interval '22 days',
  current_date - interval '20 days',
  'concluida',
  'Fim de semana curto para matar a saudade.',
  1140,
  'baixa',
  'https://exemplo.com/passagem-v003',
  'https://exemplo.com/hotel-v003',
  'https://exemplo.com/roteiro-v003',
  current_date - interval '45 days',
  current_date - interval '40 days',
  'Viagem concluída com gastos reais de exemplo.',
  '11111111-1111-1111-1111-111111111111'
);

insert into public.planned_expenses (
  couple_id, trip_id, owner_person, expected_date, category_id, subcategory_id, cost_type, description,
  planned_amount, min_amount, max_amount, probability, is_required, paid_by_person, beneficiary_person,
  payment_method, is_installment, installment_count, status, notes
)
select
  '44444444-4444-4444-4444-444444444444',
  t.id,
  p.owner_person,
  current_date + p.day_offset,
  c.id,
  sc.id,
  p.cost_type,
  p.description,
  p.planned_amount,
  p.min_amount,
  p.max_amount,
  p.probability,
  p.is_required,
  p.paid_by_person,
  p.beneficiary_person,
  p.payment_method,
  p.is_installment,
  p.installment_count,
  p.status,
  p.notes
from (
  values
  ('Camilly em João Pessoa', 'camilly', 12, 'Transporte principal', 'Passagem aérea', 'fixo', 'Passagem Cuiabá - João Pessoa', 1320, 1100, 1500, 100, true, 'camilly', 'camilly', 'Cartão de crédito', true, 3, 'reservado', ''),
  ('Camilly em João Pessoa', 'camilly', 34, 'Transporte local', 'Uber', 'variavel', 'Aeroporto para casa', 95, 75, 130, 100, true, 'pedro', 'ambos', 'Pix', false, 1, 'orcado', ''),
  ('Camilly em João Pessoa', 'camilly', 36, 'Alimentação', 'Mercado', 'variavel', 'Mercado para dias em casa', 310, 240, 380, 100, true, 'pedro', 'ambos', 'Pix', false, 1, 'orcado', ''),
  ('Camilly em João Pessoa', 'camilly', 38, 'Lazer e encontros', 'Praia', 'opcional', 'Dia de praia com almoço', 190, 120, 260, 80, false, 'ambos', 'ambos', 'Pix', false, 1, 'ideia', ''),
  ('Camilly em João Pessoa', 'camilly', 39, 'Presentes e relacionamento', 'Flores', 'opcional', 'Flores de boas-vindas', 90, 60, 130, 80, false, 'pedro', 'camilly', 'Pix', false, 1, 'ideia', ''),
  ('Pedro visitando Camilly', 'pedro', 35, 'Transporte principal', 'Passagem aérea', 'fixo', 'Passagem João Pessoa - Cuiabá', 1180, 950, 1350, 100, true, 'pedro', 'pedro', 'Cartão de crédito', true, 3, 'orcado', ''),
  ('Pedro visitando Camilly', 'pedro', 75, 'Hospedagem', 'Airbnb', 'fixo', 'Airbnb próximo ao centro', 860, 700, 980, 100, true, 'camilly', 'ambos', 'Cartão de crédito', true, 2, 'reservado', ''),
  ('Pedro visitando Camilly', 'pedro', 76, 'Alimentação', 'Restaurante especial', 'opcional', 'Jantar especial', 240, 180, 320, 80, false, 'pedro', 'ambos', 'Cartão de crédito', false, 1, 'ideia', ''),
  ('Pedro visitando Camilly', 'pedro', 77, 'Lazer e encontros', 'Cinema', 'opcional', 'Cinema e lanche', 120, 90, 160, 70, false, 'camilly', 'ambos', 'Pix', false, 1, 'ideia', ''),
  ('Fim de semana juntos', 'pedro', -23, 'Transporte principal', 'Passagem de ônibus', 'fixo', 'Ônibus João Pessoa - Recife', 180, 150, 220, 100, true, 'pedro', 'pedro', 'Cartão de crédito', false, 1, 'comprado', ''),
  ('Fim de semana juntos', 'camilly', -22, 'Hospedagem', 'Hotel', 'fixo', 'Hotel para duas diárias', 620, 520, 760, 100, true, 'camilly', 'ambos', 'Cartão de crédito', true, 2, 'comprado', ''),
  ('Fim de semana juntos', 'camilly', -21, 'Alimentação', 'Delivery', 'variavel', 'Delivery domingo à noite', 95, 70, 130, 100, true, 'camilly', 'ambos', 'Pix', false, 1, 'comprado', '')
) as p(trip_title, owner_person, day_offset, category_name, subcategory_name, cost_type, description, planned_amount, min_amount, max_amount, probability, is_required, paid_by_person, beneficiary_person, payment_method, is_installment, installment_count, status, notes)
join public.trips t on t.title = p.trip_title and t.couple_id = '44444444-4444-4444-4444-444444444444'
join public.categories c on c.name = p.category_name and c.couple_id = t.couple_id
left join public.subcategories sc on sc.category_id = c.id and sc.name = p.subcategory_name;

insert into public.expenses (
  couple_id, trip_id, spent_at, paid_by_person, beneficiary_person, category_id, subcategory_id,
  cost_type, description, amount, payment_method, account_label, is_installment, installment_count,
  current_installment, installment_amount, is_reimbursable, should_split, split_pedro_percent,
  split_camilly_percent, receipt_url, notes, created_by
)
select
  '44444444-4444-4444-4444-444444444444',
  t.id,
  current_date + e.day_offset,
  e.paid_by_person,
  e.beneficiary_person,
  c.id,
  sc.id,
  e.cost_type,
  e.description,
  e.amount,
  e.payment_method,
  e.account_label,
  e.is_installment,
  e.installment_count,
  e.current_installment,
  e.installment_amount,
  e.is_reimbursable,
  e.should_split,
  e.split_pedro_percent,
  e.split_camilly_percent,
  e.receipt_url,
  e.notes,
  '11111111-1111-1111-1111-111111111111'
from (
  values
  ('Fim de semana juntos', -23, 'pedro', 'pedro', 'Transporte principal', 'Passagem de ônibus', 'fixo', 'Passagem de ônibus João Pessoa - Recife', 178, 'Cartão de crédito', 'Nubank Pedro', false, 1, 1, 178, true, false, 100, 0, null, ''),
  ('Fim de semana juntos', -22, 'camilly', 'ambos', 'Hospedagem', 'Hotel', 'fixo', 'Hotel duas diárias', 640, 'Cartão de crédito', 'Inter Camilly', true, 2, 1, 320, true, true, 50, 50, null, ''),
  ('Fim de semana juntos', -22, 'pedro', 'ambos', 'Transporte local', 'Uber', 'variavel', 'Uber da rodoviária para hotel', 42, 'Pix', 'Conta Pedro', false, 1, 1, 42, true, true, 50, 50, null, ''),
  ('Fim de semana juntos', -22, 'pedro', 'ambos', 'Alimentação', 'Café da manhã', 'variavel', 'Café da manhã', 68, 'Pix', 'Conta Pedro', false, 1, 1, 68, true, true, 50, 50, null, ''),
  ('Fim de semana juntos', -21, 'camilly', 'ambos', 'Alimentação', 'Delivery', 'variavel', 'Delivery domingo', 112, 'Pix', 'Conta Camilly', false, 1, 1, 112, true, true, 50, 50, null, ''),
  ('Fim de semana juntos', -21, 'pedro', 'ambos', 'Lazer e encontros', 'Passeios', 'opcional', 'Passeio e fotos', 124, 'Pix', 'Conta Pedro', false, 1, 1, 124, true, true, 50, 50, null, ''),
  ('Fim de semana juntos', -20, 'camilly', 'ambos', 'Imprevistos', 'Transporte extra', 'emergencial', 'Corrida extra para rodoviária', 72, 'Pix', 'Conta Camilly', false, 1, 1, 72, true, true, 50, 50, null, ''),
  ('Camilly em João Pessoa', 8, 'camilly', 'camilly', 'Transporte principal', 'Passagem aérea', 'fixo', 'Primeira parcela da passagem', 440, 'Cartão de crédito', 'Cartão Camilly', true, 3, 1, 440, true, false, 0, 100, null, 'Compra antecipada.'),
  ('Camilly em João Pessoa', 9, 'pedro', 'camilly', 'Presentes e relacionamento', 'Flores', 'opcional', 'Flores de boas-vindas', 88, 'Pix', 'Conta Pedro', false, 1, 1, 88, false, false, 100, 0, null, ''),
  ('Pedro visitando Camilly', 15, 'pedro', 'pedro', 'Transporte principal', 'Passagem aérea', 'fixo', 'Primeira parcela passagem Pedro', 393.33, 'Cartão de crédito', 'Nubank Pedro', true, 3, 1, 393.33, true, false, 100, 0, null, ''),
  ('Pedro visitando Camilly', 18, 'camilly', 'ambos', 'Hospedagem', 'Airbnb', 'fixo', 'Sinal do Airbnb', 430, 'Cartão de crédito', 'Inter Camilly', true, 2, 1, 430, true, true, 50, 50, null, '')
) as e(trip_title, day_offset, paid_by_person, beneficiary_person, category_name, subcategory_name, cost_type, description, amount, payment_method, account_label, is_installment, installment_count, current_installment, installment_amount, is_reimbursable, should_split, split_pedro_percent, split_camilly_percent, receipt_url, notes)
join public.trips t on t.title = e.trip_title and t.couple_id = '44444444-4444-4444-4444-444444444444'
join public.categories c on c.name = e.category_name and c.couple_id = t.couple_id
left join public.subcategories sc on sc.category_id = c.id and sc.name = e.subcategory_name;

insert into public.checklist_items (couple_id, trip_id, title, category, responsible_person, due_date, status, priority, is_done, notes)
select
  '44444444-4444-4444-4444-444444444444',
  t.id,
  c.title,
  c.category,
  c.responsible_person,
  current_date + c.day_offset,
  c.status,
  c.priority,
  c.is_done,
  ''
from (
  values
  ('Camilly em João Pessoa', 'Confirmar datas', 'Planejamento', 'camilly', 5, 'concluido', 'alta', true),
  ('Camilly em João Pessoa', 'Comprar passagem', 'Transporte', 'camilly', 10, 'em_andamento', 'alta', false),
  ('Camilly em João Pessoa', 'Reservar hospedagem', 'Hospedagem', 'pedro', 16, 'pendente', 'alta', false),
  ('Camilly em João Pessoa', 'Planejar roteiro', 'Roteiro', 'ambos', 24, 'pendente', 'media', false),
  ('Camilly em João Pessoa', 'Salvar comprovantes', 'Finanças', 'ambos', 40, 'pendente', 'media', false),
  ('Pedro visitando Camilly', 'Confirmar datas', 'Planejamento', 'pedro', 22, 'concluido', 'alta', true),
  ('Pedro visitando Camilly', 'Comprar passagem', 'Transporte', 'pedro', 38, 'pendente', 'alta', false),
  ('Pedro visitando Camilly', 'Fazer check-in', 'Transporte', 'pedro', 73, 'pendente', 'alta', false),
  ('Pedro visitando Camilly', 'Reservar restaurantes', 'Lazer', 'camilly', 68, 'pendente', 'media', false),
  ('Fim de semana juntos', 'Comprar passagem', 'Transporte', 'pedro', -46, 'concluido', 'alta', true),
  ('Fim de semana juntos', 'Reservar hospedagem', 'Hospedagem', 'camilly', -42, 'concluido', 'alta', true),
  ('Fim de semana juntos', 'Separar documentos', 'Documentos', 'ambos', -25, 'concluido', 'media', true)
) as c(trip_title, title, category, responsible_person, day_offset, status, priority, is_done)
join public.trips t on t.title = c.trip_title and t.couple_id = '44444444-4444-4444-4444-444444444444';

insert into public.itinerary_items (couple_id, trip_id, date, time, activity, location, category, estimated_cost, actual_cost, responsible_person, requires_booking, booking_url, status, notes)
select
  '44444444-4444-4444-4444-444444444444',
  t.id,
  current_date + i.day_offset,
  i.time,
  i.activity,
  i.location,
  i.category,
  i.estimated_cost,
  i.actual_cost,
  i.responsible_person,
  i.requires_booking,
  i.booking_url,
  i.status,
  ''
from (
  values
  ('Camilly em João Pessoa', 34, '18:30', 'Chegada e jantar em casa', 'João Pessoa', 'Alimentação', 120, 0, 'ambos', false, null, 'planejado'),
  ('Camilly em João Pessoa', 35, '10:00', 'Praia e almoço', 'Cabo Branco', 'Lazer', 190, 0, 'pedro', false, null, 'planejado'),
  ('Pedro visitando Camilly', 76, '19:30', 'Jantar especial', 'Cuiabá', 'Alimentação', 240, 0, 'camilly', true, null, 'ideia'),
  ('Fim de semana juntos', -21, '15:00', 'Passeio pelo centro antigo', 'Recife', 'Lazer', 110, 124, 'pedro', false, null, 'concluido')
) as i(trip_title, day_offset, time, activity, location, category, estimated_cost, actual_cost, responsible_person, requires_booking, booking_url, status)
join public.trips t on t.title = i.trip_title and t.couple_id = '44444444-4444-4444-4444-444444444444';

insert into public.savings_goals (couple_id, month, person, trip_id, target_amount, saved_amount, notes)
select
  '44444444-4444-4444-4444-444444444444',
  s.month_date,
  s.person,
  t.id,
  s.target_amount,
  s.saved_amount,
  s.notes
from (
  values
  (date_trunc('month', current_date)::date - interval '2 months', 'pedro', 'Fim de semana juntos', 450, 500, 'Meta mensal Pedro'),
  (date_trunc('month', current_date)::date - interval '2 months', 'camilly', 'Fim de semana juntos', 350, 320, 'Meta mensal Camilly'),
  (date_trunc('month', current_date)::date - interval '1 month', 'pedro', 'Camilly em João Pessoa', 500, 580, 'Meta mensal Pedro'),
  (date_trunc('month', current_date)::date - interval '1 month', 'camilly', 'Camilly em João Pessoa', 420, 450, 'Meta mensal Camilly'),
  (date_trunc('month', current_date)::date, 'ambos', 'Pedro visitando Camilly', 900, 760, 'Meta conjunta próxima viagem')
) as s(month_date, person, trip_title, target_amount, saved_amount, notes)
left join public.trips t on t.title = s.trip_title and t.couple_id = '44444444-4444-4444-4444-444444444444';

insert into public.installments (couple_id, trip_id, responsible_person, description, total_amount, installment_count, installment_amount, current_installment, due_date, status, payment_method, notes)
select
  '44444444-4444-4444-4444-444444444444',
  t.id,
  i.responsible_person,
  i.description,
  i.total_amount,
  i.installment_count,
  round(i.total_amount / i.installment_count, 2),
  i.current_installment,
  current_date + i.day_offset,
  i.status,
  i.payment_method,
  ''
from (
  values
  ('Camilly em João Pessoa', 'camilly', 'Passagem em 3x', 1320, 3, 1, 5, 'pendente', 'Cartão de crédito'),
  ('Camilly em João Pessoa', 'camilly', 'Passagem em 3x', 1320, 3, 2, 35, 'pendente', 'Cartão de crédito'),
  ('Camilly em João Pessoa', 'camilly', 'Passagem em 3x', 1320, 3, 3, 65, 'pendente', 'Cartão de crédito'),
  ('Pedro visitando Camilly', 'camilly', 'Hospedagem em 2x', 860, 2, 1, 15, 'pendente', 'Cartão de crédito'),
  ('Pedro visitando Camilly', 'camilly', 'Hospedagem em 2x', 860, 2, 2, 45, 'pendente', 'Cartão de crédito'),
  ('Fim de semana juntos', 'camilly', 'Hotel Recife', 640, 2, 2, -2, 'concluido', 'Cartão de crédito')
) as i(trip_title, responsible_person, description, total_amount, installment_count, current_installment, day_offset, status, payment_method)
join public.trips t on t.title = i.trip_title and t.couple_id = '44444444-4444-4444-4444-444444444444';

insert into public.app_settings (couple_id, key, value)
values
  ('44444444-4444-4444-4444-444444444444', 'tema', '{"preferencia":"claro"}'::jsonb),
  ('44444444-4444-4444-4444-444444444444', 'moeda', '{"codigo":"BRL","simbolo":"R$"}'::jsonb)
on conflict (couple_id, key) do update set value = excluded.value;

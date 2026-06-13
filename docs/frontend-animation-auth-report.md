# Relatorio de animacoes e autenticacao

Data: 2026-06-10

## Causa do bug de animacao

O componente global `Screen` executava a animacao de entrada dentro de `useEffect`, portanto ela rodava apenas quando a tela era montada. Em navegacao por tabs, o Expo Router/React Navigation mantem telas montadas em cache para preservar estado e performance. O fluxo ficava assim:

- Primeira entrada na tela: componente monta, `useEffect` roda, animacao aparece.
- Navegacoes seguintes entre tabs ja montadas: componente recebe foco, mas nao remonta; `useEffect` nao roda novamente.
- Ao entrar em submenus/stacks e voltar, algumas telas eram remontadas ou tinham ciclo de foco diferente, o que fazia a animacao parecer voltar temporariamente.

## Correcao aplicada

Arquivo afetado: `src/components/ui/Screen.tsx`.

A animacao foi movida para `useFocusEffect`, que roda sempre que a rota ganha foco. Antes de iniciar a animacao, os valores animados sao resetados:

- `opacity`: volta para `0`.
- `translateY`: volta para `10`.
- a animacao anterior e parada se ainda estiver em andamento.
- ao perder foco, a animacao e interrompida para evitar callbacks tardios.

Com isso, tabs cacheadas e telas de stack passam a ter o mesmo comportamento: toda entrada/foco dispara a animacao.

## Arquivos afetados na autenticacao

- `src/components/auth/AuthLayout.tsx`: novo layout premium compartilhado.
- `app/auth/login.tsx`: experiencia de entrada redesenhada.
- `app/auth/signup.tsx`: cadastro redesenhado.
- `app/auth/forgot-password.tsx`: recuperacao redesenhada.
- `app/auth/profile-setup.tsx`: setup inicial redesenhado.

## Correcoes de experiencia

- Layout de autenticacao recriado do zero.
- Painel narrativo com pilares do produto: tempo, caminhos compartilhados e combinados em paz.
- Formulario com hierarquia mais clara, melhor uso de espaco, estados de erro/sucesso e links de acao acessiveis.
- Microinteracao de entrada por foco de rota no proprio layout de auth.
- Melhor responsividade: layout em duas colunas em telas amplas e empilhado em telas menores.
- Fluxos de autenticacao preservados: `signIn`, `signUp`, `resetPassword` e `setupProfileAndCouple` continuam sendo usados.

## Possiveis efeitos colaterais

- Toda tela que usa `Screen` agora reanima ao ganhar foco, inclusive quando o usuario volta de uma rota interna. Esse e o comportamento desejado pelo produto.
- Como a animacao reinicia por foco, trocas muito rapidas de rota podem interromper uma animacao anterior; o cleanup foi adicionado para evitar acumulacao.
- A autenticacao deixou de usar o `Screen` generico e passou a usar `AuthLayout`, entao mudancas futuras no visual global de `Screen` nao afetam automaticamente as telas de auth.

## Testes realizados

- `npm run typecheck`: passou.
- `npm run lint`: passou.
- `npm test -- --runInBand`: passou, 4 suites e 22 testes.
- Validacao web em `http://localhost:8081`: login, cadastro, recuperacao de senha e setup renderizaram sem erro de runtime.
- Validacao manual recomendada:
  - navegar em sequencia Painel -> Viagens -> Gastos -> Simulador -> Mais e confirmar animacao em todas;
  - repetir a sequencia duas vezes para confirmar que tabs cacheadas reanimam;
  - entrar em submenu e voltar para tabs;
  - abrir login, cadastro, recuperacao e setup em desktop/mobile.

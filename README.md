# CitizenTech · Front-end com interações em JavaScript

Front-end da central de revisão de alertas de trânsito. O código-fonte exibe o protótipo com o nome **Sentinela 360 Rio**; esta entrega acrescenta interações simples em JavaScript para que o usuário interaja com a página e receba respostas às suas ações.

## Como rodar

Requisitos: Node.js 22.18 ou superior e npm.

```bash
npm install        # instala as dependências
npm run dev        # servidor de desenvolvimento
npm run build      # gera a versão de produção em dist/
npm run preview    # serve o conteúdo de dist/
npm test           # roda os testes das funções de senha
```

Para entrar, use o botão **Preencher acesso de demonstração** na tela de login (e-mail `operador@sentinela360.rio`, senha `demo1234`).

## Interações adicionadas

| # | Interação | Onde aparece | O que o usuário recebe como resposta |
|---|---|---|---|
| 1 | **Medidor de força da senha** | Meu perfil → Segurança → *Nova senha* | Quatro barras e um rótulo (Muito fraca, Fraca, Razoável, Boa ou Forte), atualizados a cada tecla. Some quando o campo está vazio. |
| 2 | **Atalhos de teclado** | Qualquer tela com sessão iniciada | `/` foca e seleciona a busca de eventos; `?` mostra a lista de atalhos. |
| 3 | **Copiar número do auto** | Detalhe de um alerta confirmado, em cada auto de infração | O botão *Copiar nº* vira *Copiado!* (ou *Não foi possível copiar*) por 2 segundos. |
| 4 | **Voltar ao topo** | Qualquer tela com sessão iniciada | Um botão flutuante aparece depois de 400 px de rolagem e leva ao topo da página. |

## Conceitos de JavaScript usados

- **Funções:** `avaliarSenha` e `copiarTexto` (em `src/lib/interacoes.ts`) recebem um dado e devolvem um resultado; `ehCampoDeTexto` responde se o foco está num campo de digitação.
- **Manipulação do DOM:** o atalho `/` localiza a busca com `document.getElementById`, chama `focus()` e `select()`; a cópia cria um `<textarea>` temporário com `createElement`, `appendChild` e `removeChild` como plano B.
- **Operadores:** soma para pontuar a senha (`+=`), comparações (`>=`, `<=`, `!==`), lógicos (`&&`, `||`) e `!` para negar.
- **Condicionais:** `if` para checar comprimento, número, mistura de maiúsculas e minúsculas e símbolos; `if` para ignorar atalhos enquanto o usuário digita; `if` para decidir entre a API moderna e o plano B da cópia; `?:` para escolher a cor e o rótulo da resposta.
- **Eventos:** `keydown`, `scroll` e `click`, com remoção dos listeners quando o componente sai da tela.

## Arquivos

Novos:

- `src/lib/interacoes.ts`: funções `avaliarSenha`, `ehCampoDeTexto` e `copiarTexto`.
- `src/lib/interacoes.test.ts`: testes de `avaliarSenha` executados pelo `npm test`.
- `src/components/MedidorSenha.tsx`: barras e rótulo da força da senha.
- `src/components/BotaoCopiar.tsx`: botão de cópia com resposta temporária.
- `src/components/BotaoTopo.tsx`: botão de voltar ao topo.

Alterados:

- `src/App.tsx`: atalhos de teclado (`/` e `?`) e montagem do `BotaoTopo`.
- `src/screens/Perfil.tsx`: `MedidorSenha` abaixo do campo *Nova senha*.
- `src/screens/DetalheEvento.tsx`: `BotaoCopiar` em cada auto de infração.
- `src/screens/ListaEventos.tsx`: atributo `aria-keyshortcuts="/"` na busca, para leitores de tela.
- `package.json`: script `test`.

## Roteiro para testar manualmente

1. Entre com a conta de demonstração. Em qualquer tela, pressione `?` e confira a mensagem de atalhos.
2. Na lista de alertas, pressione `/`: a busca deve receber o foco. Digite algo e confira o filtro.
3. Abra *Meu perfil*, digite na *Nova senha* os valores `abc`, `abcdefg1`, `Abcdefg1` e `Abcdefg1!`. A força deve passar por Muito fraca, Razoável, Boa e Forte.
4. Abra o alerta **S360-0107** (confirmado). Clique em *Copiar nº* e cole em outro lugar: o número do auto deve aparecer.
5. Na lista de alertas, role a página para baixo. O botão de topo deve aparecer no canto inferior direito e levar de volta ao início.

## Verificação feita

- `npx tsc --noEmit`: sem erros de tipos.
- `npm test`: 8 testes da função de força da senha passando.
- `npm run build`: build de produção concluído.
- Teste no navegador (Chromium, Playwright) dos quatro comportamentos acima, em tela de computador e de celular, sem erros no console e sem rolagem horizontal.

## Observações

- Os dados são fictícios e as decisões ficam só na sessão; recarregar a página restaura a base inicial.
- A tela de detalhe e a lista de alertas já tinham interações antes desta entrega (filtros, decisões, modais, validação de login). Esta entrega acrescenta as quatro acima sem alterar o comportamento delas.
- Como o projeto é em React, a manipulação do DOM feita aqui fica restrita a eventos e a ações pontuais do navegador (foco, seleção, área de transferência). O estado da tela continua sendo controlado pelo React com `useState`.

# Uso de Inteligência Artificial no projeto

## Ferramenta utilizada

- **Claude** (Anthropic), modelo `claude-haiku-5-5`, usado em sessão de programação em 19/11/2026.

## Para que foi usada

1. **Leitura do projeto existente:** análise dos arquivos do front-end (telas, componentes, funções utilitárias e validações já existentes) para identificar o que ainda não tinha interação.
2. **Escolha das interações:** definição de quatro funcionalidades simples, cada uma com resposta visível ao usuário e uso dos conceitos da disciplina (funções, manipulação do DOM, operadores e condicionais).
3. **Escrita do código:** criação dos arquivos listados no README e pequenas alterações em quatro telas existentes.
4. **Testes:** criação de testes para a função de força da senha e de uma verificação automatizada no navegador das interações.
5. **Documentação:** elaboração do README.md e deste AI.md.

## Como o resultado foi conferido

- Verificação de tipos com o TypeScript (`tsc --noEmit`).
- Execução dos testes (`npm test`).
- Build de produção (`npm run build`).
- Teste no navegador em tela de computador e de celular, com conferência das respostas de cada interação e do console.

## O que o grupo deve revisar antes de entregar

- Ler cada função em `src/lib/interacoes.ts` e conseguir explicar o que ela recebe, o que devolve e por que usa cada condicional.
- Confirmar, com a professora ou o professor, se a manipulação do DOM dentro de um projeto React atende ao que foi pedido.
- Verificar os textos em português e ajustar o que não representar o grupo.
- Decidir o nome do projeto: o código exibe "Sentinela 360 Rio" e o enunciado fala em "CitizenTech".

## Limitações

- A IA pode errar e pode sugerir soluções que não são as ensinadas em aula. Por isso, o código deve ser lido e entendido pelo grupo, não apenas copiado.
- Nenhum dado pessoal real foi enviado à ferramenta; o projeto usa dados fictícios.

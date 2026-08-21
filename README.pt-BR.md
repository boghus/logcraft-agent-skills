# logcraft-agent-skills

Skills e boas práticas de logging orientadas para produção para agentes de IA que ajudam a desenvolver, revisar e melhorar software.

🇬🇧 [English](README.md) · 🇪🇸 [Español](README.es.md) · 🇧🇷 **Português (Brasil)**

## O que é o LogCraft?

O LogCraft busca ajudar agentes de IA a tomar decisões melhores sobre logging. Ele não se limita a detectar `console.log`: analisa o contexto de execução, a frequência, a sensibilidade dos dados e o ambiente operacional antes de recomendar mudanças.

O objetivo é produzir logs úteis para diagnosticar problemas em produção sem criar ruído, riscos de segurança ou complexidade desnecessária.

## Regras

Este repositório contém regras de logging orientadas ao contexto para cenários comuns de runtime, CI/CD, verbosidade, volume de logs e segurança de secrets:

- `runtime-aware-logging` — classifica o contexto de execução antes de recomendar logging.
- `log-amplification` — detecta logs dentro de callbacks de alta frequência e caminhos de execução repetitivos.
- `ci-context-rich-output` — exige contexto útil e seguro no output de CI/CD.
- `github-actions-summary` — prioriza resumos concisos do GitHub Actions em vez de output excessivo.
- `verbose-output` — detecta output verbose habilitado permanentemente e recomenda reservá-lo para diagnóstico.
- `secret-safe-output` — evita que secrets e valores sensíveis sejam expostos em logs ou command output.

São **regras orientadas ao contexto**, não mandatos automáticos. Cada regra deve ser avaliada considerando o runtime, o caminho de execução, a sensibilidade dos dados e o objetivo operacional antes de recomendar uma alteração.

## Princípios

- **Contexto antes de quantidade:** um log deve ajudar a entender o que aconteceu e por quê.
- **O runtime importa:** uma recomendação válida para um backend pode estar errada para código executado no navegador ou durante um build.
- **Segurança em primeiro lugar:** nunca registre secrets, credenciais, tokens ou informações sensíveis desnecessárias.
- **Evite ruído:** logs de alta frequência podem prejudicar o desempenho e dificultar o diagnóstico.
- **Observabilidade adequada ao ambiente:** build, aplicação, navegador e CI/CD têm necessidades diferentes.

## Design orientado a contexto

O LogCraft diferencia, entre outros, estes contextos:

```text
Astro build
Astro server / SSR
Browser / client-side
GitHub Actions
Deploy / infraestrutura
```

Isso evita aplicar regras de backend automaticamente a projetos estáticos ou código executado no navegador.

## Exemplo

Um `console.log()` dentro de um `MutationObserver`, de um listener de `scroll` ou de um `setInterval` não deve ser avaliado da mesma forma que um log executado uma única vez durante um build.

O LogCraft busca detectar essa diferença e explicar o risco antes de recomendar uma alteração.

## Testes de validação

As regras incluem contract tests determinísticos em [`tests/`](tests/). Eles contêm fixtures positivos e negativos junto com golden expectations, incluindo reproduções reduzidas de padrões de logging encontrados no MSP Energia.

Execute a validação de contratos sem dependências com:

```bash
node tests/run-tests.mjs
```

O runner executa duas etapas de validação:

1. **Validação de contratos:** verifica a cobertura dos fixtures e a estrutura das expectativas.
2. **Validação do analyzer:** executa o analyzer determinístico integrado quando configurado pelo test suite, ou um analyzer externo por meio de `LOGCRAFT_ANALYZER` quando fornecido.

Os contract tests mantêm o comportamento das regras reproduzível sem acoplar o projeto a um provedor de IA ou parser específico.

Os fixtures também cobrem output sensível do ponto de vista de segurança. Por exemplo, uma expansão explícita de um secret como `$FTP_PASSWORD`, `${FTP_PASSWORD}` ou `process.env.FTP_PASSWORD` que chegue a um sink de saída direta é analisada independentemente do credential flow e pode produzir um finding de severidade alta.

## Status do projeto

As regras atuais estão evoluindo por meio de casos reais. O repositório é usado para validar quais recomendações são generalizáveis e quais precisam ser adaptadas a tecnologias específicas.

## Contribuindo

Novas regras devem explicar:

1. qual problema resolvem;
2. como detectar o problema;
3. qual é o comportamento esperado;
4. quais falsos positivos devem ser evitados;
5. em quais tecnologias ou runtimes são aplicáveis.

As regras devem evitar recomendações universais quando o contexto técnico alterar sua validade.

## Filosofia

> O LogCraft não busca encontrar `console.log`. Busca entender quando, onde e por que um log pode ser útil, perigoso ou apenas ruído.

## Licença

Consulte o arquivo LICENSE do repositório para conhecer os termos de uso e contribuição.

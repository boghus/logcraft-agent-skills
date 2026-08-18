# logcraft-agent-skills

Skills e boas práticas de logging orientadas para produção para agentes de IA que ajudam a desenvolver, revisar e melhorar software.

🇬🇧 [English](README.md) · 🇪🇸 [Español](README.es.md) · 🇧🇷 **Português (Brasil)**

## O que é o LogCraft?

O LogCraft busca ajudar agentes de IA a tomar decisões melhores sobre logging. Ele não se limita a detectar `console.log`: analisa o contexto de execução, a frequência, a sensibilidade dos dados e o ambiente operacional antes de recomendar mudanças.

O objetivo é produzir logs úteis para diagnosticar problemas em produção sem criar ruído, riscos de segurança ou complexidade desnecessária.

## Princípios

- **Contexto antes de quantidade:** um log deve ajudar a entender o que aconteceu e por quê.
- **O runtime importa:** uma recomendação válida para um backend pode estar errada para código executado no navegador ou durante um build.
- **Segurança em primeiro lugar:** nunca registre secrets, credenciais, tokens ou informações sensíveis desnecessárias.
- **Evite ruído:** logs de alta frequência podem prejudicar o desempenho e dificultar o diagnóstico.
- **Observabilidade adequada ao ambiente:** build, aplicação, navegador e CI/CD têm necessidades diferentes.

## Skills

| Skill | Objetivo |
|---|---|
| `runtime-aware-logging` | Determina onde o código é executado antes de recomendar uma estratégia de logging. |
| `log-amplification` | Detecta logs que podem ser executados com frequência excessiva. |
| `ci-context-rich-output` | Melhora o contexto operacional dos logs de CI/CD. |
| `github-actions-summary` | Incentiva resumos claros no GitHub Actions em vez de output desnecessário. |
| `verbose-output` | Detecta modos verbose que geram ruído desnecessário. |
| `secret-safe-output` | Identifica riscos de exposição de secrets no output. |

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

## Status do projeto

As skills atuais são regras candidatas e estão evoluindo por meio de casos reais. O repositório é usado para validar quais recomendações são generalizáveis e quais precisam ser adaptadas a tecnologias específicas.

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

Consulte a licença do repositório para conhecer os termos de uso e contribuição.
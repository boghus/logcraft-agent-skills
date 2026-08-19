# logcraft-agent-skills

Skills y buenas prácticas de logging orientadas a producción para agentes de IA que ayudan a desarrollar, revisar y mejorar software.

🇬🇧 [English](README.md) · 🇪🇸 **Español** · 🇧🇷 [Português (Brasil)](README.pt-BR.md)

## ¿Qué es LogCraft?

LogCraft busca ayudar a los agentes de IA a tomar mejores decisiones sobre logging. No se limita a detectar `console.log`: analiza el contexto de ejecución, la frecuencia, la sensibilidad de los datos y el entorno operativo antes de recomendar cambios.

El objetivo es producir logs útiles para diagnosticar problemas en producción sin crear ruido, riesgos de seguridad ni sobreingeniería.

## Principios

- **Contexto antes que cantidad:** un log debe ayudar a entender qué ocurrió y por qué.
- **El runtime importa:** una recomendación válida para un backend puede ser incorrecta para código que se ejecuta en el navegador o durante un build.
- **Seguridad primero:** nunca se deben registrar secretos, credenciales, tokens ni información sensible innecesaria.
- **Evitar ruido:** los logs de alta frecuencia pueden degradar el rendimiento y dificultar el diagnóstico.
- **Observabilidad apropiada al entorno:** build, aplicación, navegador y CI/CD tienen necesidades diferentes.

## Skills

| Skill | Propósito |
|---|---|
| `runtime-aware-logging` | Determina dónde se ejecuta el código antes de recomendar una estrategia de logging. |
| `log-amplification` | Detecta logs que pueden ejecutarse con una frecuencia excesiva. |
| `ci-context-rich-output` | Mejora el contexto operativo de los logs de CI/CD. |
| `github-actions-summary` | Promueve resúmenes claros en GitHub Actions en lugar de output innecesario. |
| `verbose-output` | Detecta modos verbose que generan ruido innecesario. |
| `secret-safe-output` | Identifica riesgos de exposición de secretos en el output. |

## Diseño orientado al contexto

LogCraft diferencia, entre otros, estos contextos:

```text
Astro build
Astro server / SSR
Browser / client-side
GitHub Actions
Deploy / infraestructura
```

Esto evita aplicar reglas de backend de forma automática a proyectos estáticos o código ejecutado en el navegador.

## Ejemplo

Un `console.log()` dentro de un `MutationObserver`, un listener de `scroll` o un `setInterval` no debería evaluarse igual que un log ejecutado una sola vez durante un build.

LogCraft busca detectar esa diferencia y explicar el riesgo antes de recomendar una modificación.

## Estado del proyecto

Las skills actuales son reglas candidatas y están evolucionando mediante casos reales. El repositorio se utiliza para validar qué recomendaciones son generalizables y cuáles deben adaptarse a tecnologías concretas.

## Contribuir

Las nuevas reglas deben explicar:

1. qué problema resuelven;
2. cómo detectar el problema;
3. cuál es el comportamiento esperado;
4. qué falsos positivos deben evitarse;
5. en qué tecnologías o runtimes son aplicables.

Las reglas deben evitar recomendaciones universales cuando el contexto técnico cambie su validez.

## Filosofía

> LogCraft no busca encontrar `console.log`. Busca entender cuándo, dónde y por qué un log puede ser útil, peligroso o ruido.

## Licencia

Consulta la licencia del repositorio para conocer los términos de uso y contribución.
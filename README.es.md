# logcraft-agent-skills

Skills y buenas prácticas de logging orientadas a producción para agentes de IA que ayudan a desarrollar, revisar y mejorar software.

🇬🇧 [English](README.md) · 🇪🇸 **Español** · 🇧🇷 [Português (Brasil)](README.pt-BR.md)

## ¿Qué es LogCraft?

LogCraft busca ayudar a los agentes de IA a tomar mejores decisiones sobre logging. No se limita a detectar `console.log`: analiza el contexto de ejecución, la frecuencia, la sensibilidad de los datos y el entorno operativo antes de recomendar cambios.

El objetivo es producir logs útiles para diagnosticar problemas en producción sin crear ruido, riesgos de seguridad ni sobreingeniería.

## Reglas

Este repositorio contiene reglas de logging orientadas al contexto para escenarios comunes de runtime, CI/CD, verbosidad, volumen de logs y seguridad de secretos:

- `runtime-aware-logging` — determina el contexto de ejecución antes de recomendar logging.
- `log-amplification` — detecta logs dentro de callbacks de alta frecuencia y rutas de ejecución repetitivas.
- `ci-context-rich-output` — exige contexto útil y seguro en el output de CI/CD.
- `github-actions-summary` — favorece resúmenes concisos de GitHub Actions frente a output excesivo.
- `verbose-output` — detecta output verbose habilitado permanentemente y recomienda reservarlo para diagnóstico.
- `secret-safe-output` — evita que secretos y valores sensibles queden expuestos en logs o command output.

Son **reglas orientadas al contexto**, no mandatos automáticos. Cada regla debe evaluarse considerando el runtime, la ruta de ejecución, la sensibilidad de los datos y el propósito operativo antes de recomendar un cambio.

## Principios

- **Contexto antes que cantidad:** un log debe ayudar a entender qué ocurrió y por qué.
- **El runtime importa:** una recomendación válida para un backend puede ser incorrecta para código que se ejecuta en el navegador o durante un build.
- **Seguridad primero:** nunca se deben registrar secretos, credenciales, tokens ni información sensible innecesaria.
- **Evitar ruido:** los logs de alta frecuencia pueden degradar el rendimiento y dificultar el diagnóstico.
- **Observabilidad apropiada al entorno:** build, aplicación, navegador y CI/CD tienen necesidades diferentes.

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

## Tests de validación

Las reglas incluyen contract tests determinísticos bajo [`tests/`](tests/). Contienen fixtures positivos y negativos junto con golden expectations, incluyendo reproducciones reducidas de patrones de logging encontrados en MSP Energia.

Ejecuta la validación de contratos sin dependencias con:

```bash
node tests/run-tests.mjs
```

El runner realiza dos etapas de validación:

1. **Validación de contratos:** comprueba la cobertura de fixtures y la estructura de las expectativas.
2. **Validación del analyzer:** ejecuta el analyzer determinístico integrado cuando está configurado por el test suite, o un analyzer externo mediante `LOGCRAFT_ANALYZER` cuando se proporciona.

Los contract tests mantienen reproducible el comportamiento de las reglas sin acoplar el proyecto a un proveedor de IA o parser específico.

Los fixtures también cubren output sensible desde el punto de vista de seguridad. Por ejemplo, una expansión explícita de un secreto como `$FTP_PASSWORD`, `${FTP_PASSWORD}` o `process.env.FTP_PASSWORD` que llegue a un sink de salida directa se analiza de forma independiente del credential flow y puede producir un hallazgo de severidad alta.

## Estado del proyecto

Las reglas actuales evolucionan mediante casos reales. El repositorio se utiliza para validar qué recomendaciones son generalizables y cuáles deben adaptarse a tecnologías concretas.

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

Consulta el archivo LICENSE del repositorio para conocer los términos de uso y contribución.

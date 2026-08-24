const startedAt = Date.now()
await syncEmployees()
logger.info({ operation: 'syncEmployees', durationMs: Date.now() - startedAt })

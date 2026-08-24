const startedAt = Date.now()
await syncEmployees()
logger.info(`syncEmployees duration=${Date.now() - startedAt}`)

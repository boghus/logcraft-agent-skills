// Existing logger and context propagation already solve the requested logging need.
MDC.put('requestId', requestId);
logger.info('Processing request');

// Adding OpenTelemetry only to carry the same requestId would be unnecessary here.
// LOGCRAFT_TRANSVERSAL: unnecessary-mechanism

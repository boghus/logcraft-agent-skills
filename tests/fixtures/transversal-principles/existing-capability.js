// Existing capability: the project already propagates requestId through MDC.
MDC.put('requestId', requestId);
logger.info('Processing request');

// The finding is expected because the candidate recommendation would introduce
// a second correlation mechanism instead of using the existing capability.
// LOGCRAFT_TRANSVERSAL: existing-capability

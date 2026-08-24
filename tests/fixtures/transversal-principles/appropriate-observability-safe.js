// The requirement is to preserve the exact failed item for operational diagnosis.
logger.error('Order processing failed', { orderId, error });

// Logging the failure is appropriate; a metric alone would lose the diagnostic detail.
// LOGCRAFT_TRANSVERSAL: appropriate-observability-safe

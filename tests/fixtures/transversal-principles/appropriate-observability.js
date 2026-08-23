// The requirement is to observe p95 latency for a high-volume operation.
for (const item of items) {
  metrics.record('operation.duration', item.durationMs);
}

// Adding one log per item would be the wrong observability mechanism.
// LOGCRAFT_TRANSVERSAL: appropriate-observability

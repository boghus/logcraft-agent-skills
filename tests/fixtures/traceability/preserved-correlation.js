function handle(request) {
  const correlationId = request.correlationId;
  logger.info('Request received', { correlationId });
  downstream.send({ correlationId });
  logger.info('Request completed', { correlationId });
}

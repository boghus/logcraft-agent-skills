function handle(request) {
  const correlationId = request.correlationId;
  logger.info('Request received', { correlationId });
  downstream.send({});
  logger.info('Request completed');
}

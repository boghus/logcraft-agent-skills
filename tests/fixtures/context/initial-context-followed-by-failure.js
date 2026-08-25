function synchronize(user, operationId) {
  logger.info('Synchronization started', {
    userId: user.id,
    operationId,
    outcome: 'started'
  });

  logger.error('Synchronization failed');
}

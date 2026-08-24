function synchronize(user, operationId) {
  logger.info('Synchronization completed', {
    userId: user.id,
    operationId,
    outcome: 'success'
  });
}

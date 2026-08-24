function synchronize(user) {
  logger.info('retry (attempt 2)', { userId: user.id, outcome: 'pending' });
  logger.error('Synchronization failed (see context)', {
    userId: user.id,
    operationId: 'op-1',
    outcome: 'failure'
  });
  console.debug(JSON.stringify(user), user.id);
}
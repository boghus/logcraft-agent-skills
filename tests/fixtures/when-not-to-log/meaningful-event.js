function syncUser(user) {
  const result = externalService.sync(user);
  logger.info('User synchronization completed', {
    userId: user.id,
    outcome: result.status
  });
  return result;
}

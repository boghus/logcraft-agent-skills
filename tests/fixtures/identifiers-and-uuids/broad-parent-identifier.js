function processLicense(license, worker) {
  logger.info('Processing license', {
    workerId: worker.id
  });
  return license;
}

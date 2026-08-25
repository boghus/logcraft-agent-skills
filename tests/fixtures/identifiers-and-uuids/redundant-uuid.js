function processLicense(license) {
  const operationId = crypto.randomUUID();
  logger.info('Processing license', {
    licenseId: license.id,
    operationId
  });
  return license;
}

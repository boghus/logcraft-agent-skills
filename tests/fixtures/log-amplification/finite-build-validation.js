export function validateBuildItems(items, logger) {
  const finiteItems = Array.from(items);

  for (const item of finiteItems) {
    if (!item.id) {
      logger.error('Missing item id')
    }
  }
}

function processPayment(payment) {
  logger.info('Entering processPayment');
  logger.info('Payment object received');
  paymentService.process(payment);
  logger.info('Processing payment');
}

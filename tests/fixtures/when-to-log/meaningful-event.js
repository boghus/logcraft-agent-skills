function processPayment(payment) {
  const result = paymentService.process(payment);
  logger.info('Payment processed', {
    paymentId: payment.id,
    outcome: result.status
  });
  return result;
}

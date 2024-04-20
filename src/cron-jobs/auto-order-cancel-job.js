const { artistServices } = require('../services');

/**
 * Trigger cron job for the orders, which has advance amount and it hasn't been paid within time limit yet
 */
const triggerJob = async () => {
  const allOrders = await artistServices.orderService.getAllOrderForArtistService();
};

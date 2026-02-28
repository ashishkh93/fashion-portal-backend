const express = require('express');
const authRoutes = require('./auth.route');
const customerInfoRoutes = require('./customer-info.route');
const orderRoutes = require('./order.route');
const paymentRoutes = require('./payment.route');
const reviewRoutes = require('./review.route');
const getArtistsRoutes = require('./get-artists.route');
const servicesRoutes = require('./services.route');
const addressRoutes = require('./address.route');
const favoriteRoutes = require('./favorite.route');
const notificationRoutes = require('./notification.route');
const analyticsRoutes = require('./analytics.route');

const router = express.Router();

const defaultUserRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/:customerId/info',
    route: customerInfoRoutes,
  },
  {
    path: '/:customerId/order',
    route: orderRoutes,
  },
  {
    path: '/:customerId/payment',
    route: paymentRoutes,
  },
  {
    path: '/:customerId/review',
    route: reviewRoutes,
  },
  {
    path: '/:customerId/get-artists',
    route: getArtistsRoutes,
  },
  {
    path: '/:customerId/services',
    route: servicesRoutes,
  },
  {
    path: '/:customerId/favorite',
    route: favoriteRoutes,
  },
  {
    path: '/:customerId/address',
    route: addressRoutes,
  },
  {
    path: '/:customerId/notification',
    route: notificationRoutes,
  },
  {
    path: '/:customerId/analytics',
    route: analyticsRoutes,
  },
];

defaultUserRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = { customerRoutes: router };

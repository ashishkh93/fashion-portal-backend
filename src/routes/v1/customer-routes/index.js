const express = require('express');
const authRoutes = require('./auth.route');
const customerInfoRoutes = require('./customer-info.route');
const orderRoutes = require('./order.route');
const paymentRoutes = require('./payment.route');
const reviewRoutes = require('./review.route');
const getArtistsRoutes = require('./get-artists.route');
const servicesRoutes = require('./services.route');

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
];

defaultUserRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = { customerRoutes: router };

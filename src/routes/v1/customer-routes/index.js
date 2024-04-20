const express = require('express');
const authRoutes = require('./auth.route');
const customerInfoRoutes = require('./customer-info.route');
const orderRoutes = require('./order.route');
const paymentRoutes = require('./payment.route');

const router = express.Router();

const defaultUserRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/info',
    route: customerInfoRoutes,
  },
  {
    path: '/order',
    route: orderRoutes,
  },
  {
    path: '/payment',
    route: paymentRoutes,
  },
];

defaultUserRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = { customerRoutes: router };

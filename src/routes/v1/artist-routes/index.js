const express = require('express');
const authRoutes = require('./auth.route');
const artistInfoRoutes = require('./artist-info.route');
const uploadRoutes = require('./upload.route');
const artRoutes = require('./art.route');
const orderRoutes = require('./order.route');
const vacationRoutes = require('./vacation.route');
const verificationRoutes = require('./verification.route');
const bankingRoutes = require('./banking.route');
const notifiactionRoutes = require('./notification.route');
const analyticsRoutes = require('./analytics.route');
const paymentRoutes = require('./payment.route');

const router = express.Router();

const defaultUserRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/:artistId/info',
    route: artistInfoRoutes,
  },
  {
    path: '/:artistId/upload',
    route: uploadRoutes,
  },
  {
    path: '/:artistId/art',
    route: artRoutes,
  },
  {
    path: '/:artistId/order',
    route: orderRoutes,
  },
  {
    path: '/:artistId/vacation',
    route: vacationRoutes,
  },
  {
    path: '/:artistId/verification',
    route: verificationRoutes,
  },
  {
    path: '/:artistId/banking',
    route: bankingRoutes,
  },
  {
    path: '/:artistId/notification',
    route: notifiactionRoutes,
  },
  {
    path: '/:artistId/analytics',
    route: analyticsRoutes,
  },
  {
    path: '/:artistId/payment',
    route: paymentRoutes,
  },
];

defaultUserRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = { artistRoutes: router };

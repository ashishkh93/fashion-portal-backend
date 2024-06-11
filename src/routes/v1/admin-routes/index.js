const express = require('express');
const authRoutes = require('./auth.route');
const serviceRoutes = require('./service.route');
const categoryRoutes = require('./category.route');
const infoRoutes = require('./get-infos.route');
const verifyStatusRoutes = require('./verifyStatus.route');
const webhookRoute = require('./webhook.route');
const beneficiaryRoutes = require('./beneficiary.route');
const payoutRoutes = require('./payout.route');
const refundRoutes = require('./refund.route');

const router = express.Router();

const defaultUserRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/services',
    route: serviceRoutes,
  },
  {
    path: '/category',
    route: categoryRoutes,
  },
  {
    path: '/info',
    route: infoRoutes,
  },
  {
    path: '/verify',
    route: verifyStatusRoutes,
  },
  {
    path: '/bene',
    route: beneficiaryRoutes,
  },
  {
    path: '/webhook',
    route: webhookRoute,
  },
  {
    path: '/payout',
    route: payoutRoutes,
  },
  {
    path: '/refund',
    route: refundRoutes,
  },
];

defaultUserRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = { adminRoutes: router };

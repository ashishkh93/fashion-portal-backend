const express = require('express');
const authRoutes = require('./auth.route');
const serviceRoutes = require('./service.route');
const categoryRoutes = require('./category.route');
const infoRoutes = require('./get-infos.route');
const verifyStatusRoutes = require('./verify-status.route');
const webhookRoute = require('./webhook.route');
const beneficiaryRoutes = require('./beneficiary.route');
const payoutRoutes = require('./payout.route');
const refundRoutes = require('./refund.route');
const reviewRoutes = require('./review.route');
const orderRoutes = require('./order.route');
const transactionsRoutes = require('./transactions.route');

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
    path: '/:adminId/infos',
    route: infoRoutes,
  },
  {
    path: '/:adminId/verify',
    route: verifyStatusRoutes,
  },
  {
    path: '/:adminId/bene',
    route: beneficiaryRoutes,
  },
  {
    path: '/webhook',
    route: webhookRoute,
  },
  {
    path: '/:adminId/payout',
    route: payoutRoutes,
  },
  {
    path: '/:adminId/refund',
    route: refundRoutes,
  },
  {
    path: '/:adminId/reviews',
    route: reviewRoutes,
  },
  {
    path: '/:adminId/orders',
    route: orderRoutes,
  },
  {
    path: '/:adminId/transactions',
    route: transactionsRoutes,
  },
];

defaultUserRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = { adminRoutes: router };

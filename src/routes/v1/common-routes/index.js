const express = require('express');
const serviceRoutes = require('./services.route');
const catRoutes = require('./cat.route');
const testNotificationRoutes = require('./test-notification.route');

const router = express.Router();

const defaultCommonRoutes = [
  {
    path: '/services',
    route: serviceRoutes,
  },
  {
    path: '/categories/:serviceId',
    route: catRoutes,
  },
  {
    path: '/test-notification',
    route: testNotificationRoutes,
  },
];

defaultCommonRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = { commonRoutes: router };

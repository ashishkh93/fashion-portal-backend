const express = require('express');
const serviceRoutes = require('./services.route');

const router = express.Router();

const defaultUserRoutes = [
  {
    path: '/services',
    route: serviceRoutes,
  },
];

defaultUserRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = { commonRoutes: router };

const express = require('express');
const authRoutes = require('./auth.route');
const serviceRoutes = require('./service.route');
const categoryRoutes = require('./category.route');
const infoRoutes = require('./getInfos.route');
const verifyStatusRoutes = require('./verifyStatus.route');

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
];

defaultUserRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = { adminRoutes: router };

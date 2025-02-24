const express = require('express');
const { customerRoutes } = require('./customer-routes');
const { adminRoutes } = require('./admin-routes');
const { artistRoutes } = require('./artist-routes');
const { commonRoutes } = require('./common-routes');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/super-admin',
    route: adminRoutes,
  },
  {
    path: '/artist',
    route: artistRoutes,
  },
  {
    path: '/customer',
    route: customerRoutes,
  },
  {
    path: '/common',
    route: commonRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;

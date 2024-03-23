const express = require('express');
const { userRoutes } = require('./userRoutes');
const { adminRoutes } = require('./adminRoutes');
const { artistRoutes } = require('./artistRoutes');

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
    path: '/user',
    route: userRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;

const express = require('express');
const authRoutes = require('./auth.route');
const artistInfoRoutes = require('./artist-info.route');
const artRoutes = require('./art.route');
const orderRoutes = require('./order.route');

const router = express.Router();

const defaultUserRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/info',
    route: artistInfoRoutes,
  },
  {
    path: '/art',
    route: artRoutes,
  },
  {
    path: '/order',
    route: orderRoutes,
  },
];

defaultUserRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = { artistRoutes: router };

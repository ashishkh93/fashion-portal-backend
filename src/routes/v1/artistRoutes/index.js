const express = require('express');
const authRoutes = require('./auth.route');
const artistInfoRoutes = require('./artistInfo.route');
const artRoutes = require('./art.route');

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
];

defaultUserRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = { artistRoutes: router };

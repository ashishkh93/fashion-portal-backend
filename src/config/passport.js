const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid token type');
    }
    const user = await User.findByPk(payload.sub, {
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
    });

    if (payload?.v !== user.tokenVersion) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Blacklisted token');
    }

    if (!user) {
      return done(null, false);
    }

    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};

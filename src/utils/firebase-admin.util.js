const httpStatus = require('http-status');
const { FirebaseInstance } = require('../firebase-admin/admin');
const ApiError = require('./ApiError');
const logger = require('../config/logger');

class FirebaseAdminUtil {
  constructor() {
    this.fb_admin = FirebaseInstance.getAdmin();
  }
  async createUser(phoneNumber) {
    /**
     * Create user anonymously in firebase
     */
    try {
      let email = phoneNumber + '@gmail.com';
      const newUser = await this.fb_admin.auth().createUser({ email, password: phoneNumber });
      if (newUser) {
        return newUser;
      }
    } catch (error) {
      throw new ApiError(
        error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'Something went wrong, Please try again'
      );
    }
  }

  async getUsers(phoneNumber) {
    /**
     * Create user anonymously in firebase
     */
    try {
      let email = phoneNumber + '@gmail.com';
      const allUsers = await this.fb_admin.auth().getUsers([{ email }]);
      if (allUsers) {
        return allUsers;
      }
    } catch (error) {
      throw new ApiError(
        error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'Something went wrong, Please try again'
      );
    }
  }

  async checkUserAndCreate(phoneNumber) {
    const firebaseUser = await this.getUsers(phoneNumber);

    if (firebaseUser.users.length === 0) {
      const newUser = await this.createUser(phoneNumber);
      if (newUser) {
        const newUserBody = { uid: newUser.uid, phone: newUser.phoneNumber };
        logger.info('New user created in firebase with ' + JSON.stringify(newUserBody));
      }
    }
  }
}

module.exports = { FirebaseAdminUtil };

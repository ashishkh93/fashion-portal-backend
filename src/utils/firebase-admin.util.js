const httpStatus = require('http-status');
const { FirebaseInstance } = require('../firebase-admin/admin');
const ApiError = require('./ApiError');

class FirebaseAdminUtil {
  constructor() {
    this.fb_admin = FirebaseInstance.getAdmin();
  }
  async createUser(phoneNumber) {
    /**
     * Create user anonymously in firebase
     */
    try {
      let phoneWithPrefix = '+91' + phoneNumber;
      const newUser = await this.fb_admin.auth().createUser({ phoneNumber: phoneWithPrefix });
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
      let phoneWithPrefix = '+91' + phoneNumber;
      const allUsers = await this.fb_admin.auth().getUsers([{ phoneNumber: phoneWithPrefix }]);
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
}

module.exports = { FirebaseAdminUtil };

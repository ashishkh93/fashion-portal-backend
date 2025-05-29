const httpStatus = require('http-status');
const { FirebaseInstance } = require('../firebase-admin/admin');
const ApiError = require('./ApiError');
const logger = require('../config/logger');

class FirebaseAdminUtil {
  constructor() {
    this.fb_admin = FirebaseInstance.getAdmin();
  }
  async createUser(phoneNumber, userPrefix) {
    /**
     * Create user anonymously in firebase
     */
    try {
      let email = phoneNumber + userPrefix + '@gmail.com';
      const newUser = await this.fb_admin.auth().createUser({ email, password: phoneNumber });
      if (newUser) {
        const newUserBody = { uid: newUser.uid, phone: newUser.phoneNumber };
        logger.info('New user created in firebase with ' + JSON.stringify(newUserBody));
        return newUser;
      }
    } catch (error) {
      throw new ApiError(
        error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'Something went wrong, Please try again'
      );
    }
  }

  async getFirebaseUser(phoneNumber, userPrefix) {
    /**
     * Create user anonymously in firebase
     */
    try {
      let email = phoneNumber + userPrefix + '@gmail.com';
      const allUsers = await this.fb_admin.auth().getUsers([{ email }]);
      if (allUsers) {
        return allUsers.users[0];
      }
    } catch (error) {
      throw new ApiError(
        error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'Something went wrong, Please try again'
      );
    }
  }

  async deleteUser(uid) {
    /**
     * Delete user from Firebase
     */
    try {
      const deletedUser = await this.fb_admin.auth().deleteUser(uid);
      logger.info('User deleted in firebase with UID: ' + uid);
      return deletedUser;
    } catch (error) {
      throw new ApiError(
        error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        error.message || 'Something went wrong, Please try again'
      );
    }
  }

  async upsertUserByUID(uid, userData) {
    if (!uid || typeof userData !== 'object') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid UID or userData');
    }

    const db = this.fb_admin.firestore();

    try {
      const userRef = db.collection('Users').doc(uid);
      await userRef.set(userData, { merge: true }); // create or update
      return { success: true, message: 'User document upserted successfully in Firebase.' };
    } catch (err) {
      throw new ApiError(
        err.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        err.message || 'Something went wrong, Please try again'
      );
    }
  }
}

module.exports = { FirebaseAdminUtil };

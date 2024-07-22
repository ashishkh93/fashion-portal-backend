/* eslint-disable max-len */
const admin = require('firebase-admin');
const config = require('../config/config');
const serviceAccountKeyBase64 = config.firebase.serviceAccountKey;

const serviceAccount = JSON.parse(Buffer.from(serviceAccountKeyBase64, 'base64').toString());

class FirebaseAdmin {
  constructor() {
    /**
     * Create a firebase instance only once
     */
    if (!FirebaseAdmin.instance) {
      this.admin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      FirebaseAdmin.instance = this;
    }

    return FirebaseAdmin.instance;
  }

  getAdmin() {
    return this.admin;
  }
}

const instance = new FirebaseAdmin();
Object.freeze(instance);

module.exports = { FirebaseInstance: instance };

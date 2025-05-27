const { FirebaseAdminUtil } = require('../../utils/firebase-admin.util');

exports.updateFirebaseUserStatus = (firebase_uid, status) => {
  const fbUtil = new FirebaseAdminUtil();
  if (firebase_uid) {
    fbUtil.upsertUserByUID(firebase_uid, {
      status,
    });
  }
};

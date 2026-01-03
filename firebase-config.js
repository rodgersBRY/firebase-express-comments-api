const admin = require("firebase-admin");

const serviceAccount = "./sung-jinwoo-firebase-adminsdk-fbsvc-fa9fb34acb.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = { db: admin.firestore(), admin };

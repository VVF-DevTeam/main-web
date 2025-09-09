import admin from 'firebase-admin'

if (!admin.apps.length) {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY!

  const serviceAccount = JSON.parse(serviceAccountString)

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

export const firebaseAdmin = admin

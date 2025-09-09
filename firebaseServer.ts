import admin from 'firebase-admin'

const serviceAccountString = process.env
  .FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY as string

if (!serviceAccountString)
  throw new Error('Missing environment variables for firebase backend')

const serviceAccount = JSON.parse(serviceAccountString)

let firebaseAdmin: admin.app.App

if (!admin.apps.length) {
  firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
} else {
  firebaseAdmin = admin.app()
}

export { firebaseAdmin }

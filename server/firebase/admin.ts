import admin from 'firebase-admin';

type ServiceAccountLike = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function getServiceAccountFromEnv(): ServiceAccountLike {
  // Prefer a single JSON blob env var.
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      return JSON.parse(json) as ServiceAccountLike;
    } catch (e) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
    }
  }

  // Fallback to split env vars.
  const project_id = process.env.FIREBASE_PROJECT_ID;
  const client_email = process.env.FIREBASE_CLIENT_EMAIL;
  let private_key = process.env.FIREBASE_PRIVATE_KEY;
  if (private_key) {
    // Vercel often stores multiline keys with escaped newlines.
    private_key = private_key.replace(/\\n/g, '\n');
  }

  return { project_id, client_email, private_key };
}

export function getAdminApp() {
  if (admin.apps.length) return admin.app();

  const sa = getServiceAccountFromEnv();
  if (!sa.project_id || !sa.client_email || !sa.private_key) {
    throw new Error(
      'Missing Firebase Admin credentials. Provide FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key,
    }),
  });

  return admin.app();
}

export function getAdminDb() {
  getAdminApp();
  return admin.firestore();
}


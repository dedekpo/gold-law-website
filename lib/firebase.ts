import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Typed through firebase-admin rather than @google-cloud/storage directly, which
// is only a transitive dependency and may not be hoisted under strict installs.
type Bucket = ReturnType<ReturnType<typeof getStorage>["bucket"]>;

/**
 * Server-only Firebase Admin bootstrap, shared with the backoffice app (same
 * project, same bucket). The website only ever touches the client-submission
 * collections and the `submissions/` prefix of the bucket.
 *
 * Credentials: FIREBASE_SERVICE_ACCOUNT holds the full service-account JSON.
 * FIREBASE_STORAGE_BUCKET overrides the default `<project>.firebasestorage.app`.
 */

type ServiceAccountJson = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function loadServiceAccount(): ServiceAccountJson {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) {
    throw new Error(
      "Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT to the service-account JSON.",
    );
  }
  let parsed: ServiceAccountJson;
  try {
    parsed = JSON.parse(raw) as ServiceAccountJson;
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON.");
  }
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is missing project_id / client_email / private_key.",
    );
  }
  return parsed;
}

let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;

function app(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps()[0];
  if (existing) {
    cachedApp = existing;
    return existing;
  }
  const sa = loadServiceAccount();
  cachedApp = initializeApp({
    credential: cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key,
    }),
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ?? `${sa.project_id}.firebasestorage.app`,
  });
  return cachedApp;
}

/** The shared Firestore instance (undefined-tolerant, like the backoffice). */
export function db(): Firestore {
  if (cachedDb) return cachedDb;
  // Survive dev HMR: module state resets but the Firebase app persists, and
  // calling settings() twice on the same Firestore instance throws.
  const g = globalThis as { __websiteDb?: Firestore };
  if (g.__websiteDb) {
    cachedDb = g.__websiteDb;
    return cachedDb;
  }
  cachedDb = getFirestore(app());
  try {
    cachedDb.settings({ ignoreUndefinedProperties: true });
  } catch {
    // Already configured by a previous module instance.
  }
  g.__websiteDb = cachedDb;
  return cachedDb;
}

/** The default Storage bucket — client submissions live under `submissions/`. */
export function bucket(): Bucket {
  return getStorage(app()).bucket();
}

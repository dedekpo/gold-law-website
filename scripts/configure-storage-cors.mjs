#!/usr/bin/env node
/**
 * One-time bucket setup for direct browser uploads (see lib/submissions/storage.ts).
 *
 * Browsers PUT submission files straight to Cloud Storage with a signed URL,
 * which only works if the bucket answers the CORS preflight for the site's
 * origin and allows the headers the signature covers. This adds (or refreshes)
 * that rule while leaving any other CORS entries on the bucket untouched.
 *
 * Usage (reads FIREBASE_SERVICE_ACCOUNT / FIREBASE_STORAGE_BUCKET from .env):
 *   node --env-file=.env scripts/configure-storage-cors.mjs --dry-run
 *   node --env-file=.env scripts/configure-storage-cors.mjs
 *   SUBMISSIONS_CORS_ORIGINS="https://a.com,https://b.com" node --env-file=.env scripts/configure-storage-cors.mjs
 */
import { cert, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const DEFAULT_ORIGINS = [
  "https://chrisgoldlaw.com",
  "https://www.chrisgoldlaw.com",
  "http://localhost:3000",
];

// Every header the browser sends on the signed PUT. They must be allowed in
// the preflight or the upload never leaves the browser.
const REQUEST_HEADERS = [
  "Content-Type",
  "x-goog-content-length-range",
  "x-goog-meta-contact-id",
  "x-goog-meta-file-id",
  "x-goog-meta-original-name",
  "x-goog-meta-client-last-modified",
  "x-goog-meta-capture-value",
  "x-goog-meta-capture-source",
];

const dryRun = process.argv.includes("--dry-run");
const origins = (process.env.SUBMISSIONS_CORS_ORIGINS ?? DEFAULT_ORIGINS.join(","))
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
if (!raw) {
  console.error("FIREBASE_SERVICE_ACCOUNT is not set (run with --env-file=.env).");
  process.exit(1);
}
const sa = JSON.parse(raw);
const app = initializeApp({
  credential: cert({
    projectId: sa.project_id,
    clientEmail: sa.client_email,
    privateKey: sa.private_key,
  }),
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET ?? `${sa.project_id}.firebasestorage.app`,
});
const bucket = getStorage(app).bucket();

const [exists] = await bucket.exists();
if (!exists) {
  console.error(`Bucket ${bucket.name} does not exist.`);
  process.exit(1);
}
const [meta] = await bucket.getMetadata();
const current = Array.isArray(meta.cors) ? meta.cors : [];
console.log(`Bucket: ${bucket.name}`);
console.log("Current CORS:", JSON.stringify(current, null, 2));

const ours = {
  origin: origins,
  method: ["PUT", "GET", "HEAD"],
  responseHeader: REQUEST_HEADERS,
  maxAgeSeconds: 3600,
};
// Replace any earlier version of our rule — recognised by the submission-specific
// header it allows — and keep every other rule (shared origins are not enough:
// another app may legitimately list localhost too).
const MARKER = "x-goog-meta-capture-source";
const others = current.filter(
  (rule) => !(rule.responseHeader ?? []).includes(MARKER),
);
const next = [...others, ours];
console.log("Proposed CORS:", JSON.stringify(next, null, 2));

if (dryRun) {
  console.log("Dry run — nothing changed.");
  process.exit(0);
}
await bucket.setCorsConfiguration(next);
console.log("CORS updated.");
process.exit(0);

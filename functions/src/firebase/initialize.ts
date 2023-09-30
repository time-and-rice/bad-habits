import { App, getApps, initializeApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2/options";

export let app: App;
export let auth: Auth;
export let db: Firestore;

if (getApps().length == 0) {
  app = initializeApp();
  auth = getAuth();
  db = getFirestore();
  db.settings({ ignoreUndefinedProperties: true });
  console.log("firebase-admin initialized.");
}

setGlobalOptions({ region: "asia-northeast1" });

export const onRequestConfig = {
  cors: true,
  ingressSettings: "ALLOW_ALL" as const,
};

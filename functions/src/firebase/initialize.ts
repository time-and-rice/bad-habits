import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2/options";

const app = initializeApp();

const auth = getAuth(app);
const db = getFirestore(app);

db.settings({ ignoreUndefinedProperties: true });

setGlobalOptions({ region: "asia-northeast1" });

export { auth, db };

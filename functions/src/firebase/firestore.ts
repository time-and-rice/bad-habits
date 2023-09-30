import { CollectionReference } from "firebase-admin/firestore";

import { db } from "./initialize";
import { UserData } from "./types";

export const usersRef = () =>
  db.collection("users") as CollectionReference<UserData>;

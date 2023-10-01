import { CollectionReference } from "firebase-admin/firestore";

import { db } from "./initialize";
import { UserData } from "./types";

export const usersRef = () =>
  db.collection("users") as CollectionReference<UserData>;

export const badHabitsRef = (userId: string) =>
  usersRef().doc(userId).collection("badHabits");

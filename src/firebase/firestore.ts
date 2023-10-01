import {
  collection,
  CollectionReference,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
} from "firebase/firestore";

import { db } from "./initialize";

/**
 * /users
 * /users/userId/batHabits
 * /users/userId/batHabits/badHabitId/badHabitActionRecords
 */

/**
 * Types
 */

export type WithId<T> = T & { id: string };

export type UserData = {
  createdAt: Timestamp;
};

export type BadHabitData = {
  name: string;
  description: string;
  pros: string;
  cons: string;
  alternativeActions: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
};

export type BadHabitActionRecordData = {
  type: "urge" | "alternative" | "bad";
  createdAt: Timestamp;
  userId: string;
  badHabitId: string;
};

/**
 * Collections
 */

export const usersRef = () =>
  collection(db, "users") as CollectionReference<UserData>;

export const badHabitsRef = (userId: string) =>
  collection(
    usersRef(),
    userId,
    "badHabits",
  ) as CollectionReference<BadHabitData>;

export const badHabitActionRecordsRef = (userId: string, badHabitId: string) =>
  collection(
    badHabitsRef(userId),
    badHabitId,
    "batHabitActionRecords",
  ) as CollectionReference<BadHabitActionRecordData>;

/**
 * Utils
 */

export function mapDoc<T>(snap: DocumentSnapshot<T>) {
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return undefined;
}

export function mapDocs<T>(snap: QuerySnapshot<T>) {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

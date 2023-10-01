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
 * /users/userId/batHabits/badHabitId/urgeRecords
 * /users/userId/batHabits/badHabitId/alternativeActionRecords
 * /users/userId/batHabits/badHabitId/badHabitRecords
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

export type UrgeRecordData = {
  createdAt: Timestamp;
  userId: string;
  badHabitId: string;
};

export type AlternativeActionRecordData = {
  createdAt: Timestamp;
  userId: string;
  badHabitId: string;
};

export type BadHabitRecordData = {
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

export const urgeRecordsRef = (userId: string, badHabitId: string) =>
  collection(
    badHabitsRef(userId),
    badHabitId,
    "urgeRecords",
  ) as CollectionReference<UrgeRecordData>;

export const alternativeActionRecordsRef = (
  userId: string,
  badHabitId: string,
) =>
  collection(
    badHabitsRef(userId),
    badHabitId,
    "alternativeActionRecords",
  ) as CollectionReference<AlternativeActionRecordData>;

export const badHabitRecordsRef = (userId: string, badHabitId: string) =>
  collection(
    badHabitsRef(userId),
    badHabitId,
    "badHabitRecords",
  ) as CollectionReference<BadHabitRecordData>;

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

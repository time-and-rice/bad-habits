import {
  collection,
  CollectionReference,
  DocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";

import { db } from "./initialize";
import {
  AlternativeActionRecordData,
  BadHabitData,
  BadHabitRecordData,
  UrgeRecordData,
  UserData,
} from "./types";

/**
 * /users
 * /users/userId/batHabits
 * /users/userId/batHabits/badHabitId/urgeRecords
 * /users/userId/batHabits/badHabitId/alternativeActionRecords
 * /users/userId/batHabits/badHabitId/badHabitRecords
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
    "alternativeRecords",
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

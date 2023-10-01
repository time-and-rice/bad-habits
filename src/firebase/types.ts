import { Timestamp } from "firebase/firestore";

export type UserData = {
  createdAt: Timestamp;
};

export type BadHabitData = {
  name: string;
  description: string;
  pros: string;
  cons: string;
  alternativeActions: string[];
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

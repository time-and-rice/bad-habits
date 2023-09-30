import { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  createdAt: Timestamp;
};

export type BadHabit = {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
};

export type UrgeRecord = {
  id: string;
  createdAt: Timestamp;
  userId: string;
  badHabitId: string;
};

export type AlternativeActionRecord = {
  id: string;
  createdAt: Timestamp;
  userId: string;
  badHabitId: string;
};

export type BadHabitRecord = {
  id: string;
  createdAt: Timestamp;
  userId: string;
  badHabitId: string;
};

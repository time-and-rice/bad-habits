import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import invariant from "tiny-invariant";

import { Fallback } from "~/components/fallback";
import {
  alternativeActionRecordsRef,
  BadHabitData,
  badHabitRecordsRef,
  badHabitsRef,
  mapDoc,
  mapDocs,
  urgeRecordsRef,
  WithId,
} from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

export default function BadHabit() {
  const { authUser } = useAuth();
  const { badHabitId } = useParams();
  invariant(badHabitId);

  const {
    data: badHabit,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => {
      return getDoc(doc(badHabitsRef(authUser.uid), badHabitId)).then(mapDoc);
    },
    queryKey: ["me", "bad-habits", badHabitId],
  });

  return (
    <Fallback loading={isLoading} error={error as Error}>
      {badHabit && <BadHabitView badHabit={badHabit} />}
    </Fallback>
  );
}

function BadHabitView({ badHabit }: { badHabit: WithId<BadHabitData> }) {
  return (
    <div className="space-y-8">
      <BadHabitDetail badHabit={badHabit} />
      <div className="divider" />

      <BadHabitRecord badHabit={badHabit} />
      <div className="divider" />

      {/* Records View */}
      <BadHabitRecordsView badHabit={badHabit} />
      <div className="divider" />
    </div>
  );
}

function BadHabitDetail({ badHabit }: { badHabit: WithId<BadHabitData> }) {
  return (
    <div className="space-y-4">
      <div className="font-bold text-center">{badHabit.name}</div>

      {badHabit.description && (
        <div className="whitespace-pre-wrap">{badHabit.description}</div>
      )}

      <div>
        <div className="font-semibold">Pros</div>
        <div className="whitespace-pre-wrap">{badHabit.pros}</div>
      </div>

      <div>
        <div className="font-semibold">Cons</div>
        <div className="whitespace-pre-wrap">{badHabit.cons}</div>
      </div>

      <div>
        <div className="font-semibold">Alternative actions</div>
        <div className="whitespace-pre-wrap">{badHabit.alternativeActions}</div>
      </div>
    </div>
  );
}

function BadHabitRecord({ badHabit }: { badHabit: WithId<BadHabitData> }) {
  const { authUser } = useAuth();
  const client = useQueryClient();

  const createUrgeRecord = useMutation({
    mutationFn: async () => {
      await addDoc(urgeRecordsRef(authUser.uid, badHabit.id), {
        createdAt: Timestamp.now(),
        userId: authUser.uid,
        badHabitId: badHabit.id,
      });
    },
    onSuccess: () => {
      toast.success("Done urged.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        badHabit.id,
        "urge-records",
      ]);
    },
  });

  const createAlternativeActionRecord = useMutation({
    mutationFn: async () => {
      await addDoc(alternativeActionRecordsRef(authUser.uid, badHabit.id), {
        createdAt: Timestamp.now(),
        userId: authUser.uid,
        badHabitId: badHabit.id,
      });
    },
    onSuccess: () => {
      toast.success("Done alternative action.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        badHabit.id,
        "alternative-action-records",
      ]);
    },
  });

  const createBadHabitRecord = useMutation({
    mutationFn: async () => {
      await addDoc(badHabitRecordsRef(authUser.uid, badHabit.id), {
        createdAt: Timestamp.now(),
        userId: authUser.uid,
        badHabitId: badHabit.id,
      });
    },
    onSuccess: () => {
      toast.success("Done bad habit.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        badHabit.id,
        "bad-habit-records",
      ]);
    },
  });

  async function onBad() {
    if (!window.confirm("Are you sure to do bad habit?")) return;
    await createBadHabitRecord.mutate();
  }

  return (
    <div className="space-y-6">
      <div className="font-bold">Record</div>

      <div className="flex justify-around">
        <div
          className="flex flex-col items-center"
          onClick={() => createUrgeRecord.mutate()}
        >
          <button className="btn btn-circle w-20 h-20 btn-warning" />
          <div className="font-semibold">Urge</div>
        </div>

        <div className="flex flex-col items-center">
          <button
            className="btn btn-circle w-20 h-20 btn-success"
            onClick={() => createAlternativeActionRecord.mutate()}
          />
          <div className="font-semibold">Alternative</div>
        </div>

        <div className="flex flex-col items-center">
          <button
            className="btn btn-circle w-20 h-20 btn-error"
            onClick={onBad}
          />
          <div className="font-semibold">Bad</div>
        </div>
      </div>
    </div>
  );
}

function BadHabitRecordsView({ badHabit }: { badHabit: WithId<BadHabitData> }) {
  const { authUser } = useAuth();

  const {
    data: urgeRecords,
    isLoading: urgeRecordsLoading,
    error: urgeRecordsError,
  } = useQuery({
    queryFn: () => {
      return getDocs(
        query(
          urgeRecordsRef(authUser.uid, badHabit.id),
          orderBy("createdAt", "desc"),
          limit(3),
        ),
      ).then(mapDocs);
    },
    queryKey: ["me", "bad-habits", badHabit.id, "urge-records"],
  });

  const {
    data: alternativeActionRecords,
    isLoading: alternativeActionRecordsLoading,
    error: alternativeActionRecordsError,
  } = useQuery({
    queryFn: () => {
      return getDocs(
        query(
          alternativeActionRecordsRef(authUser.uid, badHabit.id),
          orderBy("createdAt", "desc"),
          limit(3),
        ),
      ).then(mapDocs);
    },
    queryKey: ["me", "bad-habits", badHabit.id, "alternative-action-records"],
  });

  const {
    data: badHabitRecords,
    isLoading: badHabitRecordsLoading,
    error: badHabitRecordsError,
  } = useQuery({
    queryFn: () => {
      return getDocs(
        query(
          badHabitRecordsRef(authUser.uid, badHabit.id),
          orderBy("createdAt", "desc"),
          limit(3),
        ),
      ).then(mapDocs);
    },
    queryKey: ["me", "bad-habits", badHabit.id, "bad-habit-records"],
  });

  return (
    <div className="space-y-6">
      <div className="font-bold">Records view</div>

      <Fallback loading={urgeRecordsLoading} error={urgeRecordsError as Error}>
        <div>
          <div>Urge records</div>
          {urgeRecords?.map((ur) => (
            <div key={ur.id}>{ur.createdAt.toDate().toISOString()}</div>
          ))}
        </div>
      </Fallback>

      <Fallback
        loading={alternativeActionRecordsLoading}
        error={alternativeActionRecordsError as Error}
      >
        <div>
          <div>Alternative action records</div>
          {alternativeActionRecords?.map((aar) => (
            <div key={aar.id}>{aar.createdAt.toDate().toISOString()}</div>
          ))}
        </div>
      </Fallback>

      <Fallback
        loading={badHabitRecordsLoading}
        error={badHabitRecordsError as Error}
      >
        <div>
          <div>Bad habit records</div>
          {badHabitRecords?.map((bhr) => (
            <div key={bhr.id}>{bhr.createdAt.toDate().toISOString()}</div>
          ))}
        </div>
      </Fallback>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfDay, subDays } from "date-fns";
import {
  differenceInDays,
  eachDayOfInterval,
  format,
  startOfDay,
  sub,
} from "date-fns/esm";
import {
  addDoc,
  deleteDoc,
  doc,
  endAt,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import {
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";
import invariant from "tiny-invariant";

import { DotMenu, MenuItem } from "~/components/app-menu";
import { Fallback } from "~/components/fallback";
import {
  AlternativeActionRecordData,
  alternativeActionRecordsRef,
  BadHabitData,
  BadHabitRecordData,
  badHabitRecordsRef,
  badHabitsRef,
  mapDoc,
  mapDocs,
  UrgeRecordData,
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
      toast.success("Done urge.");
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

const fmtDate = (d: Date) => format(d, "MM/dd HH:mm");

function BadHabitRecordsView({ badHabit }: { badHabit: WithId<BadHabitData> }) {
  const { authUser } = useAuth();

  const [duration, setDuration] = useLocalStorage<
    "THREE_DAYS" | "FIVE_DAYS" | "SEVEN_DAYS"
  >("BH.bad-habit.records.duration", "THREE_DAYS");

  const endAtDate = useMemo(() => {
    const now = new Date();
    switch (duration) {
      case "THREE_DAYS":
        return subDays(startOfDay(now), 2);
      case "FIVE_DAYS":
        return subDays(startOfDay(now), 4);
      case "SEVEN_DAYS":
        return subDays(startOfDay(now), 6);
      default:
        return subDays(startOfDay(now), 2);
    }
  }, [duration]);

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
          endAt(endAtDate),
        ),
      ).then(mapDocs);
    },
    queryKey: ["me", "bad-habits", badHabit.id, "urge-records", endAtDate],
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
          endAt(endAtDate),
        ),
      ).then(mapDocs);
    },
    queryKey: [
      "me",
      "bad-habits",
      badHabit.id,
      "alternative-action-records",
      endAtDate,
    ],
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
          endAt(endAtDate),
        ),
      ).then(mapDocs);
    },
    queryKey: ["me", "bad-habits", badHabit.id, "bad-habit-records", endAtDate],
  });

  const loading =
    urgeRecordsLoading ||
    alternativeActionRecordsLoading ||
    badHabitRecordsLoading;

  const error =
    urgeRecordsError || alternativeActionRecordsError || badHabitRecordsError;

  return (
    <div className="space-y-6">
      <div className="font-bold">Records view</div>

      <div className="space-x-2">
        <button className="app-link" onClick={() => setDuration("THREE_DAYS")}>
          3 days
        </button>
        <button className="app-link" onClick={() => setDuration("FIVE_DAYS")}>
          5 days
        </button>
        <button className="app-link" onClick={() => setDuration("SEVEN_DAYS")}>
          7 days
        </button>
      </div>

      <Fallback loading={loading} error={error as Error | undefined}>
        {/* Graph */}
        <div className="w-full h-96 ml-[-16px] mr-4">
          <RecordsGraph
            endAtDate={endAtDate}
            urgeRecords={urgeRecords || []}
            alternativeActionRecords={alternativeActionRecords || []}
            badHabitRecords={badHabitRecords || []}
          />
        </div>

        {/* List */}
        <div>
          <div>Urge records</div>
          {urgeRecords?.map((ur) => (
            <UrgeRecordItem key={ur.id} urgeRecord={ur} />
          ))}
        </div>

        <div>
          <div>Alternative action records</div>
          {alternativeActionRecords?.map((aar) => (
            <AlternativeActionRecordItem
              key={aar.id}
              alternativeActionRecord={aar}
            />
          ))}
        </div>

        <div>
          <div>Bad habit records</div>
          {badHabitRecords?.map((bhr) => (
            <BadHabitRecordItem key={bhr.id} badHabitRecord={bhr} />
          ))}
        </div>
      </Fallback>
    </div>
  );
}

function RecordsGraph({
  endAtDate,
  urgeRecords,
  alternativeActionRecords,
  badHabitRecords,
}: {
  endAtDate: Date;
  urgeRecords: WithId<UrgeRecordData>[];
  alternativeActionRecords: WithId<AlternativeActionRecordData>[];
  badHabitRecords: WithId<BadHabitRecordData>[];
}) {
  const dateList = eachDayOfInterval({
    start: endAtDate,
    end: endOfDay(new Date()),
  });

  const unixTimeList = dateList.map((d) => d.getTime());

  const data = [
    ...urgeRecords.map((v) => ({ ...v, type: "urge" })),
    ...alternativeActionRecords,
    ...badHabitRecords,
  ].map((v) => ({
    ...v,
    date: startOfDay(v.createdAt.toDate()).getTime(),
    time:
      v.createdAt.toDate().getTime() -
      startOfDay(v.createdAt.toDate()).getTime(),
  }));

  // console.log(dateList);
  // console.log(data);
  console.log(unixTimeList);

  return (
    <ResponsiveContainer>
      <ScatterChart margin={{ top: 20, right: 20 }}>
        <XAxis
          dataKey="date"
          tickFormatter={(v) =>
            new Intl.DateTimeFormat("ja-JP", {
              day: "2-digit",
            }).format(new Date(v * 1_000))
          }
          ticks={unixTimeList}
        />
        <YAxis
          dataKey="time"
          tickFormatter={(v) => {
            v = v / 1000;
            const h = Math.floor(v / (60 * 60));
            const m = Math.floor(v % 60);
            return (
              h.toString().padStart(2, "0") +
              ":" +
              m.toString().padStart(2, "0")
            );
          }}
        />
        <Scatter data={data} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function UrgeRecordItem({
  urgeRecord,
}: {
  urgeRecord: WithId<UrgeRecordData>;
}) {
  const client = useQueryClient();

  const deleteUrgeRecord = useMutation({
    mutationFn: async () => {
      await deleteDoc(
        doc(
          urgeRecordsRef(urgeRecord.userId, urgeRecord.badHabitId),
          urgeRecord.id,
        ),
      );
    },
    onSuccess: () => {
      toast.success("Deleted.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        urgeRecord.badHabitId,
        "urge-records",
      ]);
    },
  });

  async function onDelete() {
    if (!window.confirm("Are you sure to delete?")) return;
    await deleteUrgeRecord.mutate();
  }

  return (
    <div className="flex justify-between">
      <div>{fmtDate(urgeRecord.createdAt.toDate())}</div>
      <DotMenu>
        <MenuItem onClick={onDelete}>Delete</MenuItem>
      </DotMenu>
    </div>
  );
}

function AlternativeActionRecordItem({
  alternativeActionRecord,
}: {
  alternativeActionRecord: WithId<AlternativeActionRecordData>;
}) {
  const client = useQueryClient();

  const deleteAlternativeActionRecord = useMutation({
    mutationFn: async () => {
      await deleteDoc(
        doc(
          alternativeActionRecordsRef(
            alternativeActionRecord.userId,
            alternativeActionRecord.badHabitId,
          ),
          alternativeActionRecord.id,
        ),
      );
    },
    onSuccess: () => {
      toast.success("Deleted.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        alternativeActionRecord.badHabitId,
        "alternative-action-records",
      ]);
    },
  });

  async function onDelete() {
    if (!window.confirm("Are you sure to delete?")) return;
    await deleteAlternativeActionRecord.mutate();
  }

  return (
    <div className="flex justify-between">
      <div>{fmtDate(alternativeActionRecord.createdAt.toDate())}</div>
      <DotMenu>
        <MenuItem onClick={onDelete}>Delete</MenuItem>
      </DotMenu>
    </div>
  );
}

function BadHabitRecordItem({
  badHabitRecord,
}: {
  badHabitRecord: WithId<BadHabitRecordData>;
}) {
  const client = useQueryClient();

  const deleteBadHabitRecord = useMutation({
    mutationFn: async () => {
      await deleteDoc(
        doc(
          badHabitRecordsRef(badHabitRecord.userId, badHabitRecord.badHabitId),
          badHabitRecord.id,
        ),
      );
    },
    onSuccess: () => {
      toast.success("Deleted.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        badHabitRecord.badHabitId,
        "bad-habit-records",
      ]);
    },
  });

  async function onDelete() {
    if (!window.confirm("Are you sure to delete?")) return;
    await deleteBadHabitRecord.mutate();
  }

  return (
    <div className="flex justify-between">
      <div>{fmtDate(badHabitRecord.createdAt.toDate())}</div>
      <DotMenu>
        <MenuItem onClick={onDelete}>Delete</MenuItem>
      </DotMenu>
    </div>
  );
}

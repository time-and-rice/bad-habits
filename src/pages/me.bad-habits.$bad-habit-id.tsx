import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { endOfDay, subDays } from "date-fns";
import { eachDayOfInterval, format, startOfDay } from "date-fns/esm";
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
import {
  forwardRef,
  Fragment,
  PropsWithChildren,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";
import invariant from "tiny-invariant";
import { z } from "zod";

import { DotMenu, MenuItem } from "~/components/app-menu";
import { ErrorOrNull } from "~/components/error";
import { Fallback } from "~/components/fallback";
import { getFieldErrorMessages, InputField } from "~/components/form";
import {
  BadHabitActionRecordData,
  badHabitActionRecordsRef,
  BadHabitData,
  badHabitsRef,
  mapDoc,
  mapDocs,
  WithId,
} from "~/firebase/firestore";
import { DateTimeFormat, genDate } from "~/lib/date";
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

      <BadHabitAction badHabit={badHabit} />
      <div className="divider" />

      <BadHabitActionRecords badHabit={badHabit} />
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

      <div className="text-right">
        <Link to="edit" className="app-link">
          Edit
        </Link>
      </div>
    </div>
  );
}

function BadHabitAction({ badHabit }: { badHabit: WithId<BadHabitData> }) {
  const [actionType, setActionType] =
    useState<BadHabitActionRecordData["type"]>("urge");

  const modalRef = useRef<HTMLDialogElement>(null);

  function onUrge() {
    setActionType("urge");
    modalRef.current?.showModal();
  }
  function onAlternative() {
    setActionType("alternative");
    modalRef.current?.showModal();
  }
  function onBad() {
    setActionType("bad");
    modalRef.current?.showModal();
  }

  function onClose() {
    modalRef.current?.close();
  }

  return (
    <div className="space-y-6">
      <div className="font-bold">Action</div>

      <div className="flex justify-around">
        <div className="flex flex-col items-center" onClick={onUrge}>
          <button className="btn btn-circle w-20 h-20 btn-warning" />
          <div className="font-semibold">Urge</div>
        </div>

        <div className="flex flex-col items-center">
          <button
            className="btn btn-circle w-20 h-20 btn-success"
            onClick={onAlternative}
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

      <BadHabitActionRecordCreateFormModal
        ref={modalRef}
        badHabit={badHabit}
        actionType={actionType}
        onSubmit={onClose}
      />
    </div>
  );
}

const fmtDate = (d: Date) => format(d, "MM/dd HH:mm");

function BadHabitActionRecords({
  badHabit,
}: {
  badHabit: WithId<BadHabitData>;
}) {
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
    data: badHabitActionRecords,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => {
      return getDocs(
        query(
          badHabitActionRecordsRef(authUser.uid, badHabit.id),
          orderBy("createdAt", "desc"),
          endAt(endAtDate),
        ),
      ).then(mapDocs);
    },
    queryKey: [
      "me",
      "bad-habits",
      badHabit.id,
      "bad-habit-action-records",
      endAtDate,
    ],
  });

  return (
    <div className="space-y-6">
      <div className="font-bold">Action records</div>

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

      <Fallback loading={isLoading} error={error as Error | undefined}>
        {badHabitActionRecords?.length ? (
          <Fragment>
            {/* Graph */}
            <div className="w-full ml-[-16px] mr-4" style={{ height: "75vh" }}>
              <BadHabitActionRecordsGraph
                endAtDate={endAtDate}
                badHabitActionRecords={badHabitActionRecords ?? []}
              />
            </div>

            {/* List */}
            <div>
              <div>List</div>
              {badHabitActionRecords?.map((bhar) => (
                <BadHabitActionRecordItem
                  key={bhar.id}
                  badHabitActionRecord={bhar}
                />
              ))}
            </div>
          </Fragment>
        ) : (
          <div className="font-bold text-center">No Data</div>
        )}
      </Fallback>
    </div>
  );
}

function fmtXTick(n: number) {
  return format(n, "MM/dd");
}

function fmtYTick(n: number) {
  const s = n / 1_000;
  const h = Math.floor(s / (60 * 60));
  const m = Math.floor((s - h * 60 * 60) / 60);
  const hStr = h.toString().padStart(2, "0");
  const mStr = m.toString().padStart(2, "0");
  return `${hStr}:${mStr}`;
}

function BadHabitActionRecordsGraph({
  endAtDate,
  badHabitActionRecords,
}: {
  endAtDate: Date;
  badHabitActionRecords: WithId<BadHabitActionRecordData>[];
}) {
  const dateList = eachDayOfInterval({
    start: endAtDate,
    end: endOfDay(new Date()),
  }).map((v) => v.getTime());

  const data = badHabitActionRecords.map((v) => ({
    ...v,
    date: startOfDay(v.createdAt.toDate()).getTime(),
    time:
      v.createdAt.toDate().getTime() -
      startOfDay(v.createdAt.toDate()).getTime(),
  }));

  const hour = 60 * 60 * 1_000;
  const hours = data.map((v) => Math.floor(v.time / hour) * hour);
  const yTickMin = Math.min(...hours);
  const yTickMax = Math.max(...hours) + hour;
  const yTicks = Array.from({
    length: (yTickMax / hour - yTickMin / hour) * 2 + 1,
  }).map((_, i) => yTickMin + (i * hour) / 2);

  return (
    <ResponsiveContainer>
      <ScatterChart margin={{ top: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="date"
          domain={[
            dateList[0] - 12 * 60 * 60 * 1_000,
            dateList[dateList.length - 1] + 12 * 60 * 60 * 1_000,
          ]}
          ticks={dateList}
          tickFormatter={fmtXTick}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          type="number"
          dataKey="time"
          domain={[yTickMin, yTickMax]}
          ticks={yTicks}
          tickFormatter={fmtYTick}
          tick={{ fontSize: 12 }}
        />
        <Scatter data={data.filter((v) => v.type == "urge")} fill="#fbbd23" />
        <Scatter
          data={data.filter((v) => v.type == "alternative")}
          fill="#36d399"
        />
        <Scatter data={data.filter((v) => v.type == "bad")} fill="#f87272" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function BadHabitActionRecordItem({
  badHabitActionRecord,
}: {
  badHabitActionRecord: WithId<BadHabitActionRecordData>;
}) {
  const client = useQueryClient();

  const deleteUrgeRecord = useMutation({
    mutationFn: async () => {
      await deleteDoc(
        doc(
          badHabitActionRecordsRef(
            badHabitActionRecord.userId,
            badHabitActionRecord.badHabitId,
          ),
          badHabitActionRecord.id,
        ),
      );
    },
    onSuccess: () => {
      toast.success("Deleted.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        badHabitActionRecord.badHabitId,
        "bad-habit-action-records",
      ]);
    },
  });

  async function onDelete() {
    if (!window.confirm("Are you sure to delete?")) return;
    await deleteUrgeRecord.mutate();
  }

  return (
    <div className="flex justify-between">
      <div className="flex items-center space-x-2">
        <div
          className={classNames("badge badge-sm", {
            "badge-warning": badHabitActionRecord.type == "urge",
            "badge-success": badHabitActionRecord.type == "alternative",
            "badge-error": badHabitActionRecord.type == "bad",
          })}
        />
        <div>{fmtDate(badHabitActionRecord.createdAt.toDate())}</div>
      </div>
      <DotMenu>
        <MenuItem onClick={onDelete}>Delete</MenuItem>
      </DotMenu>
    </div>
  );
}

const Modal = forwardRef<HTMLDialogElement, PropsWithChildren>((props, ref) => {
  return (
    <dialog ref={ref} className="modal" id="xxx">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            X
          </button>
        </form>
        {props.children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
});

const BadHabitActionRecordCreateFormSchema = z.object({
  createdAt: z.string(),
});

type BadHabitActionRecordCreateFormSchema = z.infer<
  typeof BadHabitActionRecordCreateFormSchema
>;

const BadHabitActionRecordCreateFormModal = forwardRef<
  HTMLDialogElement,
  {
    badHabit: WithId<BadHabitData>;
    actionType: BadHabitActionRecordData["type"];
    // defaultValue を取らせるか？
    onSubmit: () => void;
  }
>(({ badHabit, actionType, onSubmit }, ref) => {
  const { authUser } = useAuth();
  const client = useQueryClient();

  const createBadHabitRecord = useMutation({
    mutationFn: async ({ createdAt }: BadHabitActionRecordCreateFormSchema) => {
      return await addDoc(badHabitActionRecordsRef(authUser.uid, badHabit.id), {
        type: actionType,
        createdAt: Timestamp.fromDate(new Date(createdAt)),
        userId: authUser.uid,
        badHabitId: badHabit.id,
      });
    },
    onSuccess: () => {
      toast.success("Created.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        badHabit.id,
        "bad-habit-action-records",
      ]);
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors: fieldErrors },
  } = useForm<BadHabitActionRecordCreateFormSchema>({
    resolver: zodResolver(BadHabitActionRecordCreateFormSchema),
    defaultValues: {
      createdAt: DateTimeFormat(genDate()),
    },
  });

  async function thisOnSubmit(v: BadHabitActionRecordCreateFormSchema) {
    await createBadHabitRecord.mutate(v);
    onSubmit();
  }

  return (
    <Modal ref={ref}>
      <div>
        <h2 className="text-center">New Bad Habit Action Record</h2>

        <form className="space-y-4" onSubmit={handleSubmit(thisOnSubmit)}>
          <ErrorOrNull errorMessage={getFieldErrorMessages(fieldErrors)} />

          <InputField
            label="Created at"
            type="datetime-local"
            register={register("createdAt")}
          />

          <div className="space-x-4">
            <button type="submit" className="btn">
              Submit
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
});

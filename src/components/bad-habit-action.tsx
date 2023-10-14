import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, Timestamp } from "firebase/firestore";
import { capitalize } from "lodash-es";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import { useLocalStorage } from "react-use";
import { z } from "zod";

import {
  BadHabitActionRecordData,
  badHabitActionRecordsRef,
  BadHabitData,
  WithId,
} from "~/firebase/firestore";
import { DateTimeFormat, genDate } from "~/lib/date";
import { useAuth } from "~/providers/auth";

import { AppModal } from "./app-modal";
import { ErrorOrNull } from "./error";
import { getFieldErrorMessages, InputField } from "./form";

export function BadHabitAction({
  badHabit,
}: {
  badHabit: WithId<BadHabitData>;
}) {
  const [open, setOpen] = useLocalStorage("BH.bad-habit.action.open", true);

  const [modalShow, setModalShow] = useState(false);
  const [actionType, setActionType] =
    useState<BadHabitActionRecordData["type"]>("urge");

  function onOpen() {
    setModalShow(true);
  }
  function onClose() {
    setModalShow(false);
  }

  function onUrge() {
    setActionType("urge");
    onOpen();
  }
  function onAlternative() {
    setActionType("alternative");
    onOpen();
  }
  function onBad() {
    setActionType("bad");
    onOpen();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div className="font-bold">Action</div>

        {open ? (
          <button onClick={() => setOpen(false)}>
            <FaAngleDown />
          </button>
        ) : (
          <button onClick={() => setOpen(true)}>
            <FaAngleRight />
          </button>
        )}
      </div>

      {open && (
        <Fragment>
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
        </Fragment>
      )}
      <BadHabitActionRecordCreateFormModal
        badHabit={badHabit}
        actionType={actionType}
        show={modalShow}
        onClose={onClose}
      />
    </div>
  );
}

const BadHabitActionRecordCreateFormSchema = z.object({
  createdAt: z.string(),
});

type BadHabitActionRecordCreateFormSchema = z.infer<
  typeof BadHabitActionRecordCreateFormSchema
>;

function BadHabitActionRecordCreateFormModal({
  badHabit,
  actionType,
  show,
  onClose,
}: {
  badHabit: WithId<BadHabitData>;
  actionType: BadHabitActionRecordData["type"];
  show: boolean;
  onClose: () => void;
}) {
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
    setValue,
  } = useForm<BadHabitActionRecordCreateFormSchema>({
    resolver: zodResolver(BadHabitActionRecordCreateFormSchema),
  });

  useEffect(() => {
    if (show) setValue("createdAt", DateTimeFormat(genDate()));
  }, [setValue, show]);

  async function thisOnSubmit(v: BadHabitActionRecordCreateFormSchema) {
    await createBadHabitRecord.mutate(v);
    onClose();
  }

  return (
    <AppModal show={show} onClose={onClose}>
      <div>
        <h2 className="text-center">{`${capitalize(
          actionType,
        )} action record`}</h2>

        <form className="space-y-4" onSubmit={handleSubmit(thisOnSubmit)}>
          <ErrorOrNull errorMessage={getFieldErrorMessages(fieldErrors)} />

          <InputField
            label="Created at"
            type="datetime-local"
            register={register("createdAt")}
          />

          <button type="submit" className="btn block ml-auto">
            Submit
          </button>
        </form>
      </div>
    </AppModal>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { capitalize } from "lodash-es";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  BadHabitActionRecordData,
  BadHabitData,
  WithId,
} from "~/firebase/firestore";
import { useCreateBadHabitActionRecord } from "~/hooks/use-create-bad-habit-action-record";
import { DateTimeFormat, genDate } from "~/lib/date";
import { useAuth } from "~/providers/auth";

import { AppModal } from "./app-modal";
import { ErrorOrNull } from "./error";
import { getFieldErrorMessages, InputField } from "./form";

export const BadHabitActionRecordCreateFormSchema = z.object({
  createdAt: z.string(),
});

export type BadHabitActionRecordCreateFormSchema = z.infer<
  typeof BadHabitActionRecordCreateFormSchema
>;

export function BadHabitActionRecordCreateFormModal({
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

  const createBadHabitActionRecord = useCreateBadHabitActionRecord({
    authUserId: authUser.uid,
    badHabitId: badHabit.id,
    actionType,
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
    await createBadHabitActionRecord.mutate(v);
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

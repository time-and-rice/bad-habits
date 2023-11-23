import { zodResolver } from "@hookform/resolvers/zod";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns";
import {
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
} from "firebase/firestore";
import { Fragment } from "react";
import { get, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import { useLocalStorage } from "react-use";
import { z } from "zod";

import {
  BadHabitCommentData,
  badHabitCommentsRef,
  BadHabitData,
  mapDocs,
  WithId,
} from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

import { DotMenu, MenuItem } from "./app-menu";
import { ErrorOrNull } from "./error";
import { Fallback } from "./fallback";
import { getFieldErrorMessages, TextareaAutosizeField } from "./form";

const fmtDate = (d: Date) => format(d, "MM/dd HH:mm");

export function BadHabitComments({
  badHabit,
}: {
  badHabit: WithId<BadHabitData>;
}) {
  const { authUser } = useAuth();

  const [open, setOpen] = useLocalStorage(
    `BH.bad-habit.${badHabit.id}.comments.open`,
    true,
  );

  const { data, isLoading, error, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["me", "bad-habits", badHabit.id, "bad-habit-comments"],
      queryFn: async ({ pageParam = Timestamp.now() }) => {
        return getDocs(
          query(
            badHabitCommentsRef(authUser.uid, badHabit.id),
            orderBy("createdAt", "desc"),
            startAfter(pageParam),
            limit(10),
          ),
        ).then(mapDocs);
      },
      getNextPageParam: (lastPage) => {
        return lastPage.at(-1)?.createdAt;
      },
    });

  const badHabitComments = data?.pages.flatMap((v) => v);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div
          className="font-bold cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          Comments
        </div>

        <button onClick={() => setOpen(!open)}>
          {open ? <FaAngleDown /> : <FaAngleRight />}
        </button>
      </div>

      {open && (
        <Fragment>
          <BadHabitCommentCreateForm badHabit={badHabit} />

          <Fallback loading={isLoading} error={error as Error | undefined}>
            {badHabitComments?.length ? (
              <div className="space-y-2">
                {badHabitComments.map((bhc) => (
                  <BadHabitCommentItem key={bhc.id} badHabitComment={bhc} />
                ))}
                {hasNextPage && (
                  <div className="flex justify-center">
                    <button
                      className="app-link"
                      onClick={() => fetchNextPage()}
                    >
                      More
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </Fallback>
        </Fragment>
      )}
    </div>
  );
}

const BadHabitCommentCreateFormSchema = z.object({
  content: z.string().trim().min(1),
});

type BadHabitCommentCreateFormSchema = z.infer<
  typeof BadHabitCommentCreateFormSchema
>;

function BadHabitCommentCreateForm({
  badHabit,
}: {
  badHabit: WithId<BadHabitData>;
}) {
  const { authUser } = useAuth();
  const client = useQueryClient();

  const createBadHabitComment = useMutation({
    mutationFn: async ({ content }: BadHabitCommentCreateFormSchema) => {
      const newBadHabitCommentData: BadHabitCommentData = {
        content,
        createdAt: Timestamp.now(),
        userId: authUser.uid,
        badHabitId: badHabit.id,
      };
      const { id } = await addDoc(
        badHabitCommentsRef(authUser.uid, badHabit.id),
        newBadHabitCommentData,
      );
      return { id, ...newBadHabitCommentData };
    },
    onSuccess: () => {
      toast.success("Created.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        badHabit.id,
        "bad-habit-comments",
      ]);
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors: fieldErrors },
    reset,
  } = useForm<BadHabitCommentCreateFormSchema>({
    resolver: zodResolver(BadHabitCommentCreateFormSchema),
  });

  return (
    <form
      className="flex flex-col space-y-4"
      onSubmit={handleSubmit(async (v) => {
        await createBadHabitComment.mutate(v);
        reset();
      })}
    >
      <ErrorOrNull errorMessage={getFieldErrorMessages(fieldErrors)} />
      <ErrorOrNull errorMessage={get(createBadHabitComment, "error.message")} />

      <TextareaAutosizeField
        required
        minRows={2}
        register={register("content")}
      />

      <button type="submit" className="self-end btn btn-sm">
        Submit
      </button>
    </form>
  );
}

function BadHabitCommentItem({
  badHabitComment,
}: {
  badHabitComment: WithId<BadHabitCommentData>;
}) {
  const { authUser } = useAuth();
  const client = useQueryClient();

  const deleteBadHabitComment = useMutation({
    mutationFn: async () => {
      await deleteDoc(
        doc(
          badHabitCommentsRef(authUser.uid, badHabitComment.badHabitId),
          badHabitComment.id,
        ),
      );
      return badHabitComment.id;
    },
    onSuccess: () => {
      toast.success("Deleted.");
      client.invalidateQueries([
        "me",
        "bad-habits",
        badHabitComment.badHabitId,
        "bad-habit-comments",
      ]);
    },
  });

  async function onDelete() {
    if (!window.confirm("Are you sure to delete?")) return;
    await deleteBadHabitComment.mutate();
  }

  return (
    <div>
      <div className="flex justify-between">
        <div>{fmtDate(badHabitComment.createdAt.toDate())}</div>
        <DotMenu>
          <MenuItem onClick={onDelete}>Delete</MenuItem>
        </DotMenu>
      </div>
      <div>{badHabitComment.content}</div>
    </div>
  );
}

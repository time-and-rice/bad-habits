import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { Fragment } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { DotMenu, MenuItem } from "~/components/app-menu";
import { badHabitsRef, mapDocs } from "~/firebase/firestore";
import { useAuth } from "~/providers/auth";

export default function BadHabits() {
  const { authUser } = useAuth();
  const client = useQueryClient();

  const { data: badHabits } = useQuery({
    queryFn: () => {
      return getDocs(
        query(badHabitsRef(authUser.uid), orderBy("createdAt", "desc")),
      ).then(mapDocs);
    },
    queryKey: ["me", "bad-habits"],
  });

  const deleteBadHabit = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(badHabitsRef(authUser.uid), id));
    },
    onSuccess: () => {
      client.invalidateQueries(["me", "bad-habits"]);
      toast.success("Deleted.");
    },
  });

  return (
    <div>
      <h1 className="text-center">Bad Habits</h1>

      <div className="flex flex-col space-y-4">
        <Link to="new" className="app-link self-end">
          New
        </Link>

        {badHabits && badHabits.length > 0 ? (
          <div>
            {badHabits.map((bh) => (
              <Fragment key={bh.id}>
                <div className="flex justify-between items-center">
                  <Link className="app-link flex-1" to={bh.id}>
                    {bh.name}
                  </Link>
                  <DotMenu>
                    <MenuItem to={`${bh.id}/edit`}>Edit</MenuItem>
                    <MenuItem
                      onClick={async () => {
                        if (!window.confirm("Are you sure to delete?")) return;
                        await deleteBadHabit.mutate(bh.id);
                      }}
                    >
                      Delete
                    </MenuItem>
                  </DotMenu>
                </div>
                <div className="divider" />
              </Fragment>
            ))}
          </div>
        ) : (
          <div className="text-center font-bold">No Data</div>
        )}
      </div>
    </div>
  );
}

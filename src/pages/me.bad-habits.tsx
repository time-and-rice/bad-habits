import { Fragment } from "react";
import { Link } from "react-router-dom";

import { DotMenu, MenuItem } from "~/components/app-menu";
import { Fallback } from "~/components/fallback";
import { useBadHabits } from "~/hooks/use-bad-habits";
import { useDeleteBadHabit } from "~/hooks/use-delete-bad-habit";

export default function BadHabits() {
  const { badHabits, isLoading, error } = useBadHabits();

  const deleteBadHabit = useDeleteBadHabit();

  return (
    <div>
      <h1 className="text-center">Bad Habits</h1>

      <div className="flex flex-col space-y-4">
        <Link to="new" className="app-link self-end">
          New
        </Link>

        <Fallback loading={isLoading} error={error as Error}>
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
                          if (!window.confirm("Are you sure to delete?"))
                            return;
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
            <div className="font-bold text-center">No Data</div>
          )}
        </Fallback>
      </div>
    </div>
  );
}

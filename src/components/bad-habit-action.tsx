import { Fragment, useState } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import { useLocalStorage } from "react-use";

import {
  BadHabitActionRecordData,
  BadHabitData,
  WithId,
} from "~/firebase/firestore";

import { BadHabitActionRecordCreateFormModal } from "./bad-habit-action-record-create-form-modal";

export function BadHabitAction({
  badHabit,
}: {
  badHabit: WithId<BadHabitData>;
}) {
  const [open, setOpen] = useLocalStorage(
    `BH.bad-habit.${badHabit.id}.action.open`,
    true,
  );

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
        <div
          className="font-bold cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          Action
        </div>

        <button onClick={() => setOpen(!open)}>
          {open ? <FaAngleDown /> : <FaAngleRight />}
        </button>
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
